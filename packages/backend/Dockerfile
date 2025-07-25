FROM node:20-alpine AS builder
WORKDIR /app

# Copy root files
COPY package.json yarn.lock ./
COPY .yarn .yarn
COPY .yarnrc.yml ./

# Copy backend code
COPY packages/backend ./packages/backend

# Install and build
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
RUN yarn workspaces focus backend
RUN yarn workspace backend run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./dist

CMD ["node", "dist/main.js"]
