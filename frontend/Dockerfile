# Multi-stage build for React frontend

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for API Key
ARG VITE_API_KEY
ENV VITE_API_KEY=${VITE_API_KEY}

# Build the application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Create entrypoint script to substitute env vars and start nginx
RUN echo '#!/bin/sh\n\
envsubst "\$BACKEND_HOST \$GRAFANA_HOST \$API_KEY" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Start nginx with env substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
