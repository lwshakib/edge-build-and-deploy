import { exec, ExecException } from "child_process";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { Kafka, Producer } from "kafkajs";
import { ReadStream } from "fs";

/**
 * Environment variables
 */
const PROJECT_ID: string | undefined = process.env.PROJECT_ID;
const DEPLOYMENT_ID: string | undefined = process.env.DEPLOYMENT_ID;

if (!PROJECT_ID || !DEPLOYMENT_ID) {
  throw new Error("Missing required environment variables: PROJECT_ID or DEPLOYMENT_ID");
}

/**
 * AWS S3 Client
 */
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
  },
});

/**
 * Kafka setup
 */
const kafka = new Kafka({
  clientId: `docker-build-server-${DEPLOYMENT_ID}`,
  brokers: ["YOUR_KAFKA_BROKER_URL"],
  ssl: {
    ca: [
      fs.readFileSync(
        path.join(__dirname, process.env.KAFKA_CA_FILE ?? "kafka.pem"),
        "utf-8"
      ),
    ],
  },
  sasl: {
    username: "YOUR_KAFKA_USERNAME",
    password: "YOUR_KAFKA_PASSWORD",
    mechanism: "plain",
  },
});

const producer: Producer = kafka.producer();

/**
 * Publish logs to Kafka
 */
async function publishLog(log: string): Promise<void> {
  await producer.send({
    topic: "container-logs",
    messages: [
      {
        key: "log",
        value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log }),
      },
    ],
  });
}

/**
 * Recursively collect all files in a directory
 */
async function getAllFiles(dirPath: string): Promise<string[]> {
  let results: string[] = [];
  const list: string[] = fs.readdirSync(dirPath);

  for (const entry of list) {
    const filePath = path.join(dirPath, entry);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(await getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Main build + upload flow
 */
async function init(): Promise<void> {
  await producer.connect();

  console.log("Executing script.js");
  await publishLog("Build Started...");

  const outDirPath = path.join(__dirname, "output");
  const distFolderPath = path.join(outDirPath, "dist");

  const processHandle = exec(
    `cd ${outDirPath} && rm -rf node_modules package-lock.json && npm install && npm run build`
  );

  processHandle.stdout?.on("data", (data: Buffer | string) => {
    const output = data.toString();
    console.log(output);
    void publishLog(output);
  });

  processHandle.stderr?.on("data", (data: Buffer | string) => {
    const error = data.toString();
    console.error("stderr:", error);
    void publishLog(`stderr: ${error}`);
  });

  processHandle.on("exit", async (code: number | null) => {
    if (code !== 0) {
      await publishLog(`Build failed with exit code ${code}`);
      console.error(`Build failed with exit code ${code}`);
      return;
    }

    if (!fs.existsSync(distFolderPath)) {
      const message = `ERROR: Build output folder not found: ${distFolderPath}`;
      await publishLog(message);
      console.error(message);
      return;
    }

    console.log("Build Complete");
    await publishLog("Build Complete");

    try {
      const distFolderContents = await getAllFiles(distFolderPath);
      await publishLog("Starting to upload");

      for (const filePath of distFolderContents) {
        if (fs.lstatSync(filePath).isDirectory()) continue;

        const relativeFile = path.relative(distFolderPath, filePath);
        console.log("uploading", filePath);
        await publishLog(`uploading ${relativeFile}`);

        const body: ReadStream = fs.createReadStream(filePath);

        const command = new PutObjectCommand({
          Bucket: "vercel.vexx.fun",
          Key: `__outputs/${PROJECT_ID}/${relativeFile}`,
          Body: body,
          ContentType: mime.lookup(filePath) || "application/octet-stream",
        });

        try {
          await s3Client.send(command);
          await publishLog(`uploaded ${relativeFile}`);
          console.log("uploaded", filePath);
        } catch (uploadError) {
          const message =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);

          await publishLog(`ERROR uploading ${relativeFile}: ${message}`);
          console.error(`ERROR uploading ${relativeFile}:`, uploadError);
        }
      }

      await publishLog("Done");
      console.log("Done...");
      process.exit(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await publishLog(`ERROR reading files: ${message}`);
      console.error("ERROR reading files:", err);
    }
  });
}

void init();
