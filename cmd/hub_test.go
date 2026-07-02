package main

import (
	"encoding/json"
	"fmt"
	"sync"
	"testing"
)

func TestHubBroadcastDeliversToSubscriber(t *testing.T) {
	hub := NewHub()
	ch := hub.Subscribe(1)
	defer hub.Unsubscribe(1, ch)

	hub.Broadcast(1, wsMessage{Type: "new_event", Data: map[string]any{"id": 42}})

	select {
	case raw := <-ch:
		var msg struct {
			Type string         `json:"type"`
			Data map[string]any `json:"data"`
		}
		if err := json.Unmarshal(raw, &msg); err != nil {
			t.Fatalf("message is not valid JSON: %v", err)
		}
		if msg.Type != "new_event" {
			t.Errorf("expected type new_event, got %q", msg.Type)
		}
		if msg.Data["id"] != float64(42) {
			t.Errorf("expected data.id 42, got %v", msg.Data["id"])
		}
	default:
		t.Fatal("expected a message on the channel, got none")
	}
}

func TestHubBroadcastOnlyReachesMatchingToken(t *testing.T) {
	hub := NewHub()
	ch1 := hub.Subscribe(1)
	ch2 := hub.Subscribe(2)
	defer hub.Unsubscribe(1, ch1)
	defer hub.Unsubscribe(2, ch2)

	hub.Broadcast(1, wsMessage{Type: "events_archived"})

	select {
	case <-ch1:
	default:
		t.Error("subscriber of token 1 should have received the message")
	}
	select {
	case raw := <-ch2:
		t.Errorf("subscriber of token 2 should not receive messages for token 1, got %s", raw)
	default:
	}
}

func TestHubUnsubscribeStopsDelivery(t *testing.T) {
	hub := NewHub()
	ch := hub.Subscribe(1)
	hub.Unsubscribe(1, ch)

	hub.Broadcast(1, wsMessage{Type: "events_archived"})

	select {
	case raw, ok := <-ch:
		if ok {
			t.Errorf("unsubscribed channel should not receive messages, got %s", raw)
		}
	default:
	}
}

func TestHubUnsubscribeIsIdempotent(t *testing.T) {
	hub := NewHub()
	ch := hub.Subscribe(1)
	hub.Unsubscribe(1, ch)
	hub.Unsubscribe(1, ch) // must not panic
	hub.Unsubscribe(99, ch)
}

func TestHubEvictsSlowSubscriber(t *testing.T) {
	hub := NewHub()
	ch := hub.Subscribe(1)

	// Fill the buffer and overflow it by one; the hub must evict the
	// subscriber by closing its channel rather than blocking or dropping
	// messages silently.
	for i := 0; i <= wsClientBuffer; i++ {
		hub.Broadcast(1, wsMessage{Type: "new_event", Data: map[string]any{"seq": i}})
	}

	received := 0
	for {
		_, ok := <-ch
		if !ok {
			break
		}
		received++
		if received > wsClientBuffer {
			t.Fatal("channel was never closed after overflow")
		}
	}
	if received != wsClientBuffer {
		t.Errorf("expected %d buffered messages before close, got %d", wsClientBuffer, received)
	}

	// Unsubscribe after eviction must not panic.
	hub.Unsubscribe(1, ch)
}

func TestHubBroadcastWithoutSubscribersIsNoop(t *testing.T) {
	hub := NewHub()
	hub.Broadcast(7, wsMessage{Type: "new_event"}) // must not panic
}

func TestHubConcurrentAccess(t *testing.T) {
	hub := NewHub()
	var wg sync.WaitGroup

	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func(tokenID int64) {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				ch := hub.Subscribe(tokenID)
				hub.Broadcast(tokenID, wsMessage{Type: "new_event", Data: fmt.Sprintf("msg-%d", j)})
				hub.Unsubscribe(tokenID, ch)
			}
		}(int64(i % 4))
	}
	wg.Wait()
}
