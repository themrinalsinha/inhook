package main

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type WebhookToken struct {
	ID        int64     `db:"id"`
	Token     string    `db:"token"`
	CreatedAt time.Time `db:"created_at"`
}

type WebhookEvent struct {
	ID          int64     `db:"id"`
	TokenID     int64     `db:"token_id"`
	RequestID   string    `db:"request_id"`
	CreatedAt   time.Time `db:"created_at"`
	Method      string    `db:"method"`
	Host        string    `db:"host"`
	RemoteAddr  string    `db:"remote_addr"`
	QueryParams string    `db:"query_params"`
	Headers     string    `db:"headers"`   // json encoded
	FormData    string    `db:"form_data"` // json encoded
	Body        string    `db:"body"`      // json encoded
	RawData     []byte    `db:"raw_data"`  // json encoded
	IsRead      bool      `db:"is_read"`
}

type DBService struct {
	db *sqlx.DB
}

func (s *DBService) CreateWebhookToken() (WebhookToken, error) {
	var newToken = uuid.NewString()[:8]
	var token WebhookToken

	result, err := s.db.Exec("INSERT INTO webhook_token (token) VALUES (?)", newToken)
	if err != nil {
		return WebhookToken{}, err
	}
	lastId, _ := result.LastInsertId()
	err = s.db.Get(&token, "SELECT id, token, created_at FROM webhook_token WHERE id = ?", lastId)
	if err != nil {
		return WebhookToken{}, err
	}
	return token, nil
}

func (s *DBService) DeleteWebhookToken(token string) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	var tokenID int64
	err = tx.Get(&tokenID, "SELECT id FROM webhook_token WHERE token = ?", token)
	if err != nil {
		if err == sql.ErrNoRows {
			// Token doesn't exist, nothing to delete
			return nil
		}
		return err
	}

	if _, err = tx.Exec("DELETE FROM webhook_event WHERE token_id = ?", tokenID); err != nil {
		return err
	}
	if _, err = tx.Exec("DELETE FROM webhook_token WHERE id = ?", tokenID); err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}
	return nil
}

func (s *DBService) GetWebhookTokenByTokenID(tokenId string) (WebhookToken, error) {
	var token WebhookToken
	err := s.db.Get(
		&token,
		"SELECT id, token, created_at FROM webhook_token WHERE token = ?",
		tokenId,
	)
	if err != nil {
		return WebhookToken{}, err
	}
	return token, nil
}

func (s *DBService) GetWebhookToken() ([]WebhookToken, error) {
	// returns all the tokens with their IDs with WebhookToken object list
	var tokens []WebhookToken
	err := s.db.Select(&tokens, "SELECT id, token, created_at FROM webhook_token")
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func (s *DBService) CreateWebhookEvent(event WebhookEvent) (WebhookEvent, error) {
	// set default values
	event.RequestID = uuid.NewString()

	result, err := s.db.Exec(
		`INSERT INTO webhook_event (
			token_id, request_id, method, host, remote_addr, query_params, headers,
			form_data, body, raw_data
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		event.TokenID, event.RequestID, event.Method, event.Host, event.RemoteAddr,
		event.QueryParams, event.Headers, event.FormData, event.Body, event.RawData,
	)
	if err != nil {
		return WebhookEvent{}, err
	}

	var newEvent WebhookEvent
	lastId, _ := result.LastInsertId()
	err = s.db.Get(
		&newEvent,
		`SELECT id, token_id, request_id, created_at, method, host, remote_addr, query_params,
		headers, form_data, body, raw_data, is_read FROM webhook_event WHERE id = ?`,
		lastId,
	)
	if err != nil {
		return WebhookEvent{}, err
	}
	return newEvent, nil
}

func (s *DBService) GetWebhookEventForRequestID(tokenId int64) ([]WebhookEvent, error) {
	var events []WebhookEvent

	err := s.db.Select(
		&events,
		`SELECT id, token_id, request_id, created_at, method, host, remote_addr, query_params,
		headers, form_data, body, raw_data, is_read FROM webhook_event WHERE token_id = ?
		ORDER BY created_at DESC LIMIT 50`,
		tokenId,
	)
	if err != nil {
		return []WebhookEvent{}, err
	}
	return events, nil
}

func (s *DBService) MarkEventAsRead(eventId string) error {
	_, err := s.db.Exec("UPDATE webhook_event SET is_read = TRUE WHERE id = ?", eventId)
	if err != nil {
		return err
	}
	return nil
}

func (s *DBService) DeleteAllEventsByTokenID(tokenId string) error {
	_, err := s.db.Exec("DELETE FROM webhook_event WHERE token_id = ?", tokenId)
	if err != nil {
		return err
	}
	return nil
}
