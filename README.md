# 🧾 No Dough Joe – Budgeting App

This is a Yarn 4 monorepo containing a fullstack budgeting tool, with a NestJS backend, PostgreSQL via Docker, and Prisma ORM. Future additions include a React frontend and receipt OCR pipeline.

---

## 🛠 Project Setup (Dev Machine)

This repo uses a Yarn v4 monorepo in `packages/`. You can run it using either:

* **Local CLI** (faster iteration, uses your local Node/Postgres)
* **Docker Compose** (isolated, production-like)

---

### ⚙️ 1. Prerequisites

| Tool           | Version                                       |
| -------------- | --------------------------------------------- |
| Node.js        | 20.x LTS (via [Corepack](https://nodejs.org)) |
| Yarn           | 4+ (enabled with `corepack enable`)           |
| Docker Desktop | 24+                                           |

---

### 📦 2. Clone and Install

```bash
git clone https://github.com/YOUR_ORG/no-dough-joe.git
cd no-dough-joe
corepack enable
yarn install
```

---

### 📁 3. Environment Variables

Create `.env` in the root:

```env
# For local CLI
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/budget
JWT_SECRET=your-secret
```

> ✅ Use `localhost` for CLI
> ✅ Use `db` for Docker Compose (`postgresql://postgres:postgres@db:5432/budget`)

---

## ▶️ Option A: Run Locally (CLI Mode)

> Fastest way to develop if you have Postgres installed or run it via Docker.

### 1. Start Postgres (if not running already)

```bash
docker compose up -d db
```

### 2. Run Prisma migration and generate client

```bash
yarn dlx prisma migrate dev --name init
```

### 3. Start backend in watch mode

```bash
cd packages/backend
yarn start:dev
```

> Access API at: [http://localhost:4000](http://localhost:4000)

---

## 🐳 Option B: Run with Docker Compose

> Fully containerized: Postgres + backend API

### 1. Switch `.env` to Docker mode

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/budget
```

### 2. Start all services

```bash
docker compose up -d --build
```

> Access API at: [http://localhost:4000](http://localhost:4000)

### 3. Run Prisma migration inside container

```bash
docker exec -it no-dough-joe-backend-1 npx prisma migrate deploy
```

*(If container name is different, run `docker ps` to confirm it)*

---

## ✅ Health Check

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| API      | [http://localhost:4000](http://localhost:4000) |
| Postgres | localhost:5432                                 |

---

### Swagger Docs

After running the backend, access Swagger UI:

http://localhost:4000/docs

---
🧪 Run frontend with Docker
```bash
docker compose up -d --build frontend
```

It will:

Build the React app

Serve it with Nginx

Be available at http://localhost:3000