import express from "express";
import { prisma } from "../services/prisma.services";
import { requireAuth } from "../middlewares/auth.middlewares";
import crypto from "node:crypto";
import { generateSlug } from "random-word-slugs";
import { KAFKA_BROKER } from "../env";
import { exec } from "node:child_process";

const router = express.Router();

// No ECS Client needed for local execution

router.use(requireAuth);

/**
 * Create a new project and trigger initial deployment.
 */
router.post("/new", async (req, res) => {
  // @ts-ignore
  const user = req.user;
  const {
    name,
    framework,
    rootDirectory,
    buildCommand,
    outputDirectory,
    installCommand,
    repoName,
    envVariables,
  } = req.body;

  if (!name || !repoName) {
    return res
      .status(400)
      .json({ message: "Project name and repo name are required" });
  }

  try {
    const project = await prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name,
        framework: framework || "other",
        rootDirectory: rootDirectory || "./",
        buildCommand,
        outputDirectory,
        installCommand,
        repoName,
        subDomain: generateSlug(),
        userId: user.id,
        envVariables: {
          create: (envVariables || []).map(
            (ev: { key: string; value: string }) => ({
              id: crypto.randomUUID(),
              key: ev.key,
              value: ev.value,
            })
          ),
        },
      },
    });

    // Create initial deployment record
    const deployment = await prisma.deployment.create({
      data: {
        id: crypto.randomUUID(),
        projectId: project.id,
        status: "QUEUED",
      },
    });

    // For Docker container to access host Kafka (Windows/Mac)
    let kafkaBroker = KAFKA_BROKER;
    if (kafkaBroker.includes("localhost")) {
      kafkaBroker = kafkaBroker.replace("localhost", "host.docker.internal");
    }

    // Trigger local Docker container for deployment
    const envVars = [
      `GIT_REPOSITORY__URL=https://github.com/${project.repoName}`,
      `PROJECT_ID=${project.id}`,
      `DEPLOYMENT_ID=${deployment.id}`,
      `FRAMEWORK=${project.framework}`,
      `BUILD_COMMAND=${project.buildCommand || ""}`,
      `OUTPUT_DIRECTORY=${project.outputDirectory || ""}`,
      `INSTALL_COMMAND=${project.installCommand || ""}`,
      `KAFKA_BROKER=${kafkaBroker}`,
    ];

    const envString = envVars.map((e) => `-e ${e}`).join(" ");

    const dockerCommand = `docker run --rm ${envString} -v d:\\edge-build-and-deploy\\bucket:/home/app/bucket build-container:latest`;

    exec(dockerCommand, (err, stdout, stderr) => {
      if (err) {
        console.error("Error running docker container:", err);
      }
      if (stdout) console.log("Docker stdout:", stdout);
      if (stderr) console.error("Docker stderr:", stderr);
    });

    res.json({ project, deployment });
  } catch (error) {
    console.error("Error creating project and triggering deployment:", error);
    res
      .status(500)
      .json({ message: "Failed to create project or trigger deployment" });
  }
});

/**
 * Trigger a new deployment for an existing project.
 */
router.post("/deploy", async (req, res) => {
  const { projectId } = req.body;
  // @ts-ignore
  const user = req.user;

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    const deployment = await prisma.deployment.create({
      data: {
        id: crypto.randomUUID(),
        projectId: project.id,
        status: "QUEUED",
      },
    });

    // For Docker container to access host Kafka (Windows/Mac)
    let kafkaBroker = KAFKA_BROKER;
    if (kafkaBroker.includes("localhost")) {
      kafkaBroker = kafkaBroker.replace("localhost", "host.docker.internal");
    }

    const envVars = [
      `GIT_REPOSITORY__URL=https://github.com/${project.repoName}`,
      `PROJECT_ID=${project.id}`,
      `DEPLOYMENT_ID=${deployment.id}`,
      `KAFKA_BROKER=${kafkaBroker}`,
    ];

    const envString = envVars.map((e) => `-e ${e}`).join(" ");

    const dockerCommand = `docker run --rm ${envString} -v d:\\edge-build-and-deploy\\bucket:/home/app/bucket build-container:latest`;

    exec(dockerCommand, (err, stdout, stderr) => {
      if (err) {
        console.error("Error running docker container manual deploy:", err);
      }
      if (stdout) console.log("Docker stdout:", stdout);
      if (stderr) console.error("Docker stderr:", stderr);
    });

    res.json({ status: "queued", deploymentId: deployment.id });
  } catch (error) {
    console.error("Error triggering manual deployment:", error);
    res.status(500).json({ message: "Failed to trigger deployment" });
  }
});

export default router;
