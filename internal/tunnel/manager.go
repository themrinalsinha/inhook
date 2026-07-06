// Package tunnel manages an embedded frp client that exposes the local
// webhook ingestion endpoint (/webhook/...) on a public subdomain.
package tunnel

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/zerodha/logf"
)

type State string

const (
	StateDisabled   State = "disabled"
	StateConnecting State = "connecting"
	StateConnected  State = "connected"
	StateError      State = "error"
)

// maxSlugAttempts caps how many subdomains a single Start session tries when
// frps reports the subdomain as taken.
const maxSlugAttempts = 3

// Config carries the tunnel settings resolved from the app config.
type Config struct {
	ServerAddr string // frps control host
	ServerPort int    // frps control port
	AuthToken  string // frps auth token
	Domain     string // vhost subdomain host used to build the public URL
	Scheme     string // scheme of the public URL (https in production)
	LocalPort  int    // local inhook port the tunnel forwards to
}

// Status is the JSON-friendly snapshot served by the tunnel API.
type Status struct {
	State      State  `json:"state"`
	PublicHost string `json:"public_host,omitempty"`
	Error      string `json:"error,omitempty"`
	Server     string `json:"server,omitempty"`
}

// SlugStore persists the subdomain slug so the public URL is stable across
// restarts.
type SlugStore interface {
	Load() (string, error)
	Save(slug string) error
}

// frpRunner is the seam between the manager and the embedded frp client.
type frpRunner interface {
	Run(ctx context.Context) error
	Close()
	ProxyStatus(name string) (phase, errMsg string, ok bool)
}

type Manager struct {
	mu           sync.Mutex
	cfg          Config
	store        SlugStore
	lo           *logf.Logger
	newRunner    func(cfg Config, slug string, failFast bool) (frpRunner, error)
	pollInterval time.Duration

	state         State
	lastErr       string
	slug          string
	attempts      int
	failFast      bool
	runner        frpRunner
	runnerCancel  context.CancelFunc
	sessionCancel context.CancelFunc
	watchDone     chan struct{}
}

func NewManager(cfg Config, store SlugStore, lo *logf.Logger) *Manager {
	return &Manager{
		cfg:          cfg,
		store:        store,
		lo:           lo,
		newRunner:    newFRPRunner,
		pollInterval: time.Second,
		state:        StateDisabled,
	}
}

// Start brings the tunnel up. failFast makes the first login failure abort
// instead of retrying quietly (used for UI-triggered starts).
func (m *Manager) Start(failFast bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.state == StateConnecting || m.state == StateConnected {
		return nil
	}
	// A previous session may still linger in error state; clear it out.
	m.teardownLocked()

	if m.slug == "" {
		slug, err := m.store.Load()
		if err != nil {
			return m.failLocked(fmt.Errorf("loading tunnel subdomain: %w", err))
		}
		if slug == "" {
			slug = generateSlug()
			if err := m.store.Save(slug); err != nil {
				return m.failLocked(fmt.Errorf("saving tunnel subdomain: %w", err))
			}
		}
		m.slug = slug
	}

	m.attempts = 1
	m.failFast = failFast
	runner, err := m.newRunner(m.cfg, m.slug, failFast)
	if err != nil {
		return m.failLocked(fmt.Errorf("starting tunnel client: %w", err))
	}

	sessionCtx, sessionCancel := context.WithCancel(context.Background())
	runnerCtx, runnerCancel := context.WithCancel(sessionCtx)
	m.runner = runner
	m.runnerCancel = runnerCancel
	m.sessionCancel = sessionCancel
	m.watchDone = make(chan struct{})
	m.state = StateConnecting
	m.lastErr = ""

	m.logInfo(fmt.Sprintf("Starting tunnel to %s:%d as %s", m.cfg.ServerAddr, m.cfg.ServerPort, m.slug))
	go m.runLoop(runner, runnerCtx)
	go m.watch(sessionCtx, m.watchDone)
	return nil
}

// Stop tears the tunnel down.
func (m *Manager) Stop() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.state == StateDisabled {
		return nil
	}
	m.teardownLocked()
	m.state = StateDisabled
	m.lastErr = ""
	m.logInfo("Tunnel stopped")
	return nil
}

// Status returns a snapshot of the tunnel state.
func (m *Manager) Status() Status {
	m.mu.Lock()
	defer m.mu.Unlock()

	status := Status{
		State:  m.state,
		Server: fmt.Sprintf("%s:%d", m.cfg.ServerAddr, m.cfg.ServerPort),
	}
	if m.state == StateConnected {
		status.PublicHost = m.publicHostLocked()
	}
	if m.state == StateError {
		status.Error = m.lastErr
	}
	return status
}

// Shutdown stops the tunnel during graceful app shutdown and waits for its
// goroutines to wind down (bounded by ctx).
func (m *Manager) Shutdown(ctx context.Context) {
	m.mu.Lock()
	done := m.watchDone
	m.mu.Unlock()

	m.Stop()
	if done != nil {
		select {
		case <-done:
		case <-ctx.Done():
		}
	}
}

