package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jmoiron/sqlx"
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
	db            *sqlx.DB
	fs            stuffbin.FileSystem
	lo            *logf.Logger
	buildVersion  string
	buildHash     string
	buildDate     string
	buildHashFull string
}

func main() {
	// Load command line arguments
	initFlags()

	if ko.Bool("version") {
		fmt.Printf("\n\033[1m%s | Build Version: %s\033[0m\n\n", appName, buildVersion)
		os.Exit(0)
	} else {
		fmt.Printf("\n\033[1m%s | Build Version: %s\033[0m\n\n", appName, buildVersion)
	}

	// Initialize the config
	initConfig(ko)

	// Initialize stuffbin file system
	fs := initFileSystem()

	// Initialize the database
	db, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// Initialize the logger
	lo := initLogger(appName)

	var app = &App{
		db:            db,
		fs:            fs,
		lo:            lo,
		buildVersion:  buildVersion,
		buildHash:     buildHash,
		buildDate:     buildDate,
		buildHashFull: buildHashFull,
	}

	// initiate net/http and pass app as context
	server := &http.Server{
		Addr:    ko.String("app.port"),
		Handler: initHandlers(app),
	}

	// Setup graceful shutdown
	go func() {
		fmt.Printf("\nRunning server on - %s\n\n", ko.String("app.host"))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error running server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("\n\033[1mShutting down server\033[0m")

	// Create a deadline to wait for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Shutdown the server
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("\033[31mServer forced to shutdown: %v\033[0m", err)
	} else {
		log.Println("\033[32mServer stopped gracefully\033[0m")
	}

	// Close the database connection
	if err := db.Close(); err != nil {
		log.Printf("\033[31mError closing database: %v\033[0m", err)
	} else {
		log.Println("\033[32mDatabase connection closed\033[0m")
	}

	log.Println("\033[32mServer exited\033[0m")
}
