# constants for the build
LAST_COMMIT := $(or $(shell git rev-parse --short HEAD 2> /dev/null), "unknown")
VERSION := $(or $(shell git describe --tags --abbrev=0 2> /dev/null), "v0.0.0")
BUILD_STR := ${VERSION} (\#${LAST_COMMIT} $(shell date -u +"%Y-%m-%dT%H:%M:%S%z"))

GOPATH ?= $(HOME)/go
STUFFBIN ?= $(GOPATH)/bin/stuffbin

BIN := build/inhook

STATIC := frontend/dist:/admin


.PHONY: help build run clean docker-build docker-run dev frontend backend test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the Go backend
	@echo "Building Go backend..."
	@cd cmd && go build -o ../bin/inhook main.go

run: build ## Build and run the Go backend
	@echo "Running inHook backend..."
	@./bin/inhook

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@rm -rf bin/
	@rm -rf frontend/dist/

docker-build: ## Build Docker images
	@echo "Building Docker images..."
	docker-compose build

docker-run: ## Run services with Docker Compose
	@echo "Starting services with Docker Compose..."
	docker-compose up

docker-stop: ## Stop Docker services
	@echo "Stopping Docker services..."
	docker-compose down

dev: ## Start development environment (backend + frontend)
	@echo "Starting development environment..."
	@echo "Backend will run on http://localhost:8080"
	@echo "Frontend will run on http://localhost:3000"
	@echo ""
	@echo "Starting backend..."
	@cd cmd && go run main.go &
	@echo "Starting frontend..."
	@cd frontend && pnpm dev

backend: ## Start only the Go backend
	@echo "Starting Go backend..."
	@cd cmd && go run main.go

frontend: ## Start only the Vue frontend
	@echo "Starting Vue frontend..."
	@cd frontend && pnpm dev

install-deps: ## Install all dependencies
	@echo "Installing Go dependencies..."
	@go mod tidy
	@echo "Installing frontend dependencies..."
	@cd frontend && pnpm install

test: ## Run tests
	@echo "Running Go tests..."
	@go test ./...
	@echo "Running frontend tests..."
	@cd frontend && pnpm test

fmt: ## Format Go code
	@echo "Formatting Go code..."
	@go fmt ./...

lint: ## Lint Go code
	@echo "Linting Go code..."
	@go vet ./...
