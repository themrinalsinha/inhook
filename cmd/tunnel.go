package main

import (
	"encoding/json"
	"net"
	"net/http"
	"strconv"

	"github.com/themrinalsinha/inhook/internal/tunnel"
)

// tunnelController is the slice of tunnel.Manager the handlers need; tests
// substitute a fake.
type tunnelController interface {
	Start(failFast bool) error
	Stop() error
	Status() tunnel.Status
}

// tunnelSlugStore adapts DBService to the tunnel.SlugStore interface.
type tunnelSlugStore struct {
	svc DBService
}

func (s tunnelSlugStore) Load() (string, error) {
	return s.svc.GetSetting("tunnel_subdomain")
}

func (s tunnelSlugStore) Save(slug string) error {
	return s.svc.SetSetting("tunnel_subdomain", slug)
}

// localPortFromAddr extracts the port number from a listen address like
// ":9000" so the tunnel knows where to forward traffic.
func localPortFromAddr(addr string) (int, error) {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(port)
}

func writeTunnelStatus(w http.ResponseWriter, status tunnel.Status) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(status)
}

func writeTunnelError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func tunnelStatusHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeTunnelStatus(w, app.tunnel.Status())
	}
}

func tunnelStartHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		app.lo.Info("Starting tunnel")
		// failFast: a UI-triggered start should surface a bad server or
		// token immediately instead of retrying in the background.
		if err := app.tunnel.Start(true); err != nil {
			writeTunnelError(w, err)
			return
		}
		writeTunnelStatus(w, app.tunnel.Status())
	}
}

func tunnelStopHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		app.lo.Info("Stopping tunnel")
		if err := app.tunnel.Stop(); err != nil {
			writeTunnelError(w, err)
			return
		}
		writeTunnelStatus(w, app.tunnel.Status())
	}
}
