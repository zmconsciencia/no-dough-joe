FROM node:20-alpine
WORKDIR /app

# Copy root config and lockfiles
COPY ../../package.json ../../yarn.lock ./
COPY ../../.yarn ./.yarn
COPY ../../.yarnrc.yml ./

# Copy frontend source
COPY ./packages/frontend ./packages/frontend

# Enable yarn and install
RUN corepack enable && corepack prepare yarn@4.9.2 --activate
RUN yarn install

# Start dev server (assumes Vite)
WORKDIR /app/packages/frontend
EXPOSE 3000
CMD ["yarn", "dev"]
