# syntax=docker/dockerfile:1.4
#
# Multi-stage optimized Dockerfile for a Node.js "worker".
# - Uses BuildKit cache mounts for fast installs
# - Builds in a builder image, prunes dev deps, copies only runtime artifacts
# - Runs as a non-root user
#
# Adjust NODE_VERSION, build steps or CMD as needed for your project.

ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install build-time deps for native modules (removed later)
RUN apk add --no-cache --virtual .build-deps python3 make g++ git

# Copy package manifests first for better layer caching
COPY package*.json ./

# Use npm ci with a cache mount to speed repeated builds (requires BuildKit)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --prefer-offline --progress=false

# Copy source, build if project has a build step
COPY . .
RUN npm run build --if-present

# Remove dev dependencies to keep node_modules minimal for production
RUN npm prune --production

# Remove build-time packages
RUN apk del .build-deps

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Create an unprivileged user
RUN addgroup -S app && adduser -S app -G app

# Copy only the runtime artifacts from builder
COPY --from=builder /usr/src/app ./

# Ensure proper ownership and drop to non-root user
RUN chown -R app:app /usr/src/app
USER app

# Default command: prefer package.json "start" script for flexibility.
# Override in docker-compose / kubernetes / CLI as needed.
CMD ["npm", "start"]