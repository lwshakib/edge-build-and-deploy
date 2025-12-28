import express from "express";
import { prisma } from "../services/prisma.services";
import { requireAuth } from "../middlewares/auth.middlewares";
import crypto from "node:crypto";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  ECS_CLUSTER_ARN,
  ECS_TASK_DEFINITION_ARN,
  ECS_SUBNET_IDS,
  ECS_SECURITY_GROUP_IDS,
  KAFKA_BROKER,
  KAFKA_USERNAME,
  KAFKA_PASSWORD,
  KAFKA_CA_FILE,
} from "../env";

const router = express.Router();

const ecsClient = new ECSClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

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

    // Trigger ECS Task for deployment
    const command = new RunTaskCommand({
      cluster: ECS_CLUSTER_ARN,
      taskDefinition: ECS_TASK_DEFINITION_ARN,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: ECS_SUBNET_IDS,
          securityGroups: ECS_SECURITY_GROUP_IDS,
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image", // Ensure this matches your Task Definition container name
            environment: [
              {
                name: "GIT_REPOSITORY__URL",
                value: `https://github.com/${project.repoName}`,
              },
              { name: "PROJECT_ID", value: project.id },
              { name: "DEPLOYMENT_ID", value: deployment.id },
              { name: "FRAMEWORK", value: project.framework },
              { name: "BUILD_COMMAND", value: project.buildCommand || "" },
              {
                name: "OUTPUT_DIRECTORY",
                value: project.outputDirectory || "",
              },
              { name: "INSTALL_COMMAND", value: project.installCommand || "" },
              { name: "KAFKA_BROKER", value: KAFKA_BROKER },
              { name: "KAFKA_USERNAME", value: KAFKA_USERNAME || "" },
              { name: "KAFKA_PASSWORD", value: KAFKA_PASSWORD || "" },
              { name: "KAFKA_CA_FILE", value: KAFKA_CA_FILE || "" },
              { name: "AWS_ACCESS_KEY_ID", value: AWS_ACCESS_KEY_ID },
              { name: "AWS_SECRET_ACCESS_KEY", value: AWS_SECRET_ACCESS_KEY },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

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

    const command = new RunTaskCommand({
      cluster: ECS_CLUSTER_ARN,
      taskDefinition: ECS_TASK_DEFINITION_ARN,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: ECS_SUBNET_IDS,
          securityGroups: ECS_SECURITY_GROUP_IDS,
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              {
                name: "GIT_REPOSITORY__URL",
                value: `https://github.com/${project.repoName}`,
              },
              { name: "PROJECT_ID", value: project.id },
              { name: "DEPLOYMENT_ID", value: deployment.id },
              { name: "KAFKA_BROKER", value: KAFKA_BROKER },
              { name: "KAFKA_USERNAME", value: KAFKA_USERNAME || "" },
              { name: "KAFKA_PASSWORD", value: KAFKA_PASSWORD || "" },
              { name: "KAFKA_CA_FILE", value: KAFKA_CA_FILE || "" },
              { name: "AWS_ACCESS_KEY_ID", value: AWS_ACCESS_KEY_ID },
              { name: "AWS_SECRET_ACCESS_KEY", value: AWS_SECRET_ACCESS_KEY },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    res.json({ status: "queued", deploymentId: deployment.id });
  } catch (error) {
    console.error("Error triggering manual deployment:", error);
    res.status(500).json({ message: "Failed to trigger deployment" });
  }
});

export default router;
