package main

import (
	"log"
	"mime"
	"net/http"
	"path/filepath"
)

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

func initHandlers(app *App) http.Handler {
	handler := http.NewServeMux()
	// Static files handlers for serving the frontend
	handler.HandleFunc("GET /{$}", rootHandler(app))
	handler.HandleFunc("GET /assets/", staticFilesHandler(app))

	// API handlers for backend

	return handler
}
