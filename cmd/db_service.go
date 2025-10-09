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

type DBService struct {
	db *sqlx.DB
}

func (s *DBService) CreateWebhookToken() (string, error) {
	var newToken = uuid.NewString()[:8]
	_, err := s.db.Exec("INSERT INTO webhook_token (token) VALUES (?)", newToken)
	if err != nil {
		return "", err
	}
	return newToken, nil
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

func (s *DBService) GetWebhookToken() ([]WebhookToken, error) {
	// returns all the tokens with their IDs with WebhookToken object list
	var tokens []WebhookToken
	err := s.db.Select(&tokens, "SELECT id, token, created_at FROM webhook_token")
	if err != nil {
		return nil, err
	}
	return tokens, nil
}
