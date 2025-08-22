package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Event represents a captured webhook request
type Event struct {
	ID          string            `json:"id"`
	Method      string            `json:"method"`
	URL         string            `json:"url"`
	Headers     map[string]string `json:"headers"`
	Body        string            `json:"body"`
	QueryParams map[string]string `json:"queryParams"`
	IP          string            `json:"ip"`
	Timestamp   time.Time         `json:"timestamp"`
	Status      int               `json:"status"`
}

// WebhookSession represents a webhook endpoint session
type WebhookSession struct {
	ID     string  `json:"id"`
	URL    string  `json:"url"`
	Events []Event `json:"events"`
	WS     *websocket.Conn
}

// App represents the main application
type App struct {
	sessions map[string]*WebhookSession
	mutex    sync.RWMutex
	upgrader websocket.Upgrader
}

// NewApp creates a new application instance
func NewApp() *App {
	return &App{
		sessions: make(map[string]*WebhookSession),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for development
			},
		},
	}
}

// CreateSession creates a new webhook session
func (app *App) CreateSession() *WebhookSession {
	app.mutex.Lock()
	defer app.mutex.Unlock()

	id := uuid.New().String()
	session := &WebhookSession{
		ID:     id,
		URL:    "http://localhost:8080/events/" + id,
		Events: make([]Event, 0),
	}

	app.sessions[id] = session
	return session
}

// GetSession retrieves a webhook session
func (app *App) GetSession(id string) (*WebhookSession, bool) {
	app.mutex.RLock()
	defer app.mutex.RUnlock()
	session, exists := app.sessions[id]
	return session, exists
}

// AddEvent adds an event to a session and notifies WebSocket clients
func (app *App) AddEvent(sessionID string, event Event) {
	app.mutex.Lock()
	defer app.mutex.Unlock()

	if session, exists := app.sessions[sessionID]; exists {
		session.Events = append(session.Events, event)

		// Notify WebSocket clients
		if session.WS != nil {
			eventData, _ := json.Marshal(map[string]interface{}{
				"type":  "new_event",
				"event": event,
			})
			session.WS.WriteMessage(websocket.TextMessage, eventData)
		}
	}
}

// SetupRoutes configures the application routes
func (app *App) SetupRoutes(r *gin.Engine) {
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := r.Group("/api")
	{
		// Create new webhook session
		api.POST("/sessions", func(c *gin.Context) {
			session := app.CreateSession()
			c.JSON(http.StatusCreated, session)
		})

		// Get session events
		api.GET("/events/:id", func(c *gin.Context) {
			id := c.Param("id")
			if session, exists := app.GetSession(id); exists {
				c.JSON(http.StatusOK, session.Events)
			} else {
				c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			}
		})

		// Get session info
		api.GET("/sessions/:id", func(c *gin.Context) {
			id := c.Param("id")
			if session, exists := app.GetSession(id); exists {
				c.JSON(http.StatusOK, session)
			} else {
				c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			}
		})
	}

	// WebSocket endpoint
	r.GET("/ws/:id", func(c *gin.Context) {
		id := c.Param("id")
		session, exists := app.GetSession(id)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}

		conn, err := app.upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade failed: %v", err)
			return
		}
		defer conn.Close()

		// Store WebSocket connection
		app.mutex.Lock()
		session.WS = conn
		app.mutex.Unlock()

		// Send initial events
		eventsData, _ := json.Marshal(map[string]interface{}{
			"type":   "initial_events",
			"events": session.Events,
		})
		conn.WriteMessage(websocket.TextMessage, eventsData)

		// Keep connection alive
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	})

	// Webhook endpoint - captures incoming requests
	r.Any("/events/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, exists := app.GetSession(id)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}

		// Read body
		bodyBytes, _ := c.GetRawData()
		body := string(bodyBytes)

		// Extract headers
		headers := make(map[string]string)
		for key, values := range c.Request.Header {
			if len(values) > 0 {
				headers[key] = values[0]
			}
		}

		// Extract query parameters
		queryParams := make(map[string]string)
		for key, values := range c.Request.URL.Query() {
			if len(values) > 0 {
				queryParams[key] = values[0]
			}
		}

		// Create event
		event := Event{
			ID:          uuid.New().String(),
			Method:      c.Request.Method,
			URL:         c.Request.URL.String(),
			Headers:     headers,
			Body:        body,
			QueryParams: queryParams,
			IP:          c.ClientIP(),
			Timestamp:   time.Now(),
			Status:      200,
		}

		// Add event to session
		app.AddEvent(id, event)

		// Respond to webhook
		c.JSON(http.StatusOK, gin.H{"success": true})
	})
}

func main() {
	app := NewApp()

	// Create a default session for testing
	_ = app.CreateSession()

	r := gin.Default()
	app.SetupRoutes(r)

	// Serve frontend static files (must be last to avoid conflicts with API routes)
	r.Static("/assets", "./frontend/dist/assets")
	r.Static("/favicon.ico", "./frontend/dist/favicon.ico")
	r.GET("/", func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	// Catch-all for SPA routing - must be last
	r.NoRoute(func(c *gin.Context) {
		// Only serve index.html for non-API routes
		if !strings.HasPrefix(c.Request.URL.Path, "/api") && !strings.HasPrefix(c.Request.URL.Path, "/ws") && !strings.HasPrefix(c.Request.URL.Path, "/events") {
			c.File("./frontend/dist/index.html")
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		}
	})

	log.Println("Starting inHook server on :8080")
	log.Fatal(r.Run(":8080"))
}
