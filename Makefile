LAST_COMMIT_HASH_FULL := $(shell git rev-parse HEAD)
LAST_COMMIT_HASH_SHORT := $(shell git rev-parse --short HEAD)

BASE_VERSION := 0.0.1
APP_VERSION := $(BASE_VERSION)
ifeq ($(shell git describe --tags --exact-match 2>/dev/null),)
	APP_VERSION := v$(APP_VERSION) ($(LAST_COMMIT_HASH_SHORT))
endif

display-version-info:
	@echo "Version: $(APP_VERSION)"
	@echo "Last commit hash: $(LAST_COMMIT_HASH_FULL)"
	@echo "Last commit hash short: $(LAST_COMMIT_HASH_SHORT)"

GOPATH ?= $(HOME)/go
STUFFBIN ?= $(GOPATH)/bin/stuffbin

BIN := inhook

.PHONY: build
build: $(BIN)

$(STUFFBIN):
	go install github.com/knadh/stuffbin/...

$(BIN): $(shell find . -type f -name "*.go") go.mod go.sum
	@CGO_ENABLED=0 go build -o ${BIN} \
		-ldflags="-s -w -X 'main.buildVersion=$(APP_VERSION)' \
		-X 'main.buildHash=$(LAST_COMMIT_HASH_SHORT)' \
		-X 'main.buildDate=$(shell date -u +%Y-%m-%d-%H:%M:%S)' \
		-X 'main.buildHashFull=$(LAST_COMMIT_HASH_FULL)'" \
		./cmd/api
	@echo "Built $(BIN) version $(APP_VERSION) with hash $(LAST_COMMIT_HASH_FULL)"

STATIC := frontend/dist:
