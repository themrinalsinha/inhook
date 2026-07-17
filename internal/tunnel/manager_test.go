package tunnel

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"testing"
	"time"
)

// fakeRunner is a controllable stand-in for the embedded frp client.
type fakeRunner struct {
	mu     sync.Mutex
	phase  string
	errMsg string
	ok     bool
	runErr error
	closed bool
}

func (f *fakeRunner) Run(ctx context.Context) error {
	f.mu.Lock()
	err := f.runErr
	f.mu.Unlock()
	if err != nil {
		return err
	}
	<-ctx.Done()
	return nil
}

func (f *fakeRunner) Close() {
	f.mu.Lock()
	f.closed = true
	f.mu.Unlock()
}

func (f *fakeRunner) ProxyStatus(name string) (string, string, bool) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.phase, f.errMsg, f.ok
}

func (f *fakeRunner) setStatus(phase, errMsg string, ok bool) {
	f.mu.Lock()
	f.phase = phase
	f.errMsg = errMsg
	f.ok = ok
	f.mu.Unlock()
}

func (f *fakeRunner) isClosed() bool {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.closed
}

// fakeStore is an in-memory SlugStore.
type fakeStore struct {
	mu   sync.Mutex
	slug string
}

func (s *fakeStore) Load() (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.slug, nil
}

func (s *fakeStore) Save(slug string) error {
	s.mu.Lock()
	s.slug = slug
	s.mu.Unlock()
	return nil
}

func (s *fakeStore) current() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.slug
}

// runnerFactory tracks every runner the manager creates.
type runnerFactory struct {
	mu       sync.Mutex
	runners  []*fakeRunner
	slugs    []string
	failFast []bool
}

func (rf *runnerFactory) new(cfg Config, slug string, failFast bool) (frpRunner, error) {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	runner := &fakeRunner{}
	rf.runners = append(rf.runners, runner)
	rf.slugs = append(rf.slugs, slug)
	rf.failFast = append(rf.failFast, failFast)
	return runner, nil
}

func (rf *runnerFactory) count() int {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	return len(rf.runners)
}

func (rf *runnerFactory) runner(i int) *fakeRunner {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	return rf.runners[i]
}

func (rf *runnerFactory) slug(i int) string {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	return rf.slugs[i]
}

func testConfig() Config {
	return Config{
		ServerAddr: "t.example.com",
		ServerPort: 9090,
		AuthToken:  "test-token",
		Domain:     "t.example.com",
		Scheme:     "https",
		LocalPort:  9000,
	}
}

func newTestManager(t *testing.T, store *fakeStore) (*Manager, *runnerFactory) {
	t.Helper()
	factory := &runnerFactory{}
	m := NewManager(testConfig(), store, nil)
	m.newRunner = factory.new
	m.pollInterval = 5 * time.Millisecond
	t.Cleanup(func() { m.Stop() })
	return m, factory
}

func waitFor(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if cond() {
			return
		}
		time.Sleep(2 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %s", what)
}

func waitForState(t *testing.T, m *Manager, state State) {
	t.Helper()
	waitFor(t, fmt.Sprintf("state %s (last: %+v)", state, m.Status()), func() bool {
		return m.Status().State == state
	})
}

func TestStartTransitionsConnectingToConnected(t *testing.T) {
	store := &fakeStore{}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	if got := m.Status().State; got != StateConnecting {
		t.Errorf("expected state connecting right after start, got %s", got)
	}

	waitFor(t, "runner created", func() bool { return factory.count() == 1 })
	factory.runner(0).setStatus("running", "", true)
	waitForState(t, m, StateConnected)

	status := m.Status()
	wantHost := "https://" + store.current() + ".t.example.com"
	if status.PublicHost != wantHost {
		t.Errorf("expected public host %q, got %q", wantHost, status.PublicHost)
	}
	if status.Server != "t.example.com:9090" {
		t.Errorf("expected server t.example.com:9090, got %q", status.Server)
	}
	if status.Error != "" {
		t.Errorf("expected no error, got %q", status.Error)
	}
}

func TestSlugGeneratedAndPersistedWhenAbsent(t *testing.T) {
	store := &fakeStore{}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}

	slug := store.current()
	if len(slug) != 8 {
		t.Fatalf("expected 8-char slug persisted, got %q", slug)
	}
	waitFor(t, "runner created", func() bool { return factory.count() == 1 })
	if factory.slug(0) != slug {
		t.Errorf("runner got slug %q, store has %q", factory.slug(0), slug)
	}
}

func TestSlugReusedFromStore(t *testing.T) {
	store := &fakeStore{slug: "cafe1234"}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}

	waitFor(t, "runner created", func() bool { return factory.count() == 1 })
	if factory.slug(0) != "cafe1234" {
		t.Errorf("expected stored slug cafe1234 to be reused, got %q", factory.slug(0))
	}
	factory.runner(0).setStatus("running", "", true)
	waitForState(t, m, StateConnected)
	if !strings.HasPrefix(m.Status().PublicHost, "https://cafe1234.") {
		t.Errorf("expected public host for cafe1234, got %q", m.Status().PublicHost)
	}
}

