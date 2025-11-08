# syntax=docker/dockerfile:1.4
#
# Optimized multi-stage Dockerfile for a Node.js service.
# - small final image
# - build caching for node_modules
# - non-root runtime user
# - supports projects with or without a build step
#
# Adjust NODE_VERSION, PORT and start command as needed.

ARG NODE_VERSION=18-alpine
ARG APP_PORT=3000

# Base image with a non-root user (reused by builder and runtime)
FROM node:${NODE_VERSION} AS base
ENV NODE_ENV=production
WORKDIR /app

# Create a dedicated non-root user
RUN addgroup -S app && adduser -S -G app app

# Builder stage (has build tools)
FROM base AS builder
ENV NODE_ENV=development

# Install build dependencies only in builder
RUN apk add --no-cache --virtual .build-deps \
    python3 make g++ git

# Leverage Docker BuildKit cache for npm
# Copy package manifests first to cache installs
COPY package*.json ./
# If you use yarn, copy yarn.lock here and replace the install line
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source, run build if present
COPY . .
RUN npm run build --if-present

# Remove build tools (optional since builder is discarded)
RUN apk del .build-deps || true

# Production image
FROM base AS production
ENV PORT=${APP_PORT}
EXPOSE ${PORT}

# Copy only the artifacts we need from the builder
# This copies built assets, node_modules and package files
COPY --from=builder /app /app

# Ensure correct ownership and drop to non-root user
RUN chown -R app:app /app
USER app

# Lightweight, robust healthcheck using node inside the image
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const p=process.env.PORT||${APP_PORT};const req=http.get({host:'127.0.0.1',port:p,path:'/health'},res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),2500);" || exit 1

# Default command - prefer using your package.json "start" script.
# Change to your app entry if required, e.g. ["node","dist/index.js"]
CMD ["npm","start"]