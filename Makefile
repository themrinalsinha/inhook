LAST_COMMIT_HASH_FULL := $(shell git rev-parse HEAD)
LAST_COMMIT_HASH_SHORT := $(shell git rev-parse --short HEAD)
BASE_VERSION := $(shell git describe --tags --abbrev=0 2>/dev/null || echo 0.0.0)

GOPATH ?= $(HOME)/go
STUFFBIN ?= $(GOPATH)/bin/stuffbin

BUILD_DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

BIN := inhook

BUILD_GOOS ?= $(shell go env GOOS)
BUILD_GOARCH ?= $(shell go env GOARCH)

FRONTEND_DIR := frontend
FRONTEND_DIST := ${FRONTEND_DIR}/dist
STATIC := ${FRONTEND_DIST}:/

APP_VERSION := $(BASE_VERSION) ($(LAST_COMMIT_HASH_SHORT))

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
	@CGO_ENABLED=0 GOOS=$(BUILD_GOOS) GOARCH=$(BUILD_GOARCH) go build -o ${BIN} \
		-ldflags="-s -w \
		-X 'main.buildVersion=$(APP_VERSION)' \
		-X 'main.buildHash=$(LAST_COMMIT_HASH_SHORT)' \
		-X 'main.buildDate=$(BUILD_DATE)' \
		-X 'main.buildHashFull=$(LAST_COMMIT_HASH_FULL)'" \
		cmd/*.go
	@echo "Built $(BIN) for $(BUILD_GOOS)/$(BUILD_GOARCH) version $(APP_VERSION) with hash $(LAST_COMMIT_HASH_FULL)"

.PHONY: build-frontend
build-frontend:
	@export VITE_APP_VERSION="${APP_VERSION}" VITE_BUILD_COMMIT_HASH="${LAST_COMMIT_HASH_FULL}" \
		&& cd ${FRONTEND_DIR} \
		&& pnpm install \
		&& pnpm build --mode production
	@echo "✅ Built frontend in ${FRONTEND_DIST}"

.PHONY: run
run:
	@$(MAKE) build-frontend
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
	@export VITE_APP_VERSION="${APP_VERSION}" VITE_BUILD_COMMIT_HASH="${LAST_COMMIT_HASH_FULL}" \
		&& cd ${FRONTEND_DIR} \
		&& pnpm dev --host 0.0.0.0

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

.PHONY: build-linux
build-linux:
	@$(MAKE) build BUILD_GOOS=linux BUILD_GOARCH=amd64

DIST_DIR := dist

.PHONY: dist
dist:
	@$(MAKE) build-frontend
	@mkdir -p $(DIST_DIR)
	@$(MAKE) dist-package BUILD_GOOS=darwin BUILD_GOARCH=arm64
	@$(MAKE) dist-package BUILD_GOOS=linux BUILD_GOARCH=amd64
	@cd $(DIST_DIR) && shasum -a 256 *.tar.gz > checksums.txt
	@echo "✅ Built release archives in $(DIST_DIR)/"

# $(BIN) is a file target, so a leftover binary from a previous build would make
# the compile for the next OS/arch silently skip — remove it before and after.
.PHONY: dist-package
dist-package:
	@rm -f $(BIN)
	@$(MAKE) build-backend stuff BUILD_GOOS=$(BUILD_GOOS) BUILD_GOARCH=$(BUILD_GOARCH)
	@tar -czf $(DIST_DIR)/$(BIN)_$(BASE_VERSION)_$(BUILD_GOOS)_$(BUILD_GOARCH).tar.gz $(BIN)
	@rm -f $(BIN)
