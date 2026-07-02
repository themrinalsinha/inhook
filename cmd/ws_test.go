package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
	"github.com/jmoiron/sqlx"
)

func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()

	db, err := sqlx.Open("sqlite", filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	initMigrations(db)

	app := &App{
		db:  db,
		lo:  initLogger("test"),
		hub: NewHub(),
	}
	server := httptest.NewServer(initHandlers(app))
	t.Cleanup(server.Close)
	return server
}

func createTestToken(t *testing.T, server *httptest.Server) WebhookTokenResponse {
	t.Helper()

	resp, err := http.Post(server.URL+"/api/webhook/", "application/json", nil)
	if err != nil {
		t.Fatalf("failed to create token: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201 creating token, got %d", resp.StatusCode)
	}

	var token WebhookTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		t.Fatalf("failed to decode token: %v", err)
	}
	return token
}

func dialWS(t *testing.T, server *httptest.Server, token string) *websocket.Conn {
	t.Helper()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	wsURL := strings.Replace(server.URL, "http", "ws", 1) +
		"/api/webhook/" + token + "/ws"
	conn, _, err := websocket.Dial(ctx, wsURL, nil)
	if err != nil {
		t.Fatalf("failed to dial ws: %v", err)
	}
	t.Cleanup(func() { conn.CloseNow() })
	return conn
}

func readWSMessage(t *testing.T, conn *websocket.Conn) (string, json.RawMessage) {
	t.Helper()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, data, err := conn.Read(ctx)
	if err != nil {
		t.Fatalf("failed to read ws message: %v", err)
	}

	var msg struct {
		Type string          `json:"type"`
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(data, &msg); err != nil {
		t.Fatalf("ws message is not valid JSON: %v (%s)", err, data)
	}
	return msg.Type, msg.Data
}

func TestWSRejectsUnknownToken(t *testing.T) {
	server := newTestServer(t)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	wsURL := strings.Replace(server.URL, "http", "ws", 1) + "/api/webhook/nope/ws"
	conn, resp, err := websocket.Dial(ctx, wsURL, nil)
	if err == nil {
		conn.CloseNow()
		t.Fatal("expected dial to fail for unknown token")
	}
	if resp == nil || resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404 for unknown token, got %+v", resp)
	}
}

func TestWSDeliversNewEventOnWebhook(t *testing.T) {
	server := newTestServer(t)
	token := createTestToken(t, server)
	conn := dialWS(t, server, token.Token)

	resp, err := http.Post(
		server.URL+"/webhook/"+token.Token+"/",
		"application/json",
		strings.NewReader(`{"hello":"world"}`),
	)
	if err != nil {
		t.Fatalf("failed to post webhook: %v", err)
	}
	resp.Body.Close()

	msgType, data := readWSMessage(t, conn)
	if msgType != "new_event" {
		t.Fatalf("expected new_event, got %q", msgType)
	}

	var event WebhookEventResponse
	if err := json.Unmarshal(data, &event); err != nil {
		t.Fatalf("failed to decode event payload: %v", err)
	}
	if event.Method != http.MethodPost {
		t.Errorf("expected method POST, got %q", event.Method)
	}
	if event.TokenID != token.ID {
		t.Errorf("expected token_id %d, got %d", token.ID, event.TokenID)
	}
	if event.ID == 0 {
		t.Error("expected a non-zero event id")
	}
}

func TestWSBroadcastsEventsArchived(t *testing.T) {
	server := newTestServer(t)
	token := createTestToken(t, server)
	conn := dialWS(t, server, token.Token)

	resp, err := http.Post(
		fmt.Sprintf("%s/api/webhook/%d/archive-events/", server.URL, token.ID),
		"application/json",
		nil,
	)
	if err != nil {
		t.Fatalf("failed to archive events: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 archiving events, got %d", resp.StatusCode)
	}

	msgType, _ := readWSMessage(t, conn)
	if msgType != "events_archived" {
		t.Fatalf("expected events_archived, got %q", msgType)
	}
}

func TestWSBroadcastsEventRead(t *testing.T) {
	server := newTestServer(t)
	token := createTestToken(t, server)

	// Create an event before subscribing so the read broadcast is the first
	// message the socket sees.
	resp, err := http.Post(
		server.URL+"/webhook/"+token.Token+"/", "text/plain", strings.NewReader("hi"),
	)
	if err != nil {
		t.Fatalf("failed to post webhook: %v", err)
	}
	resp.Body.Close()

	eventsResp, err := http.Get(server.URL + "/api/webhook/" + token.Token + "/events/")
	if err != nil {
		t.Fatalf("failed to list events: %v", err)
	}
	defer eventsResp.Body.Close()
	var events []WebhookEventResponse
	if err := json.NewDecoder(eventsResp.Body).Decode(&events); err != nil {
		t.Fatalf("failed to decode events: %v", err)
	}
	if len(events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(events))
	}

	conn := dialWS(t, server, token.Token)

	readResp, err := http.Post(
		fmt.Sprintf("%s/api/webhook/event/%d/read/", server.URL, events[0].ID),
		"application/json",
		nil,
	)
	if err != nil {
		t.Fatalf("failed to mark event read: %v", err)
	}
	readResp.Body.Close()
	if readResp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 marking read, got %d", readResp.StatusCode)
	}

	msgType, data := readWSMessage(t, conn)
	if msgType != "event_read" {
		t.Fatalf("expected event_read, got %q", msgType)
	}
	var payload struct {
		ID int64 `json:"id"`
	}
	if err := json.Unmarshal(data, &payload); err != nil {
		t.Fatalf("failed to decode event_read payload: %v", err)
	}
	if payload.ID != events[0].ID {
		t.Errorf("expected event id %d, got %d", events[0].ID, payload.ID)
	}
}

func TestWSBroadcastsTokenDeleted(t *testing.T) {
	server := newTestServer(t)
	token := createTestToken(t, server)
	conn := dialWS(t, server, token.Token)

	req, err := http.NewRequest(
		http.MethodDelete, server.URL+"/api/webhook/"+token.Token, nil,
	)
	if err != nil {
		t.Fatalf("failed to build delete request: %v", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("failed to delete token: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204 deleting token, got %d", resp.StatusCode)
	}

	msgType, _ := readWSMessage(t, conn)
	if msgType != "token_deleted" {
		t.Fatalf("expected token_deleted, got %q", msgType)
	}
}
