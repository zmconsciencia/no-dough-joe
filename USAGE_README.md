# 📘 Project Usage: Prisma, Docker & Next Steps

---

## 🧠 Prisma Workflow (Backend)

### Where:
- Prisma schema lives in: `packages/backend/prisma/schema.prisma`
- Migrations: `packages/backend/prisma/migrations/`

### 🛠 When to Run `generate`
Run this anytime you change your `schema.prisma`:

```bash
npx prisma generate
```

This regenerates the Prisma Client for type-safe DB access.

### 🛠 When to Run `migrate`
Use this when adding/changing tables:

```bash
npx prisma migrate dev --name your_migration
```

This will:
- Create a migration file under `prisma/migrations`
- Apply it to your local DB
- Run `generate` automatically

### 📦 Pushing schema (no migration)
Only if you’re syncing to a fresh DB and don’t care about migrations (dev only):

```bash
npx prisma db push
```

### 🧪 Open Prisma Studio
```bash
npx prisma studio
```

---

## 🐳 Docker Compose Commands

### Start everything
```bash
docker compose up -d --build
```

### Stop containers
```bash
docker compose down
```

### Rebuild only backend
```bash
docker compose build backend
docker compose up -d backend
```

### View logs
```bash
docker compose logs -f
```

### Execute inside backend
```bash
docker compose exec backend sh
```

---

## 🪜 Next Development Steps

1. ✅ **Swagger UI**: Add Swagger module in NestJS (`@nestjs/swagger`) to expose REST docs
2. ✅ **Global .env loading**: Use `@nestjs/config` to load environment variables safely
3. 🧪 **Backend healthcheck** route (`/health`) for docker readiness and monitoring
4. 🧱 **Add services**: For real endpoints, connect Prisma to NestJS services
5. 🔐 **Add DTO validation** with `class-validator` and `ValidationPipe`
6. 🔐 **Authentication** (later): Add login & token logic
7. 🧭 **Frontend routing**: Add links to all FE pages and test them
8. 💅 **UI polish**: Apply your custom theme globally (MUI config)
9. 📦 **Seed DB** with a script: `npx prisma db seed`
10. 🚀 **Deployment prep**: Add production Dockerfile optimizations, nginx cache headers, etc.
