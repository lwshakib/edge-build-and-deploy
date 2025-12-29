# Setup & Deployment Guideline 🛠️

This document provides a step-by-step guide on how to configure, build, and deploy the Build Container locally.

---

## 🚀 How it Works

1.  **Clone**: The container clones the Git repository into `/home/app/output`.
2.  **Build**: It runs `bun install` and `bun run build`.
3.  **Local Storage**: Build outputs are copied to a local `bucket` folder shared with the reverse proxy.
4.  **Log**: Logs are streamed to Kafka for real-time monitoring.

---

## 🛠️ Local Setup Guide

### 1. Start Infrastructure

Run the core services:

```bash
docker-compose up -d
```

This starts **PostgreSQL**, **ClickHouse**, **Kafka**, and **MailHog**.

### 2. Build the Container Image

```bash
docker build -t build-container:latest .
```

### 3. Run a Manual Build Simulation

To test the flow manually, run the container with the required environment variables and mount the local `bucket` folder:

```powershell
docker run -e PROJECT_ID="local-project" -e DEPLOYMENT_ID="local-deploy" -e KAFKA_BROKER="host.docker.internal:9092" -e GIT_REPOSITORY__URL="https://github.com/lwshakib/vite-app.git" -v d:\edge-build-and-deploy\bucket:/home/app/bucket build-container:latest
```

---

## 🔑 Environment Variables

| Variable              | Required | Description                                     |
| :-------------------- | :------: | :---------------------------------------------- |
| `PROJECT_ID`          |   Yes    | Unique ID for the project.                      |
| `DEPLOYMENT_ID`       |   Yes    | Unique ID for this specific build.              |
| `KAFKA_BROKER`        |   Yes    | Kafka broker endpoint (e.g., `localhost:9092`). |
| `GIT_REPOSITORY__URL` |   Yes    | URL of the repo to build.                       |
