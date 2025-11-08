# /home/maxie/StreamlinePay-1/api/Dockerfile
# Multi-stage Dockerfile optimized for Node.js APIs (adjust NODE_VERSION/PORT as needed)

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder
LABEL org.opencontainers.image.source="StreamlinePay-1/api"

WORKDIR /usr/src/app

# Install production & dev dependencies, but cache package.json separately for layer caching
COPY package*.json ./

# Install build tools then dependencies (dev deps are needed for build)
RUN apk add --no-cache --virtual .build-deps build-base python3 \
    && npm ci

# Copy source and run optional build, then prune dev deps to keep only production packages
COPY . .
RUN npm run build --if-present \
    && npm prune --production \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* ~/.npm

# Final (runtime) image: small, non-root
FROM node:${NODE_VERSION}-alpine AS runner

ARG PORT=3000
ENV NODE_ENV=production \
        PORT=${PORT}

WORKDIR /usr/src/app

# Create unprivileged user
RUN addgroup -S app && adduser -S -G app app

# Copy artifact from builder (includes pruned node_modules and built assets)
COPY --from=builder /usr/src/app ./

# Use non-root user
USER app

EXPOSE ${PORT}

# Prefer package.json start script; falls back to node ./dist/index.js if defined there.
# Ensure your package.json defines a "start" script for production.
CMD ["npm", "start"]