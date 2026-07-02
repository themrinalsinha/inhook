package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/coder/websocket"
)

const (
	wsWriteTimeout = 10 * time.Second
	// Pings keep idle connections alive through proxies (nginx's
	// proxy_read_timeout is 90s) and detect dead peers.
	wsPingInterval = 30 * time.Second
)

// wsHandler streams webhook activity for a token to the client. The stream is
// one-directional; anything the client sends is discarded.
func wsHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenId := r.PathValue("token_id")

		service := DBService{db: app.db}
		token, err := service.GetWebhookTokenByTokenID(tokenId)
		if err != nil {
			http.Error(w, "Token not found", http.StatusNotFound)
			return
		}

		// Subscribe before the handshake completes so no message published
		// after a successful dial can be missed.
		ch := app.hub.Subscribe(token.ID)
		defer app.hub.Unsubscribe(token.ID, ch)

		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
			OriginPatterns: []string{"*"}, // matches the app's permissive CORS
		})
		if err != nil {
			app.lo.Error(fmt.Sprintf("Failed to accept websocket: %s", err))
			return
		}
		defer conn.CloseNow()

		app.lo.Info(fmt.Sprintf("WebSocket client connected for token: %s", tokenId))

		// CloseRead discards client frames and cancels the context when the
		// client disconnects.
		ctx := conn.CloseRead(r.Context())

		pingTicker := time.NewTicker(wsPingInterval)
		defer pingTicker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case payload, ok := <-ch:
				if !ok {
					// Evicted by the hub for falling behind; the client
					// reconnects and refetches over REST.
					conn.Close(websocket.StatusPolicyViolation, "client too slow")
					return
				}
				if err := wsWrite(ctx, conn, payload); err != nil {
					return
				}
			case <-pingTicker.C:
				pingCtx, cancel := context.WithTimeout(ctx, wsWriteTimeout)
				err := conn.Ping(pingCtx)
				cancel()
				if err != nil {
					return
				}
			}
		}
	}
}

func wsWrite(ctx context.Context, conn *websocket.Conn, payload []byte) error {
	writeCtx, cancel := context.WithTimeout(ctx, wsWriteTimeout)
	defer cancel()
	return conn.Write(writeCtx, websocket.MessageText, payload)
}
