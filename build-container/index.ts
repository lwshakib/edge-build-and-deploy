import { exec, type ExecException } from "child_process";
import path from "path";
import fs from "fs-extra";
import { Kafka, type Producer } from "kafkajs";
import { ReadStream } from "fs";

/**
 * Environment variables
 */
const PROJECT_ID: string | undefined = process.env.PROJECT_ID;
const PROJECT_SLUG: string | undefined = process.env.PROJECT_SLUG;
const DEPLOYMENT_ID: string | undefined = process.env.DEPLOYMENT_ID;

if (!PROJECT_ID || !DEPLOYMENT_ID || !PROJECT_SLUG) {
  throw new Error(
    "Missing required environment variables: PROJECT_ID, PROJECT_SLUG or DEPLOYMENT_ID"
  );
}

const VALID_PROJECT_ID: string = PROJECT_ID!;
const VALID_PROJECT_SLUG: string = PROJECT_SLUG!;
const VALID_DEPLOYMENT_ID: string = DEPLOYMENT_ID!;

const BUILD_COMMAND = process.env.BUILD_COMMAND || "bun run build";
const INSTALL_COMMAND = process.env.INSTALL_COMMAND || "bun install";
const OUTPUT_DIRECTORY = process.env.OUTPUT_DIRECTORY || "dist";

// No S3 Client needed for local storage
const BUCKET_PATH = path.join(__dirname, "bucket");
if (!fs.existsSync(BUCKET_PATH)) {
  fs.mkdirSync(BUCKET_PATH);
}

/**
 * Kafka setup
 */
console.log("Initializing Kafka with broker:", process.env.KAFKA_BROKER);
console.log("Deployment ID:", DEPLOYMENT_ID);

const kafka = new Kafka({
  clientId: `docker-build-server-${DEPLOYMENT_ID}`,
  brokers: [process.env.KAFKA_BROKER!],
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

  console.log("Executing main script");
  await publishLog("Build Started...");

  const outDirPath = path.join(__dirname, "output");
  const distFolderPath = path.join(outDirPath, OUTPUT_DIRECTORY);

  const processHandle = exec(
    `cd ${outDirPath} && rm -rf node_modules bun.lockb && ${INSTALL_COMMAND} && ${BUILD_COMMAND}`
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

        const destinationPath = path.join(
          BUCKET_PATH,
          "__outputs",
          VALID_PROJECT_SLUG,
          VALID_DEPLOYMENT_ID,
          relativeFile
        );

        try {
          await fs.ensureDir(path.dirname(destinationPath));
          await fs.copy(filePath, destinationPath);
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
