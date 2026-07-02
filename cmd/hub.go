package main

import (
	"encoding/json"
	"sync"
)

// wsClientBuffer is the per-client message buffer; a client that falls this
// far behind is evicted and expected to reconnect and refetch.
const wsClientBuffer = 16

type wsMessage struct {
	Type string `json:"type"`
	Data any    `json:"data,omitempty"`
}

// Hub fans out webhook activity to WebSocket clients, keyed by numeric token ID.
type Hub struct {
	mu   sync.RWMutex
	subs map[int64]map[chan []byte]struct{}
}

func NewHub() *Hub {
	return &Hub{subs: make(map[int64]map[chan []byte]struct{})}
}

func (h *Hub) Subscribe(tokenID int64) chan []byte {
	ch := make(chan []byte, wsClientBuffer)

	h.mu.Lock()
	defer h.mu.Unlock()
	if h.subs[tokenID] == nil {
		h.subs[tokenID] = make(map[chan []byte]struct{})
	}
	h.subs[tokenID][ch] = struct{}{}
	return ch
}

func (h *Hub) Unsubscribe(tokenID int64, ch chan []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.removeLocked(tokenID, ch)
}

func (h *Hub) Broadcast(tokenID int64, msg wsMessage) {
	payload, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.subs[tokenID] {
		select {
		case ch <- payload:
		default:
			// Slow client: evict it so it reconnects and refetches instead
			// of holding a silently incomplete event list.
			h.removeLocked(tokenID, ch)
			close(ch)
		}
	}
}

// removeLocked deletes a subscription; callers must hold h.mu.
func (h *Hub) removeLocked(tokenID int64, ch chan []byte) {
	if clients, ok := h.subs[tokenID]; ok {
		delete(clients, ch)
		if len(clients) == 0 {
			delete(h.subs, tokenID)
		}
	}
}
