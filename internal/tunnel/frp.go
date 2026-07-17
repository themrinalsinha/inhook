package tunnel

import (
	"context"
	"fmt"
	"sync"

	"github.com/fatedier/frp/client"
	"github.com/fatedier/frp/pkg/config/source"
	v1 "github.com/fatedier/frp/pkg/config/v1"
	frplog "github.com/fatedier/frp/pkg/util/log"
)

// frp's logger is process-global; quiet it once so inhook's own logging stays
// readable no matter how many times the tunnel is started.
var quietFRPLogs = sync.OnceFunc(func() {
	frplog.InitLogger("console", "warn", 0, true)
})

// frpService adapts the embedded frp client to the frpRunner seam.
type frpService struct {
	svc *client.Service
}

// newFRPRunner builds an frp client exposing only the /webhook/ path prefix
// of the local server on a subdomain of the configured vhost domain.
func newFRPRunner(cfg Config, slug string, failFast bool) (frpRunner, error) {
	quietFRPLogs()

	common := &v1.ClientCommonConfig{
		ServerAddr: cfg.ServerAddr,
		ServerPort: cfg.ServerPort,
		Auth: v1.AuthClientConfig{
			Method: v1.AuthMethodToken,
			Token:  cfg.AuthToken,
		},
		// failFast surfaces a bad server/token immediately on UI-triggered
		// starts; boot autostarts pass false to keep retrying quietly.
		LoginFailExit: &failFast,
	}

	httpCfg := &v1.HTTPProxyConfig{
		ProxyBaseConfig: v1.ProxyBaseConfig{
			Name: proxyName(slug),
			Type: "http",
			ProxyBackend: v1.ProxyBackend{
				LocalIP:   "127.0.0.1",
				LocalPort: cfg.LocalPort,
			},
		},
		DomainConfig: v1.DomainConfig{SubDomain: slug},
		Locations:    []string{"/webhook/"},
	}
	// NewService completes only the common config; proxies are our job.
	httpCfg.Complete()

	cs := source.NewConfigSource()
	if err := cs.ReplaceAll([]v1.ProxyConfigurer{httpCfg}, nil); err != nil {
		return nil, fmt.Errorf("configuring tunnel proxy: %w", err)
	}

	svc, err := client.NewService(client.ServiceOptions{
		Common:                 common,
		ConfigSourceAggregator: source.NewAggregator(cs),
	})
	if err != nil {
		return nil, fmt.Errorf("creating tunnel client: %w", err)
	}
	return &frpService{svc: svc}, nil
}

func (f *frpService) Run(ctx context.Context) error {
	return f.svc.Run(ctx)
}

func (f *frpService) Close() {
	f.svc.Close()
}

func (f *frpService) ProxyStatus(name string) (string, string, bool) {
	status, ok := f.svc.StatusExporter().GetProxyStatus(name)
	if !ok {
		return "", "", false
	}
	return status.Phase, status.Err, true
}
