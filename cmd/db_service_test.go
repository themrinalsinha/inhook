package main

import (
	"path/filepath"
	"testing"

	"github.com/jmoiron/sqlx"
)

func newTestDB(t *testing.T) *sqlx.DB {
	t.Helper()

	db, err := sqlx.Open("sqlite", filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	initMigrations(db)
	return db
}

func TestGetSettingAbsentReturnsEmpty(t *testing.T) {
	service := DBService{db: newTestDB(t)}

	value, err := service.GetSetting("tunnel_subdomain")
	if err != nil {
		t.Fatalf("expected no error for absent key, got %v", err)
	}
	if value != "" {
		t.Errorf("expected empty value for absent key, got %q", value)
	}
}

func TestSetGetSettingRoundtrip(t *testing.T) {
	service := DBService{db: newTestDB(t)}

	if err := service.SetSetting("tunnel_subdomain", "a1b2c3d4"); err != nil {
		t.Fatalf("failed to set setting: %v", err)
	}

	value, err := service.GetSetting("tunnel_subdomain")
	if err != nil {
		t.Fatalf("failed to get setting: %v", err)
	}
	if value != "a1b2c3d4" {
		t.Errorf("expected a1b2c3d4, got %q", value)
	}
}

func TestSetSettingUpsertsExistingKey(t *testing.T) {
	service := DBService{db: newTestDB(t)}

	if err := service.SetSetting("tunnel_subdomain", "first000"); err != nil {
		t.Fatalf("failed to set setting: %v", err)
	}
	if err := service.SetSetting("tunnel_subdomain", "second11"); err != nil {
		t.Fatalf("failed to overwrite setting: %v", err)
	}

	value, err := service.GetSetting("tunnel_subdomain")
	if err != nil {
		t.Fatalf("failed to get setting: %v", err)
	}
	if value != "second11" {
		t.Errorf("expected second11 after upsert, got %q", value)
	}
}
