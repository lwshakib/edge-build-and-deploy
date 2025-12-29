# Custom Reverse Proxy 🛡️

This service acts as a reverse proxy that maps subdomains to specific project outputs stored in S3. It allows users to access their deployed sites via dynamic subdomains (e.g., `project-id.localhost`).

---

## 🚀 How it Works

1.  **Extract Subdomain**: The proxy captures the incoming request and extracts the subdomain (e.g., `my-app` from `my-app.localhost:8000`).
2.  **Map to S3**: It maps this subdomain to a path in your S3 bucket (e.g., `s3-base-url/__outputs/my-app/`).
3.  **Proxy Request**: It forwards the request to S3 and serves the content (HTML, JS, CSS) back to the user.
4.  **Automatic Index**: If the request path is `/`, it automatically appends `index.html`.

---

## 🛠️ Configuration

The service requires the following environment variables:

| Variable      | Required | Description                                                                                  |
| :------------ | :------: | :------------------------------------------------------------------------------------------- |
| `S3_BASE_URL` |   Yes    | The base URL to your S3 bucket outputs (e.g. `https://s3.amazonaws.com/my-bucket/__outputs`) |

---

## 🏠 Running Locally (with LocalStack)

To test the proxy locally without AWS:

1.  **Set Environment Variables**:
    Create a `.env` file or export them:

    ```env
    S3_BASE_URL=http://localhost:4566/my-deployment-bucket/__outputs
    ```

2.  **Install & Run**:

    ```bash
    bun install
    bun run index.ts
    ```

3.  **Test a Subdomain**:
    If you have a project named `test-app` in your local S3, you can try accessing it at:
    `http://test-app.localhost:8000`

---

## 🏗️ Docker Deployment

1.  **Build**:

    ```bash
    docker build -t custom-reverse-proxy .
    ```

2.  **Run**:
    ```bash
    docker run -p 8000:8000 -e S3_BASE_URL="http://host.docker.internal:4566/my-bucket/__outputs" custom-reverse-proxy
    ```
