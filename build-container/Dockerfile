FROM oven/bun:1.1-slim

RUN apt-get update && apt-get install -y git

WORKDIR /home/app

# Copy package files first for better caching
COPY package.json bun.lock* ./
RUN bun install

# Copy source and other files
COPY index.ts index.ts
COPY main.sh main.sh
COPY kafka.pem kafka.pem
COPY tsconfig.json tsconfig.json

# Build TypeScript to JavaScript
RUN bun build ./index.ts --outfile ./index.js --target bun

RUN chmod +x main.sh

ENTRYPOINT [ "/home/app/main.sh" ]