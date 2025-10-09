package main

import (
	"encoding/json"
	"fmt"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"time"
)

type WebhookTokenResponse struct {
	ID        int64     `json:"id"`
	Token     string    `json:"token"`
	CreatedAt time.Time `json:"created_at"`
}

func rootHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		file, err := app.fs.Get("index.html")
		if err != nil {
			log.Fatalf("Error getting index.html: %v", err)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		w.Write(file.ReadBytes())
	}
}

func staticFilesHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		file, err := app.fs.Get(filepath.Clean(r.URL.Path))
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		ext := filepath.Ext(r.URL.Path)

		contentType := mime.TypeByExtension(ext)
		if contentType == "" {
			contentType = http.DetectContentType(file.ReadBytes())
		}
		w.Header().Set("Content-Type", contentType)
		w.WriteHeader(http.StatusOK)
		w.Write(file.ReadBytes())
	}
}

func createWebhookTokenHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		service := DBService{db: app.db}
		token, err := service.CreateWebhookToken()

		if err != nil {
			http.Error(w, "Failed to create webhook token", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(WebhookTokenResponse(token))
	}
}

func deleteWebhookTokenHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token_id := r.PathValue("token_id")

		service := DBService{db: app.db}
		err := service.DeleteWebhookToken(token_id)

		if err != nil {
			http.Error(w, "Failed to delete webhook token", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func webhookURLHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenId := r.PathValue("token_id")

		app.lo.Info(fmt.Sprintf("Event Received - [%s] - %s", r.Method, r.URL.Path))

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf("[%s] - %s", r.Method, tokenId)))
	}
}

// Helper function to register a handler for all HTTP methods
func handleAllMethods(mux *http.ServeMux, pattern string, handler http.HandlerFunc) {
	methods := []string{
		"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "CONNECT", "TRACE",
	}
	for _, method := range methods {
		mux.HandleFunc(method+" "+pattern, handler)
	}
}

func initHandlers(app *App) http.Handler {
	handler := http.NewServeMux()

	handler.HandleFunc("POST /api/webhook/{$}", createWebhookTokenHandler(app))
	handler.HandleFunc("DELETE /api/webhook/{token_id}", deleteWebhookTokenHandler(app))

	// Webhook URL handler - accepts all HTTP methods
	handleAllMethods(handler, "/webhook/{token_id}/", webhookURLHandler(app))

	// Static files handlers for serving the frontend
	handler.HandleFunc("GET /assets/", staticFilesHandler(app))
	handler.HandleFunc("GET /", rootHandler(app))

	return corsMiddleware(handler)
}
