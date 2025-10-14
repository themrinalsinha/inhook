package main

import (
	"encoding/json"
	"fmt"
	"log"
	"mime"
	"net/http"
	"net/http/httputil"
	"path/filepath"
	"strings"
	"time"

	"github.com/themrinalsinha/inhook/internal/parser"
)

type WebhookTokenResponse struct {
	ID        int64     `json:"id"`
	Token     string    `json:"token"`
	CreatedAt time.Time `json:"created_at"`
}

type WebhookEventResponse struct {
	ID          int64     `json:"id"`
	TokenID     int64     `json:"token_id"`
	RequestID   string    `json:"request_id"`
	CreatedAt   time.Time `json:"created_at"`
	Method      string    `json:"method"`
	Host        string    `json:"host"`
	RemoteAddr  string    `json:"remote_addr"`
	QueryParams string    `json:"query_params"`
	Headers     string    `json:"headers"`
	FormData    string    `json:"form_data"`
	Body        string    `json:"body"`
	// RawData     []byte    `json:"raw_data"`
	RawData string `json:"raw_data"`
	IsRead  bool   `json:"is_read"`
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
		app.lo.Info("Creating webhook token")

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
		app.lo.Info(fmt.Sprintf("Deleting webhook token: %s", token_id))

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
		app.lo.Info(fmt.Sprintf("Event Received - [%s] - %s", r.Method, r.URL.Path))

		contentType := r.Header.Get("Content-Type")
		formTypes := []string{
			"application/x-www-form-urlencoded",
			"multipart/form-data",
		}
		isFormType := false
		for _, formType := range formTypes {
			if strings.Contains(contentType, formType) {
				isFormType = true
				break
			}
		}

		tokenId := r.PathValue("token_id")
		service := DBService{db: app.db}

		token, err := service.GetWebhookTokenByTokenID(tokenId)
		if err != nil {
			app.lo.Error(
				fmt.Sprintf("[%d] Invalid token ID: %s", http.StatusBadRequest, err),
			)
			return
		}

		requestDump, err := httputil.DumpRequest(r, true)
		if err != nil {
			app.lo.Error(
				fmt.Sprintf(
					"[%d] Failed to dump request: %s", http.StatusInternalServerError,
					err,
				),
			)
			return
		}
		headersJSON, _ := json.Marshal(r.Header)
		queryParamsJSON, _ := json.Marshal(r.URL.Query())

		formData, _ := func() (string, error) {
			if isFormType {
				return parser.ParseFormData(r)
			} else {
				return "", nil
			}
		}()

		parsedBody, err := parser.ParseBody(r, contentType)
		if err != nil {
			app.lo.Error(
				fmt.Sprintf(
					"[%d] Failed to parse body: %s", http.StatusInternalServerError, err),
			)
			return
		}

		event := WebhookEvent{
			TokenID:     token.ID,
			Method:      r.Method,
			Host:        r.Host,
			RemoteAddr:  r.RemoteAddr,
			Headers:     string(headersJSON),
			QueryParams: string(queryParamsJSON),
			Body:        parsedBody,
			FormData:    formData,
			RawData:     string(requestDump),
		}
		createdEvent, err := service.CreateWebhookEvent(event)
		if err != nil {
			app.lo.Error(
				fmt.Sprintf(
					"[%d] Failed to create webhook event: %s",
					http.StatusInternalServerError,
					err,
				),
			)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(
			"Event created successfully with request ID: " + createdEvent.RequestID,
		))
	}
}

// Helper function to register a handler for all HTTP methods
func handleAllMethods(mux *http.ServeMux, pattern string, handler http.HandlerFunc) {
	methods := []string{
		http.MethodGet,
		http.MethodHead,
		http.MethodPost,
		http.MethodPut,
		http.MethodPatch,
		http.MethodDelete,
		http.MethodConnect,
		http.MethodOptions,
		http.MethodTrace,
	}
	for _, method := range methods {
		mux.HandleFunc(method+" "+pattern, handler)
	}
}

func getWebhookEventsHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenId := r.PathValue("token_id")
		app.lo.Info(fmt.Sprintf("Getting webhook events for token: %s", tokenId))

		service := DBService{db: app.db}
		token, _ := service.GetWebhookTokenByTokenID(tokenId)
		events, err := service.GetWebhookEventForRequestID(token.ID)
		if err != nil {
			http.Error(w, "Failed to get webhook events", http.StatusInternalServerError)
			return
		}

		// Convert to response type with JSON tags
		response := make([]WebhookEventResponse, len(events))
		for i, event := range events {
			response[i] = WebhookEventResponse(event)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
}

func markEventAsReadHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		app.lo.Info("Marking event as read")
		eventId := r.PathValue("event_id")
		service := DBService{db: app.db}
		err := service.MarkEventAsRead(eventId)
		if err != nil {
			http.Error(w, "Failed to mark event as read", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

func getWebhookConfigHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		app.lo.Info("Getting webhook config")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"name":    appName,
			"version": app.buildVersion,
			"host":    ko.String("app.host"),
		})
	}
}

func initHandlers(app *App) http.Handler {
	handler := http.NewServeMux()

	handler.HandleFunc("POST /api/webhook/{$}", createWebhookTokenHandler(app))
	handler.HandleFunc("DELETE /api/webhook/{token_id}", deleteWebhookTokenHandler(app))
	handler.HandleFunc(
		"GET /api/webhook/{token_id}/events/", getWebhookEventsHandler(app),
	)
	handler.HandleFunc("GET /api/webhook/config/{$}", getWebhookConfigHandler(app))
	handler.HandleFunc(
		"POST /api/webhook/event/{event_id}/read/", markEventAsReadHandler(app),
	)

	// Webhook URL handler - accepts all HTTP methods
	handleAllMethods(handler, "/webhook/{token_id}/", webhookURLHandler(app))

	// Static files handlers for serving the frontend
	handler.HandleFunc("GET /assets/", staticFilesHandler(app))
	handler.HandleFunc("GET /", rootHandler(app))

	return corsMiddleware(handler)
}