// runLoop owns a single frp client run; it only reports errors while its
// runner is still the current one.
func (m *Manager) runLoop(runner frpRunner, ctx context.Context) {
	err := runner.Run(ctx)

	m.mu.Lock()
	defer m.mu.Unlock()
	if ctx.Err() != nil || m.runner != runner {
		return
	}
	if err == nil {
		err = errors.New("tunnel client exited unexpectedly")
	}
	m.state = StateError
	m.lastErr = err.Error()
	m.logError(fmt.Sprintf("Tunnel client stopped: %v", err))
}

// watch polls the frp proxy status and drives the state machine.
func (m *Manager) watch(sessionCtx context.Context, done chan struct{}) {
	defer close(done)
	ticker := time.NewTicker(m.pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-sessionCtx.Done():
			return
		case <-ticker.C:
		}

		m.mu.Lock()
		if sessionCtx.Err() != nil || m.runner == nil {
			m.mu.Unlock()
			return
		}
		runner, slug := m.runner, m.slug
		m.mu.Unlock()

		phase, errMsg, ok := runner.ProxyStatus(proxyName(slug))

		m.mu.Lock()
		if sessionCtx.Err() != nil {
			m.mu.Unlock()
			return
		}
		if m.runner != runner {
			// Relaunched under our feet; poll the new runner next tick.
			m.mu.Unlock()
			continue
		}
		switch {
		case !ok:
			// Control connection not (or no longer) established. Only
			// degrade from connected; error states must stay visible.
			if m.state == StateConnected {
				m.state = StateConnecting
			}
		case phase == "running":
			if m.state != StateConnected {
				m.logInfo(fmt.Sprintf("Tunnel connected: %s", m.publicHostLocked()))
			}
			m.state = StateConnected
			m.lastErr = ""
		case phase == "start error" && isConflictError(errMsg):
			m.handleConflictLocked(sessionCtx)
		case phase == "start error":
			m.state = StateError
			m.lastErr = errMsg
		case phase == "closed":
			if m.state == StateConnected {
				m.state = StateConnecting
			}
		}
		m.mu.Unlock()
	}
}

// handleConflictLocked reacts to frps rejecting our subdomain: regenerate the
// slug and relaunch, giving up after maxSlugAttempts.
func (m *Manager) handleConflictLocked(sessionCtx context.Context) {
	if m.attempts >= maxSlugAttempts {
		m.teardownRunnerLocked()
		m.state = StateError
		m.lastErr = fmt.Sprintf(
			"subdomain conflict: gave up after %d attempts", m.attempts,
		)
		m.logError(m.lastErr)
		return
	}

	m.attempts++
	slug := generateSlug()
	if err := m.store.Save(slug); err != nil {
		m.teardownRunnerLocked()
		m.state = StateError
		m.lastErr = fmt.Sprintf("saving tunnel subdomain: %v", err)
		return
	}
	m.slug = slug
	m.logInfo(fmt.Sprintf("Tunnel subdomain taken, retrying as %s", slug))

	m.teardownRunnerLocked()
	runner, err := m.newRunner(m.cfg, slug, m.failFast)
	if err != nil {
		m.state = StateError
		m.lastErr = err.Error()
		return
	}
	runnerCtx, runnerCancel := context.WithCancel(sessionCtx)
	m.runner = runner
	m.runnerCancel = runnerCancel
	m.state = StateConnecting
	go m.runLoop(runner, runnerCtx)
}

// failLocked records a start failure and returns the error.
func (m *Manager) failLocked(err error) error {
	m.state = StateError
	m.lastErr = err.Error()
	m.logError(m.lastErr)
	return err
}

// teardownRunnerLocked stops just the frp client, keeping the session alive.
func (m *Manager) teardownRunnerLocked() {
	if m.runnerCancel != nil {
		m.runnerCancel()
		m.runnerCancel = nil
	}
	if m.runner != nil {
		m.runner.Close()
		m.runner = nil
	}
}

// teardownLocked stops the frp client and the watcher session.
func (m *Manager) teardownLocked() {
	if m.sessionCancel != nil {
		m.sessionCancel()
		m.sessionCancel = nil
	}
	m.teardownRunnerLocked()
	m.watchDone = nil
}

func (m *Manager) publicHostLocked() string {
	return fmt.Sprintf("%s://%s.%s", m.cfg.Scheme, m.slug, m.cfg.Domain)
}

func (m *Manager) logInfo(msg string) {
	if m.lo != nil {
		m.lo.Info(msg)
	}
}

func (m *Manager) logError(msg string) {
	if m.lo != nil {
		m.lo.Error(msg)
	}
}

// isConflictError reports whether frps rejected the registration because our
// slug-derived identity is taken by someone else: either the vhost route
// ("router config conflict") or, since the proxy name embeds the slug, the
// proxy name itself ("already exists"). Both are cured by a new slug.
func isConflictError(errMsg string) bool {
	return strings.Contains(errMsg, "router config conflict") ||
		strings.Contains(errMsg, "already exists")
}

func proxyName(slug string) string {
	return "inhook-" + slug
}

func generateSlug() string {
	return uuid.NewString()[:8]
}
