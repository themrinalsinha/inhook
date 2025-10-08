package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/knadh/koanf/v2"
	"github.com/knadh/stuffbin"
	"github.com/zerodha/logf"
)

var (
	ko      = koanf.New(".")
	appName = "InHook"

	// data injected at build time
	buildVersion  string
	buildHash     string
	buildDate     string
	buildHashFull string
)

// App is the global app context which is passed and injected in the http handlers
type App struct {
	fs            stuffbin.FileSystem
	lo            *logf.Logger
	buildVersion  string
	buildHash     string
	buildDate     string
	buildHashFull string
}

func main() {
	fmt.Printf("\n\033[1m%s | Build Version: %s\033[0m\n\n", appName, buildVersion)

	// Initialize the config
	initConfig(ko)

	// Initialize stuffbin file system
	fs := initFileSystem()

	// Initialize the database
	_, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// Initialize the logger
	lo := initLogger(appName)

	var app = &App{
		fs:            fs,
		lo:            lo,
		buildVersion:  buildVersion,
		buildHash:     buildHash,
		buildDate:     buildDate,
		buildHashFull: buildHashFull,
	}

	// initiate net/http and pass app as context
	var addr = ko.String("app.host") + ko.String("app.port")
	server := &http.Server{
		Addr:    ko.String("app.port"),
		Handler: initHandlers(app),
	}

	fmt.Printf("\nRunning server on %s\n", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error running server: %v", err)
	}
}
