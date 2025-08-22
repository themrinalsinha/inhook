# inHook - Webhook Inspector & Debugger

A full-stack web application for inspecting and debugging webhook requests in real-time. Built with Vue 3, TypeScript, TailwindCSS, and Go.

## Features

- **Real-time Webhook Capture**: Automatically captures any HTTP request sent to your unique webhook URL
- **Live Event Updates**: WebSocket-powered real-time updates when new webhook requests arrive
- **Comprehensive Request Inspection**: View headers, body, query parameters, and response details
- **Modern UI**: Clean, responsive interface built with shadcn-vue components and TailwindCSS
- **Dark Mode Support**: Built-in dark/light theme switching
- **Copy to Clipboard**: Easy webhook URL copying for integration

## Tech Stack

### Frontend
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn-vue** for UI components
- **Vite** for build tooling

### Backend
- **Go (Golang)** with Gin framework
- **WebSocket** support for real-time communication
- **In-memory storage** for events (configurable)
- **RESTful API** endpoints

## Quick Start

### Prerequisites
- Go 1.24+
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inhook
   ```

2. **Install dependencies**
   ```bash
   make install-deps
   ```

3. **Start the development environment**
   ```bash
   make dev
   ```

This will start both the backend (port 8080) and frontend (port 3000) services.

### Alternative: Docker

```bash
# Build and run with Docker Compose
make docker-build
make docker-run
```

## Usage

1. **Open the application** in your browser at `http://localhost:3000`

2. **Generate a webhook URL** by clicking the "Generate URL" button

3. **Copy the webhook URL** and use it in your applications or testing tools

4. **Send requests** to the webhook URL - they will appear in real-time on the dashboard

5. **Click on events** to view detailed information including headers, body, and query parameters

## API Endpoints

### Backend API
- `POST /api/sessions` - Create a new webhook session
- `GET /api/sessions/:id` - Get session information
- `GET /api/events/:id` - Get events for a session

### WebSocket
- `GET /ws/:id` - WebSocket connection for real-time updates

### Webhook Capture
- `ANY /events/:id` - Captures incoming webhook requests

## Development

### Project Structure
```
inhook/
├── cmd/                    # Go backend source
│   └── main.go           # Main application entry point
├── frontend/              # Vue frontend
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── composables/  # Vue composables
│   │   ├── services/     # API and WebSocket services
│   │   ├── types/        # TypeScript type definitions
│   │   └── lib/          # Utility functions
│   ├── package.json      # Frontend dependencies
│   └── tailwind.config.js # TailwindCSS configuration
├── Dockerfile             # Backend container
├── docker-compose.yml     # Multi-service orchestration
└── Makefile              # Build and development commands
```

### Available Commands

```bash
make help          # Show all available commands
make dev           # Start development environment
make backend       # Start only the Go backend
make frontend      # Start only the Vue frontend
make build         # Build the Go backend
make docker-build  # Build Docker images
make docker-run    # Run with Docker Compose
make test          # Run tests
make fmt           # Format Go code
make lint          # Lint Go code
```

### Frontend Development

```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Backend Development

```bash
cd cmd
go run main.go   # Run the backend
go test ./...    # Run tests
go fmt ./...     # Format code
```

## Configuration

### Environment Variables

The frontend can be configured with these environment variables:

- `VITE_API_BASE` - Backend API base URL (default: `http://localhost:8080`)

### Backend Configuration

The backend runs on port 8080 by default. You can modify the port in `cmd/main.go`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn-vue](https://shadcn-vue.com/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vue.js](https://vuejs.org/) for the progressive JavaScript framework
- [Gin](https://gin-gonic.com/) for the Go web framework
