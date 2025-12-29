# Edge Build and Deploy 🚀

A high-performance deployment platform that clones Git repositories, builds them using Bun, and serves them via a custom reverse proxy.

## 🏗️ Architecture

- **Web Dashboard**: Next.js app to manage projects and deployments.
- **Server**: Node.js/Express backend handling orchestration and ECS task management.
- **Build Container**: A specialized Docker container that builds projects and uploads to S3.
- **Custom Reverse Proxy**: Maps subdomains to S3 outputs for ultra-fast serving.
- **Infrastructure**: Kafka (logs), PostgreSQL (data), Redis (cache), ClickHouse (analytics), S3 (storage).

---

## 🏠 Local Development (Zero AWS)

You can run the entire stack on your local machine using **Docker Compose** and **LocalStack**.

### 1. Prerequisites

- Docker & Docker Compose
- Bun (for local testing)
- AWS CLI Local (optional, for debugging S3/ECS locally)

### 2. Spin up the Infrastructure

```bash
docker-compose up -d
```

This starts:

- **LocalStack**: Mocks S3 and ECS.
- **Kafka & Zookeeper**: Event streaming.
- **PostgreSQL**: Project metadata.
- **Redis**: Caching and sessions.
- **ClickHouse**: Analytics logs.
- **MailHog**: Local email testing.

### 3. Setup Local S3

Ensure you create the bucket in LocalStack:

```bash
# Using awslocal
awslocal s3 mb s3://my-deployment-bucket
```

### 4. Configure Services

Update the `.env` files in `server/`, `build-container/`, and `custom-reverse-proxy/` to point to `localstack`.

#### Example `.env` settings:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=ap-south-1
AWS_ENDPOINT=http://localhost:4566

# S3 Configuration
S3_BUCKET_NAME=my-deployment-bucket
S3_BASE_URL=http://localhost:4566/my-deployment-bucket/__outputs
```

---

## 🚀 Deployment

Refer to individual service READMEs for specific deployment guides:

- [Build Container](./build-container/README.md)
- [Custom Reverse Proxy](./custom-reverse-proxy/README.md)
- [Server](./server/README.md)
