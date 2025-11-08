# syntax=docker/dockerfile:1.4
# Multi-stage optimized Dockerfile for a Node-based frontend (works with npm or yarn)
# Build stage
FROM node:20-alpine AS builder
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

# Cache package manager files between builds and speed up installs (requires BuildKit)
# Copy lockfiles first for better layer caching
COPY package.json package-lock.json yarn.lock* ./

# Install deps (detect yarn vs npm)
# Use cache mount for npm/yarn to speed up repeated builds (BuildKit)
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/root/.cache/yarn \
    if [ -f yarn.lock ]; then \
      apk add --no-cache --virtual .gyp python3 make g++ && \
      yarn install --frozen-lockfile --production=false && \
      apk del .gyp ; \
    else \
      apk add --no-cache --virtual .gyp python3 make g++ && \
      npm ci --no-audit --prefer-offline && \
      apk del .gyp ; \
    fi

# Copy app sources (this keeps deps layer cached if package files didn't change)
COPY . .

# Build the production static assets
# Many apps output to "build" (CRA) or "dist" (Vue/others) — keep flexible
RUN npm run build --if-present && yarn build --if-present

# Production stage: serve static files with a slim nginx image
FROM nginx:stable-alpine AS production
ENV TZ=UTC
# Minimal required directories
RUN mkdir -p /usr/share/nginx/html

# Copy build artifacts (handles both /app/build and /app/dist)
COPY --from=builder /app/build /tmp/build || true
COPY --from=builder /app/dist /tmp/dist || true
RUN if [ -d /tmp/build ]; then \
      cp -a /tmp/build/. /usr/share/nginx/html; \
    elif [ -d /tmp/dist ]; then \
      cp -a /tmp/dist/. /usr/share/nginx/html; \
    else \
      echo "Warning: no build output found" && mkdir -p /usr/share/nginx/html; \
    fi && rm -rf /tmp/build /tmp/dist

# Optional: custom nginx config (uncomment and add nginx.conf to project root to use)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- --timeout=2 http://localhost/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]