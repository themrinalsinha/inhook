package main

import (
	"fmt"
	"log"
	"os"
	"path"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/knadh/koanf/parsers/toml"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
	"github.com/knadh/stuffbin"
	"github.com/zerodha/logf"
	_ "modernc.org/sqlite"
)

// initConfig loads the config files into the koanf instance
func initConfig(ko *koanf.Koanf) {
	log.Println("Loading config file: ", "config.toml")
	if err := ko.Load(file.Provider("config.toml"), toml.Parser()); err != nil {
		if os.IsNotExist(err) {
			log.Fatal("Config file not found: ", "config.toml")
		} else {
			log.Fatalf("Error loading config file: %v", err)
		}
	}
}

func initFileSystem() stuffbin.FileSystem {
	var files = []string{
		"frontend/dist:/",
	}

	path, err := os.Executable()
	if err != nil {
		log.Fatalf("Error initializing file system: %v", err)
	}

	fileSystem, err := stuffbin.UnStuff(path)
	if err != nil {
		if err == stuffbin.ErrNoID {
			fileSystem, err = stuffbin.NewLocalFS("/", files...)
			if err != nil {
				log.Fatalf("Error initializing file system: %v", err)
			}
		} else {
			log.Fatalf("Error initializing file system: %v", err)
		}
	}
	return fileSystem
}

func initDB() (*sqlx.DB, error) {
	dbPath := ko.String("db.path")
	dbName := ko.String("db.name")
	dbPath = path.Join(dbPath, dbName)

	log.Println("Initializing database: ", dbPath)

	db, err := sqlx.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("error initializing database: %v", err)
	}

	db.SetMaxOpenConns(ko.Int("db.max_open_conns"))
	db.SetMaxIdleConns(ko.Int("db.max_idle_conns"))
	db.SetConnMaxLifetime(time.Duration(ko.Int("db.conn_max_lifetime")) * time.Second)

	db.Exec("PRAGMA journal_mode = WAL;")
	db.Exec("PRAGMA foreign_keys = ON;")

	initMigrations(db)
	return db, nil
}

func initMigrations(db *sqlx.DB) {
	migrations := []string{
		`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL,
			password TEXT NOT NULL
		);`,
	}

	for _, migration := range migrations {
		db.Exec(migration)
	}
	log.Println("Migrations applied successfully")
}

func _getLogLevel(level string) logf.Level {
	switch level {
	case "info":
		return logf.InfoLevel
	case "debug":
		return logf.DebugLevel
	case "warn":
		return logf.WarnLevel
	case "error":
		return logf.ErrorLevel
	case "fatal":
		return logf.FatalLevel
	default:
		return logf.InfoLevel
	}
}

func _getColor(env string) bool {
	switch env {
	case "dev", "local":
		return true
	default:
		return false
	}
}

func initLogger(src string) *logf.Logger {
	level, env := ko.String("app.log_level"), ko.String("app.env")

	lo := logf.New(
		logf.Opts{
			Level:                _getLogLevel(level),
			EnableColor:          _getColor(env),
			EnableCaller:         true,
			CallerSkipFrameCount: 3,
			DefaultFields:        []any{"sc", src},
		},
	)
	return &lo
}
