# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

A full-stack dashboard application for tracking cohort/student progress in a coding camp.
The system scrapes data from Dicoding Coding Camp using Selenium and presents it via a modern React dashboard.

## Tech Stack

### Frontend (`/frontend`)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State/Fetching**: React Query
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library

### Backend (`/backend`)
- **Language**: Python 3.14
- **Framework**: FastAPI
- **Package Manager**: uv
- **Scraping**: Selenium (Standalone Chrome container)
- **Task Queue**: Redis (for background scraping jobs)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Prometheus + Grafana + cAdvisor + Redis Exporter
- **Reverse Proxy**: Nginx (in production)

## Project Structure

```
protype-dashboard/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui primitives
│   │   │   └── dashboard/  # Dashboard components
│   │   ├── data/           # Data models and utilities
│   │   ├── lib/            # Utilities (cn helper)
│   │   ├── pages/          # Route page components
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── backend/                # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application entry
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic (scraper)
│   │   └── utils/          # Helpers
│   ├── output/             # Scraped JSON data storage
│   └── pyproject.toml      # Python dependencies (uv)
│
├── monitoring/             # Monitoring configuration
│   ├── prometheus/         # Prometheus config & alerts
│   ├── grafana/            # Grafana provisioning & dashboards
│   └── alertmanager/       # Alertmanager config
│
├── diCodex/                # Legacy/Standalone scraping scripts (reference only)
├── docker-compose.yml      # Main Docker Compose config
├── docker-compose.dev.yml  # Development Docker Compose config
└── README.md
```

## Development Workflow

### Docker (Recommended)

Run the entire stack with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up
```

- Frontend: http://localhost:8080
- Backend API: Accessible via http://localhost:8080/api (proxied)
- Selenium VNC: http://localhost:7900 (password: secret)
- Grafana: http://localhost:3001

### Local Development

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
# Install dependencies with uv
uv sync
# Run development server
uv run uvicorn app.main:app --reload --port 3000
```

## Code Style Guidelines

### Frontend (React/TS)

- **Imports**: Use `@/` alias for src imports (e.g., `import { Button } from "@/components/ui/button"`).
- **Components**: Functional components with named exports or default exports.
- **Styling**: Use Tailwind CSS exclusively. Combine classes with `cn()`.
- **Types**: Define interfaces/types in `src/data` or collocated with components.
- **Linting**: Ensure `npm run lint` passes.

### Backend (Python)

- **Style**: Follow PEP 8 guidelines.
- **Type Hints**: Use Python type hints strictly (FastAPI relies on them).
- **Async**: Use `async/await` for route handlers and I/O bound operations.
- **Dependency Management**: Use `uv add <package>` to add dependencies.

## Testing

- **Frontend**: Run `npm run test` in `frontend/` directory.
- **Backend**: (Add instructions if pytest is configured, otherwise manual testing via API docs).

## Common Tasks

### Adding a new UI Component
1. Run `npx shadcn@latest add [component-name]` in `frontend/`.
2. Customize in `frontend/src/components/ui/`.

### Modifying the Scraper
1. Edit `backend/app/services/scraper.py`.
2. Ensure Selenium selectors are robust.
3. Test with `docker-compose up` to verify scraping flow.

### Monitoring
- **Prometheus**: Config at `monitoring/prometheus/prometheus.yml`.
- **Grafana**: Dashboards at `monitoring/grafana/dashboards/`.
- **Alerts**: Rules at `monitoring/prometheus/alert_rules.yml`.
