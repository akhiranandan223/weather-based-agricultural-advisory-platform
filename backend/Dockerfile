# Production-ready Node.js Dockerfile for Agricultural Advisory Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./

RUN npm ci --only=production --ignore-scripts

# Copy full application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start production server
CMD ["node", "server.js"]
