# Project variables
APP_NAME := protype-dashboard
DOCKER_IMAGE := $(APP_NAME)
DOCKER_TAG := latest

# Colors for terminal output
GREEN := \033[0;32m
NC := \033[0m # No Color

.PHONY: help install dev build preview test test-watch lint lint-fix clean docker-build docker-run docker-stop docker-clean

## Help
help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

## Development
install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

build-dev: ## Build for development (unminified)
	npm run build:dev

preview: ## Preview production build
	npm run preview

## Testing
test: ## Run tests once
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

## Linting
lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint -- --fix

## Cleanup
clean: ## Remove build artifacts and node_modules
	rm -rf dist node_modules coverage

clean-build: ## Remove build artifacts only
	rm -rf dist coverage

## Docker
docker-build: ## Build Docker image
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-run: ## Run Docker container
	docker run -d --name $(APP_NAME) -p 8080:80 $(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)Container running at http://localhost:8080$(NC)"

docker-stop: ## Stop and remove Docker container
	docker stop $(APP_NAME) || true
	docker rm $(APP_NAME) || true

docker-clean: docker-stop ## Stop container and remove image
	docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) || true

docker-logs: ## Show Docker container logs
	docker logs -f $(APP_NAME)

docker-shell: ## Open shell in running container
	docker exec -it $(APP_NAME) /bin/sh

## Combined commands
docker-rebuild: docker-clean docker-build docker-run ## Rebuild and run Docker container

ci: lint test build ## Run CI pipeline (lint, test, build)
