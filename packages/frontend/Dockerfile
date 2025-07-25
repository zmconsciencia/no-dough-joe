# Step 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root dependencies
COPY package.json yarn.lock ./

# Copy frontend workspace
COPY packages/frontend ./packages/frontend

# Focus only frontend deps and build it
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
RUN yarn workspaces focus frontend
RUN yarn workspace frontend build

# Step 2: Serve
FROM nginx:1.27-alpine
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
