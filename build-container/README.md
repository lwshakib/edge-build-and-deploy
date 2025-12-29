# Build Container 🏗️

The Build Container is a specialized runtime environment responsible for transforming source code into production-ready assets. It serves as the "worker" in the Edge Build and Deploy architecture.

## 🌟 Purpose

In a modern CI/CD flow, you need an isolated, reproducible environment to:

- Clone private or public repositories.
- Safely install dependencies (using Bun).
- Execute build scripts.
- Securely transfer assets to cloud storage.
- Provide real-time feedback through logs.

## 🚀 Core Features

- **Isolated Builds**: Each build runs in its own container instance, preventing cross-build contamination.
- **Fast Runtimes**: Utilizes **Bun** for ultra-fast package installation and script execution.
- **Streaming Logs**: Built-in Kafka integration streams `stdout` and `stderr` directly to the dashboard.
- **S3 Integration**: Automatically handles asset versioning and uploading to Amazon S3.
- **Framework Agnostic**: Can build any project that has a `build` script in `package.json`.

---

## 📚 Documentation

For information on how to setup, configure, and run this container, please refer to the:
👉 **[Setup & Deployment Guideline](./GUIDELINE.md)**
