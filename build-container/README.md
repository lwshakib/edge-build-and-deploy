# Build Container 🏗️

This container is the core of the deployment pipeline. It handles cloning Git repositories, building the assets using Bun, and uploading the final distribution to Amazon S3 while streaming real-time logs to Kafka.

---

## 🚀 How it Works

1.  **Clone**: The container starts by cloning the target Git repository into `/home/app/output`.
2.  **Build**: It cleans the environment, installs dependencies, and executes the `build` script defined in the project's `package.json`.
3.  **Upload**: All files in the `dist` (or output) folder are recursively uploaded to the specified S3 bucket.
4.  **Log**: Every step (stdout/stderr) is captured and sent to a Kafka topic (`container-logs`) for real-time monitoring on the dashboard.

---

## 🛠️ Step-by-Step Setup Guide

### 1. AWS S3 Setup

- **Create Bucket**: Go to the S3 Console and create a new bucket.
  - _Example Name_: `my-deployment-bucket` (Names must be globally unique).
- **Permissions**: Ensure the IAM user/role running the container has the following policy:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "Statement1",
        "Effect": "Allow",
        "Principal": "*",
        "Action": ["s3:PutObject", "s3:GetObject"],
        "Resource": "arn:aws:s3:::edge.vexx.com/*"
      }
    ]
  }
  ```

### 2. Deploy to AWS ECR 📦

Before running on ECS, you must upload the container image to AWS ECR.

1.  **Create Repository**:

    ```bash
    aws ecr create-repository --repository-name build-container --region ap-south-1
    ```

2.  **Authenticate Docker**:

    ```bash
    aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
    ```

3.  **Build, Tag, and Push**:

    ```bash
    # Build
    docker build -t build-container .

    # Tag
    docker tag build-container:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/build-container:latest

    # Push
    docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/build-container:latest
    ```

### 3. AWS ECS Setup (Fargate)

- **Create Cluster**: Use the "Networking only" (Fargate) template.
- **Create Task Definition**:
  - **Launch Type**: FARGATE.
  - **Container Image**: Point it to the URI from the ECR push step (e.g., `<AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/build-container:latest`).
  - **Environment Variables**: Add all mandatory variables listed below.
- **Network**: Ensure the VPC has an Internet Gateway (or NAT Gateway) so the container can clone from GitHub and reach S3/Kafka.

### 4. Build & Run locally

#### Build the image:

```bash
docker build -t build-container .
```

#### Run the container:

**Bash (Linux/macOS/Git Bash):**

```bash
docker run \
  -e PROJECT_ID="demo-app" \
  -e DEPLOYMENT_ID="v1" \
  -e S3_BUCKET_NAME="my-deployment-bucket" \
  -e AWS_ACCESS_KEY_ID="xxx" \
  -e AWS_SECRET_ACCESS_KEY="xxx" \
  -e KAFKA_BROKER="xxx.upstash.io:9092" \
  -e GIT_REPOSITORY__URL="https://github.com/user/repo.git" \
  build-container
```

**PowerShell (Windows):**

```powershell
docker run `
  -e PROJECT_ID="demo-app" `
  -e DEPLOYMENT_ID="v1" `
  -e S3_BUCKET_NAME="my-deployment-bucket" `
  -e AWS_ACCESS_KEY_ID="xxx" `
  -e AWS_SECRET_ACCESS_KEY="xxx" `
  -e KAFKA_BROKER="xxx.upstash.io:9092" `
  -e GIT_REPOSITORY__URL="https://github.com/user/repo.git" `
  build-container
```

**Command Prompt (Windows CMD):**

```cmd
docker run ^
  -e PROJECT_ID="demo-app" ^
  -e DEPLOYMENT_ID="v1" ^
  -e S3_BUCKET_NAME="my-deployment-bucket" ^
  -e AWS_ACCESS_KEY_ID="xxx" ^
  -e AWS_SECRET_ACCESS_KEY="xxx" ^
  -e KAFKA_BROKER="xxx.upstash.io:9092" ^
  -e GIT_REPOSITORY__URL="https://github.com/user/repo.git" ^
  build-container
```

---

## 🔑 Environment Variables

| Variable                | Required | Description                                     |
| :---------------------- | :------: | :---------------------------------------------- |
| `PROJECT_ID`            |   Yes    | Unique ID for the project.                      |
| `DEPLOYMENT_ID`         |   Yes    | Unique ID for this specific build.              |
| `S3_BUCKET_NAME`        |   Yes    | Target S3 bucket name.                          |
| `AWS_ACCESS_KEY_ID`     |   Yes    | AWS Access Key.                                 |
| `AWS_SECRET_ACCESS_KEY` |   Yes    | AWS Secret Key.                                 |
| `KAFKA_BROKER`          |   Yes    | Kafka broker endpoint.                          |
| `GIT_REPOSITORY__URL`   |   Yes    | URL of the repo to build.                       |
| `AWS_ENDPOINT`         |    No    | Endpoint for local S3 (e.g., `http://localhost:4566`). |
| `KAFKA_USERNAME`        |    No    | SASL Plain Username.                            |
| `KAFKA_PASSWORD`        |    No    | SASL Plain Password.                            |
| `KAFKA_CA_FILE`         |    No    | Filename of the CA certificate (place in root). |

---

## 🏠 Running Locally (No AWS Required)

To run the entire system on your local machine without needing an actual AWS account, you can use **LocalStack**.

### 1. Start LocalStack (S3)
Run this command to start a local S3 service:
```bash
docker run -d -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
```

### 2. Create the Local Bucket
```bash
# Install awscli-local if you haven't: pip install awscli-local
awslocal s3 mb s3://my-deployment-bucket
```

### 3. Configure Environment Variables

**For Build Container:**
```env
S3_BUCKET_NAME=my-deployment-bucket
AWS_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```
*(Note: If running the container inside Docker, use `http://host.docker.internal:4566` as the endpoint.)*

**For Custom Reverse Proxy:**
```env
S3_BASE_URL=http://localhost:4566/my-deployment-bucket/__outputs
```

---

## ⚡ Development

To run without Docker:

```bash
bun install
bun run index.ts
```