func TestConflictRegeneratesSlug(t *testing.T) {
	store := &fakeStore{slug: "cafe1234"}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	waitFor(t, "first runner", func() bool { return factory.count() == 1 })
	factory.runner(0).setStatus("start error", "start error: router config conflict", true)

	waitFor(t, "second runner after conflict", func() bool { return factory.count() == 2 })
	if !factory.runner(0).isClosed() {
		t.Error("expected first runner to be closed after conflict")
	}
	newSlug := factory.slug(1)
	if newSlug == "cafe1234" {
		t.Error("expected a regenerated slug, got the conflicting one again")
	}
	if store.current() != newSlug {
		t.Errorf("expected new slug %q persisted, store has %q", newSlug, store.current())
	}

	factory.runner(1).setStatus("running", "", true)
	waitForState(t, m, StateConnected)
	if !strings.Contains(m.Status().PublicHost, newSlug) {
		t.Errorf("expected public host with new slug %q, got %q", newSlug, m.Status().PublicHost)
	}
}

func TestNameCollisionRegeneratesSlug(t *testing.T) {
	// When another client already holds our slug, frps can reject the
	// slug-derived proxy NAME ("already exists") before the vhost router
	// ever reports "router config conflict". Both must regenerate.
	store := &fakeStore{slug: "bac4ba80"}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	waitFor(t, "first runner", func() bool { return factory.count() == 1 })
	factory.runner(0).setStatus(
		"start error", "start proxy [inhook-bac4ba80] error: proxy [inhook-bac4ba80] already exists", true,
	)

	waitFor(t, "second runner after name collision", func() bool { return factory.count() == 2 })
	if factory.slug(1) == "bac4ba80" {
		t.Error("expected a regenerated slug after name collision")
	}
	factory.runner(1).setStatus("running", "", true)
	waitForState(t, m, StateConnected)
}

func TestConflictCapStopsAfterThreeAttempts(t *testing.T) {
	store := &fakeStore{}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	for i := 0; i < 3; i++ {
		idx := i
		waitFor(t, fmt.Sprintf("runner %d", idx+1), func() bool { return factory.count() == idx+1 })
		factory.runner(idx).setStatus("start error", "router config conflict", true)
		if idx < 2 {
			waitFor(t, "relaunch", func() bool { return factory.count() == idx+2 })
		}
	}

	waitForState(t, m, StateError)
	if factory.count() != 3 {
		t.Errorf("expected exactly 3 attempts, got %d", factory.count())
	}
	if msg := m.Status().Error; !strings.Contains(msg, "conflict") {
		t.Errorf("expected conflict in error message, got %q", msg)
	}
}

func TestNonConflictStartErrorSurfacesAndRecovers(t *testing.T) {
	store := &fakeStore{}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	waitFor(t, "runner created", func() bool { return factory.count() == 1 })
	factory.runner(0).setStatus("start error", "proxy rejected", true)

	waitForState(t, m, StateError)
	if msg := m.Status().Error; !strings.Contains(msg, "proxy rejected") {
		t.Errorf("expected surfaced error message, got %q", msg)
	}
	if factory.count() != 1 {
		t.Fatalf("expected no relaunch for non-conflict error, got %d runners", factory.count())
	}
	if factory.runner(0).isClosed() {
		t.Error("runner should be kept alive to allow frp's automatic retry")
	}

	// frp retries NewProxy every 30s; if it later succeeds the manager must
	// recover to connected.
	factory.runner(0).setStatus("running", "", true)
	waitForState(t, m, StateConnected)
}

func TestFailFastLoginErrorSetsErrorState(t *testing.T) {
	store := &fakeStore{}
	factory := &runnerFactory{}
	m := NewManager(testConfig(), store, nil)
	m.pollInterval = 5 * time.Millisecond
	m.newRunner = func(cfg Config, slug string, failFast bool) (frpRunner, error) {
		runner := &fakeRunner{runErr: errors.New("login to the server failed: token mismatch")}
		factory.mu.Lock()
		factory.runners = append(factory.runners, runner)
		factory.mu.Unlock()
		return runner, nil
	}
	t.Cleanup(func() { m.Stop() })

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	waitForState(t, m, StateError)
	if msg := m.Status().Error; !strings.Contains(msg, "token mismatch") {
		t.Errorf("expected login error surfaced, got %q", msg)
	}
}

func TestStopDisablesAndIsIdempotent(t *testing.T) {
	store := &fakeStore{}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	waitFor(t, "runner created", func() bool { return factory.count() == 1 })
	factory.runner(0).setStatus("running", "", true)
	waitForState(t, m, StateConnected)

	if err := m.Stop(); err != nil {
		t.Fatalf("stop failed: %v", err)
	}
	status := m.Status()
	if status.State != StateDisabled {
		t.Errorf("expected disabled after stop, got %s", status.State)
	}
	if status.PublicHost != "" {
		t.Errorf("expected no public host after stop, got %q", status.PublicHost)
	}
	if !factory.runner(0).isClosed() {
		t.Error("expected runner closed on stop")
	}
	if err := m.Stop(); err != nil {
		t.Fatalf("second stop should be a no-op, got %v", err)
	}
}

func TestStartIsIdempotentWhileActive(t *testing.T) {
	store := &fakeStore{}
	m, factory := newTestManager(t, store)

	if err := m.Start(true); err != nil {
		t.Fatalf("start failed: %v", err)
	}
	if err := m.Start(true); err != nil {
		t.Fatalf("second start should be a no-op, got %v", err)
	}
	// Give any erroneous second launch a moment to appear.
	time.Sleep(20 * time.Millisecond)
	if factory.count() != 1 {
		t.Errorf("expected a single runner for repeated starts, got %d", factory.count())
	}
}

func TestConcurrentStartStop(t *testing.T) {
	store := &fakeStore{}
	m, _ := newTestManager(t, store)

	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			for j := 0; j < 25; j++ {
				if (n+j)%2 == 0 {
					m.Start(true)
				} else {
					m.Stop()
				}
				m.Status()
			}
		}(i)
	}
	wg.Wait()
}
