# Edge Server 🛰️

The orchestration engine for the Edge Build and Deploy platform. It manages user projects, deployments, and triggers ECS tasks for builds.

## 🚀 Features

- **Project Management**: CRUD operations for deployments and user projects.
- **Orchestration**: Automatically triggers AWS ECS tasks for new builds.
- **Authentication**: Secure access using GitHub App integration.
- **Prisma**: Type-safe database management with PostgreSQL.

---

## 🛠️ Configuration

Copy `.env.example` to `.env` and fill in the following:

| Variable          | Description                                   |
| :---------------- | :-------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string.                 |
| `AWS_ENDPOINT`    | (Optional) LocalStack endpoint for local dev. |
| `ECS_CLUSTER_ARN` | ARN of your ECS Cluster.                      |
| `KAFKA_BROKER`    | Kafka endpoint for log streaming.             |

---

## 🏠 Local Development

1.  **Start Infrastructure**:

    ```bash
    docker-compose up -d
    ```

2.  **Prisma Setup**:

    ```bash
    bun prisma generate
    bun prisma db push
    ```

3.  **Run Server**:
    ```bash
    bun run src/index.ts
    ```

---

## 🏗️ Docker Deployment

```bash
docker build -t edge-server .
docker run -p 3000:3000 --env-file .env edge-server
```
