const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const { Kafka } = require("kafkajs");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
  },
});

const PROJECT_ID = process.env.PROJECT_ID;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;

const kafka = new Kafka({
  clientId: `docker-build-server-${DEPLOYMENT_ID}`,
  brokers: ["YOUR_KAFKA_BROKER_URL"],
  ssl: {
    ca: [
      fs.readFileSync(
        path.join(__dirname, process.env.KAFKA_CA_FILE || "kafka.pem"),
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

const producer = kafka.producer();

async function publishLog(log) {
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

async function getAllFiles(dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);
  for (let i = 0; i < list.length; i++) {
    const file = path.join(dirPath, list[i]);
    const stat = fs.lstatSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(await getAllFiles(file)); // Recurse into subdirectory
    } else {
      results.push(file);
    }
  }
  return results;
}

async function init() {
  await producer.connect();

  console.log("Executing script.js");
  await publishLog("Build Started...");
  const outDirPath = path.join(__dirname, "output");
  const distFolderPath = path.join(outDirPath, "dist");

  const p = exec(
    `cd ${outDirPath} && rm -rf node_modules package-lock.json && npm install && npm run build`
  );

  p.stdout.on("data", function (data) {
    const output = data.toString();
    console.log(output);
    publishLog(output);
  });

  p.stderr?.on("data", function (data) {
    const error = data.toString();
    console.error("stderr:", error);
    publishLog(`stderr: ${error}`);
  });

  p.on("exit", async function (code) {
    if (code !== 0) {
      await publishLog(`Build failed with exit code ${code}`);
      console.error(`Build failed with exit code ${code}`);
      return;
    }

    if (!fs.existsSync(distFolderPath)) {
      await publishLog(
        `ERROR: Build output folder not found: ${distFolderPath}`
      );
      console.error(`Build output folder not found: ${distFolderPath}`);
      return;
    }

    console.log("Build Complete");
    await publishLog("Build Complete");

    try {
      const distFolderContents = await getAllFiles(distFolderPath);

      await publishLog(`Starting to upload`);
      for (const filePath of distFolderContents) {
        const file = path.relative(distFolderPath, filePath);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        console.log("uploading", filePath);
        await publishLog(`uploading ${file}`);

        const command = new PutObjectCommand({
          Bucket: "vercel.vexx.fun",
          Key: `__outputs/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mime.lookup(filePath) || "application/octet-stream",
        });

        try {
          await s3Client.send(command);
          await publishLog(`uploaded ${file}`);
          console.log("uploaded", filePath);
        } catch (uploadError) {
          await publishLog(`ERROR uploading ${file}: ${uploadError.message}`);
          console.error(`ERROR uploading ${file}:`, uploadError);
        }
      }

      await publishLog("Done");
      console.log("Done...");
      process.exit(0);
    } catch (err) {
      await publishLog(`ERROR reading files: ${err.message}`);
      console.error("ERROR reading files:", err);
    }
  });
}

init();