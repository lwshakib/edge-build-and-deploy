# Edge Server 🛰️

The Edge Server is the central orchestration engine that powers the Edge Build and Deploy platform. It manages the lifecycle of projects, user accounts, and the triggering of high-performance build tasks.

## 🚀 Core Features

- **Project Orchestration**: Manages the creation, updates, and deletion of user projects.
- **Deployment Management**: Tracks the status of every deployment and triggers AWS ECS Fargate tasks.
- **Real-time Monitoring**: Integrates with Kafka and ClickHouse to store and broadcast deployment logs.
- **Type-safe Database**: Uses **Prisma** with PostgreSQL for robust data management.
- **Secure Authentication**: Handles complex authentication flows via GitHub App and traditional OAuth.

## �️ Technical Stack

- **Runtime**: Node.js (Bun)
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma), ClickHouse (Analytics)
- **Infrastructure**: AWS SDK (ECS, S3), Kafka, Redis

---

## 📚 Documentation

For detailed instructions on local setup, environment variables, and production deployment, see:
👉 **[Server Setup & Deployment Guideline](./GUIDELINE.md)**
