package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/themrinalsinha/inhook/internal/tunnel"
)

type fakeTunnel struct {
	mu           sync.Mutex
	status       tunnel.Status
	startErr     error
	starts       int
	stops        int
	lastFailFast bool
}

func (f *fakeTunnel) Start(failFast bool) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.starts++
	f.lastFailFast = failFast
	if f.startErr != nil {
		return f.startErr
	}
	f.status.State = tunnel.StateConnecting
	return nil
}

func (f *fakeTunnel) Stop() error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.stops++
	f.status.State = tunnel.StateDisabled
	f.status.PublicHost = ""
	return nil
}

func (f *fakeTunnel) Status() tunnel.Status {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.status
}

func (f *fakeTunnel) counts() (starts, stops int) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.starts, f.stops
}

func newTestServerWithTunnel(t *testing.T, tc tunnelController) *httptest.Server {
	t.Helper()

	app := &App{
		db:     newTestDB(t),
		lo:     initLogger("test"),
		hub:    NewHub(),
		tunnel: tc,
	}
	server := httptest.NewServer(initHandlers(app))
	t.Cleanup(server.Close)
	return server
}

func decodeTunnelStatus(t *testing.T, resp *http.Response) tunnel.Status {
	t.Helper()

	if ct := resp.Header.Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %q", ct)
	}
	var status tunnel.Status
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		t.Fatalf("failed to decode tunnel status: %v", err)
	}
	return status
}

func TestTunnelStatusEndpointReturnsSnapshot(t *testing.T) {
	ft := &fakeTunnel{status: tunnel.Status{
		State:      tunnel.StateConnected,
		PublicHost: "https://ab12cd34.t.example.com",
		Server:     "t.example.com:9090",
	}}
	server := newTestServerWithTunnel(t, ft)

	resp, err := http.Get(server.URL + "/api/tunnel/status/")
	if err != nil {
		t.Fatalf("failed to get tunnel status: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	status := decodeTunnelStatus(t, resp)
	if status.State != tunnel.StateConnected {
		t.Errorf("expected connected, got %s", status.State)
	}
	if status.PublicHost != "https://ab12cd34.t.example.com" {
		t.Errorf("unexpected public host %q", status.PublicHost)
	}
	if status.Server != "t.example.com:9090" {
		t.Errorf("unexpected server %q", status.Server)
	}
}

func TestTunnelStartEndpointStartsFailFast(t *testing.T) {
	ft := &fakeTunnel{}
	server := newTestServerWithTunnel(t, ft)

	resp, err := http.Post(server.URL+"/api/tunnel/start/", "application/json", nil)
	if err != nil {
		t.Fatalf("failed to post tunnel start: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	starts, _ := ft.counts()
	if starts != 1 {
		t.Errorf("expected 1 start call, got %d", starts)
	}
	if !ft.lastFailFast {
		t.Error("UI-triggered start must use failFast so errors surface quickly")
	}
	if status := decodeTunnelStatus(t, resp); status.State != tunnel.StateConnecting {
		t.Errorf("expected connecting snapshot, got %s", status.State)
	}
}

func TestTunnelStartEndpointReportsFailure(t *testing.T) {
	ft := &fakeTunnel{startErr: errors.New("frps unreachable")}
	server := newTestServerWithTunnel(t, ft)

	resp, err := http.Post(server.URL+"/api/tunnel/start/", "application/json", nil)
	if err != nil {
		t.Fatalf("failed to post tunnel start: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", resp.StatusCode)
	}

	var body struct {
		Error string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode error body: %v", err)
	}
	if body.Error != "frps unreachable" {
		t.Errorf("expected error message surfaced, got %q", body.Error)
	}
}

func TestTunnelStopEndpointStops(t *testing.T) {
	ft := &fakeTunnel{status: tunnel.Status{
		State:      tunnel.StateConnected,
		PublicHost: "https://ab12cd34.t.example.com",
	}}
	server := newTestServerWithTunnel(t, ft)

	resp, err := http.Post(server.URL+"/api/tunnel/stop/", "application/json", nil)
	if err != nil {
		t.Fatalf("failed to post tunnel stop: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	_, stops := ft.counts()
	if stops != 1 {
		t.Errorf("expected 1 stop call, got %d", stops)
	}
	if status := decodeTunnelStatus(t, resp); status.State != tunnel.StateDisabled {
		t.Errorf("expected disabled snapshot, got %s", status.State)
	}
}

func TestLocalPortFromAddr(t *testing.T) {
	cases := []struct {
		addr    string
		want    int
		wantErr bool
	}{
		{":9000", 9000, false},
		{"127.0.0.1:8080", 8080, false},
		{"9000", 0, true},
		{"", 0, true},
	}
	for _, c := range cases {
		got, err := localPortFromAddr(c.addr)
		if c.wantErr {
			if err == nil {
				t.Errorf("localPortFromAddr(%q): expected error, got %d", c.addr, got)
			}
			continue
		}
		if err != nil {
			t.Errorf("localPortFromAddr(%q): unexpected error %v", c.addr, err)
			continue
		}
		if got != c.want {
			t.Errorf("localPortFromAddr(%q) = %d, want %d", c.addr, got, c.want)
		}
	}
}

func TestTunnelSlugStoreRoundtrip(t *testing.T) {
	store := tunnelSlugStore{svc: DBService{db: newTestDB(t)}}

	slug, err := store.Load()
	if err != nil {
		t.Fatalf("load on empty store failed: %v", err)
	}
	if slug != "" {
		t.Fatalf("expected empty slug initially, got %q", slug)
	}

	if err := store.Save("k3x9f2aa"); err != nil {
		t.Fatalf("save failed: %v", err)
	}
	slug, err = store.Load()
	if err != nil {
		t.Fatalf("load after save failed: %v", err)
	}
	if slug != "k3x9f2aa" {
		t.Errorf("expected k3x9f2aa, got %q", slug)
	}
}
