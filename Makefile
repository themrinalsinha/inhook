# constants for the build
LAST_COMMIT := $(or $(shell git rev-parse --short HEAD 2> /dev/null), "unknown")
VERSION := $(or $(shell git describe --tags --abbrev=0 2> /dev/null), "v0.0.0")
BUILD_STR := ${VERSION} (\#${LAST_COMMIT} $(shell date -u +"%Y-%m-%dT%H:%M:%S%z"))

GOPATH ?= $(HOME)/go
STUFFBIN ?= $(GOPATH)/bin/stuffbin

BIN := build/inhook

STATIC := frontend/dist:/admin


.PHONY: build
build: $(BIN)

$(STUFFBIN): # install stuffbin if not present
	go install github.com/knadh/stuffbin/...

# build the binary with the build string and version if not present
$(BIN): $(shell find . -type f -name "*.go") go.mod
	@CGO_ENABLED=0 go build \
		-o ${BIN} \
		-ldflags="-s -w \
			-X 'main.buildString=${BUILD_STR}' \
			-X 'main.versionString=${VERSION}'" \
		cmd/*.go

.PHONY: run
run:
	@CGO_ENABLED=0 go run \
		-ldflags="-s -w \
			-X 'main.buildString=${BUILD_STR}' \
			-X 'main.versionString=${VERSION}' \
			-X 'main.frontendDir=frontend/dist'" \
		cmd/*.go

.PHONY: build-frontend
build-frontend:
	cd frontend && pnpm build

.PHONY: run-frontend
run-frontend:
	cd frontend && pnpm install && pnpm run dev

.PHONY: pack-bin
pack-bin: build-frontend $(BIN) $(STUFFBIN)
	$(STUFFBIN) -a stuff -in ${BIN} -out ${BIN} ${STATIC}

.PHONY: dist
dist: $(STUFFBIN) build build-frontend pack-bin

.PHONY: clean
clean:
	rm -rf build && rm -rf frontend/dist
