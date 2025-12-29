# Edge Build and Deploy 🚀

A high-performance deployment platform that clones Git repositories, builds them locally using Docker, and serves them via a custom reverse proxy from a local storage.

## 🏗️ Architecture

- **Web Dashboard**: Next.js app to manage projects and deployments.
- **Server**: Node.js/Express backend that triggers local Docker builds.
- **Build Container**: A specialized container that builds projects and saves outputs to a shared `bucket` folder.
- **Custom Reverse Proxy**: Maps subdomains to the local `bucket` folder for ultra-fast serving.
- **Infrastructure**: Kafka (logs), PostgreSQL (data), ClickHouse (analytics), MailHog (email).

---

## 🏠 Local Development (No AWS Required)

### 1. Prerequisites

- Docker & Docker Compose
- Bun (for local testing)

### 2. Spin up the Infrastructure

```bash
docker-compose up -d
```

This starts:

- **Kafka & Zookeeper**: Event streaming.
- **PostgreSQL**: Project metadata.
- **ClickHouse**: Analytics logs.
- **MailHog**: Local email testing.

### 3. Setup Services

1.  **Build Container**:
    ```bash
    cd build-container
    docker build -t build-container:latest .
    cd ..
    ```
2.  **Server**:
    ```bash
    cd server
    bun install
    bun prisma generate
    bun prisma db push
    bun run src/index.ts
    ```
3.  **Reverse Proxy**:
    ```bash
    cd custom-reverse-proxy
    bun install
    bun run index.ts
    ```

### 4. How it works

- The **Server** triggers a `docker run` command with a volume mount: `-v d:\edge-build-and-deploy\bucket:/home/app/bucket`.
- The **Build Container** writes build outputs to `/home/app/bucket/__outputs/PROJECT_ID`.
- The **Reverse Proxy** reads from `d:\edge-build-and-deploy\bucket\__outputs\SUBDOMAIN`.

---

## 🚀 Deployment Guidelines

- [Build Container](./build-container/GUIDELINE.md)
- [Server](./server/GUIDELINE.md)
- [Reverse Proxy](./custom-reverse-proxy/README.md)
