package main

import (
	"encoding/json"
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

// // Not exposing it for now (not safe to expose till we have user auth in place)
// func getWebhookTokenHandler(app *App) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		service := DBService{db: app.db}
// 		tokens, err := service.GetWebhookToken()
// 		if err != nil {
// 			http.Error(w, "Failed to get webhook token", http.StatusInternalServerError)
// 			return
// 		}

// 		// Convert []WebhookToken to []WebhookTokenResponse
// 		response := make([]WebhookTokenResponse, len(tokens))
// 		for i, token := range tokens {
// 			response[i] = WebhookTokenResponse(token)
// 		}

// 		w.Header().Set("Content-Type", "application/json")
// 		json.NewEncoder(w).Encode(response)
// 		w.WriteHeader(http.StatusOK)
// 	}
// }

func initHandlers(app *App) http.Handler {
	handler := http.NewServeMux()
	// Static files handlers for serving the frontend
	handler.HandleFunc("GET /{$}", rootHandler(app))
	handler.HandleFunc("GET /assets/", staticFilesHandler(app))

	// API handlers for backend
	// handler.HandleFunc("GET /api/webhook/", getWebhookTokenHandler(app))
	handler.HandleFunc("POST /api/webhook/{$}", createWebhookTokenHandler(app))
	handler.HandleFunc("DELETE /api/webhook/{token_id}", deleteWebhookTokenHandler(app))

	return corsMiddleware(handler)
}
