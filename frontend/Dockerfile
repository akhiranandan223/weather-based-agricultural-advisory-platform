# Production Multi-Stage Dockerfile for Agricultural Advisory Frontend
# Stage 1: Build React/Vite assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

RUN npm ci --ignore-scripts

# Copy frontend source files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve via High-Performance Nginx Alpine
FROM nginx:1.25-alpine

# Remove default nginx assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with reverse proxy to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
