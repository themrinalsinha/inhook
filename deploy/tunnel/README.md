# InHook Tunnel Server (frps)

InHook's "Expose Online" feature embeds an [frp](https://github.com/fatedier/frp)
client in the inhook binary. It needs an `frps` server with a wildcard domain to
hand out public URLs like `https://<slug>.t.inhook.mrinal.xyz/webhook/<token>/`.
This directory contains everything needed to run one — for the official server
or your own.

Only the `/webhook/` path prefix of a local instance is ever exposed: the frp
proxy is registered with `locations = ["/webhook/"]`, so the dashboard, API,
and WebSocket of the local instance stay private. Requests transit the tunnel
server but are never stored on it.

## Version rule

**The frps release version must equal the frp library version pinned in
inhook's `go.mod` (currently `v0.69.1`).** frp is pre-1.0 and makes no
compatibility promises between client and server versions.

## Setup

1. **DNS** — two records pointing at the server:

   ```
   A  t.inhook.mrinal.xyz    → <server ip>
   A  *.t.inhook.mrinal.xyz  → <server ip>
   ```

2. **frps** — download the matching release from
   https://github.com/fatedier/frp/releases (or build `cmd/frps` from source):

   ```sh
   install -m 755 frps /usr/local/bin/frps
   useradd --system --no-create-home --shell /usr/sbin/nologin frp
   mkdir -p /etc/frp /var/log/frp && chown frp:frp /var/log/frp
   cp frps.toml /etc/frp/frps.toml
   cp frps.service /etc/systemd/system/frps.service
   systemctl enable --now frps
   ```

3. **Wildcard TLS certificate** — most webhook providers require HTTPS.
   Wildcard certs need the DNS-01 challenge:

   ```sh
   certbot certonly --preferred-challenges dns \
     -d 't.inhook.mrinal.xyz' -d '*.t.inhook.mrinal.xyz'
   ```

   Use a certbot DNS plugin for your DNS provider so renewals stay automatic
   (`--manual` works but cannot auto-renew).

4. **nginx** — copy `nginx.conf` into your nginx config (e.g.
   `/etc/nginx/conf.d/inhook-tunnel.conf`) and reload. It terminates TLS for
   the wildcard domain and proxies to the loopback-only frps vhost listener on
   `127.0.0.1:8080`. `proxy_set_header Host $host` is required — frps routes
   by the Host header.

5. **Firewall** — expose only `443` (tunneled webhook traffic) and `9090`
   (frp control connections). The frps vhost port 8080 binds to loopback and
   must not be reachable directly.

## Security model

The auth token in `frps.toml` ships inside the open-source inhook binary, so
treat the server as an open service. The config contains what a client can do
with it:

- `subDomainHost` restricts vhosts to `*.t.inhook.mrinal.xyz`.
- `allowPorts = [{ single = 1 }]` plus the loopback `proxyBindAddr` make
  TCP/UDP `remotePort` proxies unusable.
- `maxPortsPerClient = 1` allows one proxy per connected client.
- `detailedErrorsToClient = true` must stay on: inhook relies on the
  "router config conflict" error text to detect a taken subdomain and pick a
  new one.

If the shared server gets abused, rotate `auth.token` here and in a new inhook
release, or add rate limiting in nginx.

## Self-hosting

Any inhook user can point their instance at their own frps — set these in
`config.toml` (values matching your `frps.toml`):

```toml
[tunnel]
server_addr = "t.example.com"
server_port = 9090
auth_token = "your-own-token"
domain = "t.example.com"
scheme = "https"
```

## Local development

`make dev-frps` runs a pinned frps locally using `frps.dev.toml`
(`subDomainHost = t.localhost`, no TLS). See that file's header for the
matching inhook config and curl commands — no DNS or deployment needed.
