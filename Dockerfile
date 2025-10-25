# Multi-stage build for optimized image size
FROM node:18-slim AS base

# Install dependencies for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install chromium --with-deps

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/screenshots /app/.config

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Set timezone to IST
ENV TZ=Asia/Kolkata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Default environment variables
ENV NODE_ENV=production
ENV HEADLESS=true
ENV SCREENSHOTS_ENABLED=true
ENV NOTIFICATIONS_ENABLED=true
ENV LOGIN_TIME=09:30
ENV LOGOUT_TIME=19:30
ENV RANDOM_DELAY=5

# Health check
HEALTHCHECK --interval=1h --timeout=30s --start-period=10s --retries=3 \
    CMD ps aux | grep -q '[c]ron' || exit 1

# Volumes for persistent data
VOLUME ["/app/logs", "/app/screenshots", "/app/.config"]

# Run entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
