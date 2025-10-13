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
	"github.com/knadh/koanf/providers/posflag"
	"github.com/knadh/koanf/v2"
	"github.com/knadh/stuffbin"
	flag "github.com/spf13/pflag"
	"github.com/zerodha/logf"
	_ "modernc.org/sqlite"
)

// initConfig loads the config files into the koanf instance
func initConfig(ko *koanf.Koanf) {
	for _, f := range ko.Strings("config") {
		log.Println("Loading config file(s)")
		if err := ko.Load(file.Provider(f), toml.Parser()); err != nil {
			if os.IsNotExist(err) {
				log.Fatal("Config file not found: ", f)
			} else {
				log.Fatalf("Error loading config file: %v", err)
			}
		}
	}
}

func initFlags() {
	f := flag.NewFlagSet("config", flag.ContinueOnError)

	// Registering --help handler
	f.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		f.PrintDefaults()
	}
	f.Bool("version", false, "Show current version of the build")
	f.StringSlice(
		"config", []string{"config.toml"}, "path to config files (could be multiple)",
	)
	if err := f.Parse(os.Args[1:]); err != nil {
		log.Fatalf("Error parsing flags: %v", err)
	}
	if err := ko.Load(posflag.Provider(f, ".", ko), nil); err != nil {
		log.Fatalf("Error loading config from flags: %v", err)
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
	dbDir := ko.String("db.path")
	dbName := ko.String("db.name")
	dbFullPath := path.Join(dbDir, dbName)

	// Print the absolute path for clarity
	absPath, err := os.Getwd()
	if err != nil {
		log.Printf("Warning: could not get working directory: %v", err)
		absPath = ""
	}
	log.Printf("Initializing database at: %s (cwd: %s)", dbFullPath, absPath)

	// Ensure the directory exists
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("could not create db directory %s: %v", dbDir, err)
	}

	db, err := sqlx.Open("sqlite", dbFullPath)
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
	// currently keeping the migrations here, later will move it to a separate file.
	migrations := []string{
		// table to store the webhook tokens
		`
		CREATE TABLE IF NOT EXISTS webhook_token (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT NOT NULL,
			created_at DATETIME NOT NULL DEFAULT current_timestamp,

			UNIQUE(token)
		);`,
		// table to store the webhook events
		`CREATE TABLE IF NOT EXISTS webhook_event (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token_id INTEGER NOT NULL,
			request_id TEXT NOT NULL,
			created_at DATETIME NOT NULL DEFAULT current_timestamp,
			method TEXT NOT NULL,
			host TEXT NOT NULL,
			remote_addr TEXT NOT NULL,
			query_params TEXT,
			headers TEXT,
			form_data TEXT,
			body TEXT,
			raw_data BLOB,
			is_read BOOLEAN NOT NULL DEFAULT FALSE,
			UNIQUE(request_id),
			FOREIGN KEY(token_id) REFERENCES webhook_token(id)
		);`,
		// index to speed up the queries
		`CREATE INDEX IF NOT EXISTS idx_webhook_events_token_id ON webhook_event(token_id, created_at DESC);`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			log.Printf("Error applying migration: %v\nSQL: %s\n", err, migration)
		}
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
