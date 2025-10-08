LAST_COMMIT_HASH_FULL := $(shell git rev-parse HEAD)
LAST_COMMIT_HASH_SHORT := $(shell git rev-parse --short HEAD)

GOPATH ?= $(HOME)/go
STUFFBIN ?= $(GOPATH)/bin/stuffbin

BASE_VERSION := 0.0.1
APP_VERSION := $(BASE_VERSION)
BUILD_DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

BIN := bin/inhook

FRONTEND_DIR := frontend
FRONTEND_DIST := ${FRONTEND_DIR}/dist
STATIC := ${FRONTEND_DIST}:/

ifeq ($(shell git describe --tags --exact-match 2>/dev/null),)
	APP_VERSION := v$(APP_VERSION) ($(LAST_COMMIT_HASH_SHORT))
endif

.PHONY: display-version-info
display-version-info:
	@echo "Version: $(APP_VERSION)"
	@echo "Last commit hash: $(LAST_COMMIT_HASH_FULL)"
	@echo "Last commit hash short: $(LAST_COMMIT_HASH_SHORT)"
	@echo "Build date: $(BUILD_DATE)"

.PHONY: build
build-backend: $(BIN)

$(STUFFBIN):
	go install github.com/knadh/stuffbin/...

$(BIN): $(shell find . -type f -name "*.go") go.mod go.sum
	@CGO_ENABLED=0 go build -o ${BIN} \
		-ldflags="-s -w \
		-X 'main.buildVersion=$(APP_VERSION)' \
		-X 'main.buildHash=$(LAST_COMMIT_HASH_SHORT)' \
		-X 'main.buildDate=$(BUILD_DATE)' \
		-X 'main.buildHashFull=$(LAST_COMMIT_HASH_FULL)'" \
		cmd/*.go
	@echo "Built $(BIN) version $(APP_VERSION) with hash $(LAST_COMMIT_HASH_FULL)"

.PHONY: build-frontend
build-frontend:
	@export VITE_APP_VERSION="${APP_VERSION}"
	@cd ${FRONTEND_DIR} && pnpm build
	@echo "✅ Built frontend in ${FRONTEND_DIST}"

.PHONY: run
run:
	@CGO_ENABLED=0 go run \
		-ldflags="-s -w \
		-X 'main.buildVersion=$(APP_VERSION)' \
		-X 'main.buildHash=$(LAST_COMMIT_HASH_SHORT)' \
		-X 'main.buildDate=$(BUILD_DATE)' \
		-X 'main.buildHashFull=$(LAST_COMMIT_HASH_FULL)'" \
		cmd/*.go
	@echo "✅ Running $(BIN) version $(APP_VERSION)"

.PHONY: run-frontend
run-frontend:
	@cd ${FRONTEND_DIR} && pnpm install
	@export VITE_APP_VERSION="${APP_VERSION}" && cd ${FRONTEND_DIR} && pnpm dev --host 0.0.0.0

.PHONY: stuff
stuff: $(STUFFBIN)
	@echo "Stuffing static files into $(BIN)"
	@$(STUFFBIN) -a stuff -in ${BIN} -out ${BIN} ${STATIC}

.PHONY: build
build:
	@$(MAKE) build-frontend
	@$(MAKE) build-backend
	@$(MAKE) stuff
	@echo "✅ Built $(BIN) version $(APP_VERSION) with hash $(LAST_COMMIT_HASH_FULL)"
