FROM node:20-alpine
WORKDIR /app

# Copy root config and lockfiles
COPY ../../package.json ../../yarn.lock ./
COPY ../../.yarn ./.yarn
COPY ../../.yarnrc.yml ./

# Copy backend source
COPY ./packages/backend ./packages/backend

# Enable yarn and install
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
RUN yarn install

# Start dev server (NestJS)
WORKDIR /app/packages/backend
EXPOSE 4000
CMD ["yarn", "start:dev"]
