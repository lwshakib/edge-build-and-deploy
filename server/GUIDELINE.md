# Server Setup & Deployment Guideline 🛰️

This document provides setup instructions for the Edge Server orchestration engine running in a local-only environment.

---

## 🛠️ Configuration

Copy `.env.example` to `.env` and configure the following:

| Variable       | Description                       |
| :------------- | :-------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string.     |
| `KAFKA_BROKER` | Kafka endpoint for log streaming. |

---

## 🏠 Local Development (Zero AWS)

### 1. Start Infrastructure

```bash
docker-compose up -d
```

### 2. Setup Project

```bash
# Prisma setup
bun prisma generate
bun prisma db push

# Run server
bun run src/index.ts
```

### 3. Automatic Deployments

When a project is created or a deployment is triggered, the server will automatically execute a local Docker container using:

```bash
docker run --rm -e ... -v d:\edge-build-and-deploy\bucket:/home/app/bucket build-container:latest
```

---

## 🏗️ Docker Deployment

```bash
docker build -t edge-server .
docker run -p 3000:3000 --env-file .env edge-server
```
