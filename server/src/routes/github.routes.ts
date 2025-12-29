import express from "express";
import { prisma } from "../services/prisma.services";
import { requireAuth } from "../middlewares/auth.middlewares";
import { App } from "octokit";
import {
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY,
  WEB_URL,
  GITHUB_AUTH_CLIENT_ID,
  GITHUB_AUTH_CLIENT_SECRET,
} from "../env";
import crypto from "node:crypto";
import axios from "axios";

const router = express.Router();

// Initialize GitHub App
const app = new App({
  appId: GITHUB_APP_ID,
  privateKey: GITHUB_APP_PRIVATE_KEY,
});

router.use(requireAuth);

// Installations are linked via the GitHub App's "Setup URL" callback
// which hits the /callback route below.

/**
 * Callback for GitHub App installation.
 */
router.get("/callback", async (req, res) => {
  const { installation_id } = req.query;
  // @ts-ignore
  const user = req.user;

  console.log("GitHub Callback hit. Query:", req.query);

  if (installation_id) {
    const existing = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "github-app",
        accountId: String(installation_id),
      },
    });

    if (!existing) {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          providerId: "github-app",
          accountId: String(installation_id),
        },
      });
    }
  }

  res.redirect(`${WEB_URL}/project/new`);
});

router.get("/repos", async (req, res) => {
  // @ts-ignore
  const user = req.user;

  // 1. Fetch linked installations for this user
  let installations = await prisma.account.findMany({
    where: {
      userId: user.id,
      providerId: "github-app",
    },
  });

  if (installations.length === 0) {
    return res.json([]);
  }

  try {
    const allRepos = [];
    for (const inst of installations) {
      try {
        const octokit = await app.getInstallationOctokit(
          Number(inst.accountId)
        );
        const response = await octokit.request(
          "GET /installation/repositories",
          {
            per_page: 100,
          }
        );
        if (response.data && response.data.repositories) {
          allRepos.push(...response.data.repositories);
        }
      } catch (e) {
        console.error(
          `Failed to fetch repos for installation ${inst.accountId}:`,
          e
        );
      }
    }

    allRepos.sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime()
    );
    res.json(allRepos);
  } catch (error) {
    console.error("Error in /repos:", error);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
});

router.get("/accounts", async (req, res) => {
  // @ts-ignore
  const user = req.user;
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { providerId: true, accountId: true },
  });
  res.json(accounts);
});

router.get("/framework", async (req, res) => {
  const { owner, repo } = req.query;
  // @ts-ignore
  const user = req.user;

  if (!owner || !repo) {
    return res.status(400).json({ message: "Owner and repo are required" });
  }

  try {
    // Find the installation that has access to this repo
    const installations = await prisma.account.findMany({
      where: { userId: user.id, providerId: "github-app" },
    });

    for (const inst of installations) {
      try {
        const octokit = await app.getInstallationOctokit(
          Number(inst.accountId)
        );

        // Try to get package.json
        const { data }: any = await octokit.request(
          "GET /repos/{owner}/{repo}/contents/{path}",
          {
            owner: String(owner),
            repo: String(repo),
            path: "package.json",
          }
        );

        if (data && data.content) {
          const content = Buffer.from(data.content, "base64").toString();
          const pkg = JSON.parse(content);
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };

          let framework = "other";
          if (deps.next) framework = "nextjs";
          else if (deps.vite) framework = "vite";
          else if (deps["@angular/core"]) framework = "angular";
          else if (deps.nuxt) framework = "nuxt";
          else if (deps.svelte) framework = "svelte";

          return res.json({ framework });
        }
      } catch (e) {
        // Continue to next installation if this one fails
        continue;
      }
    }

    res.json({ framework: "other" });
  } catch (error) {
    console.error("Error detecting framework:", error);
    res.status(500).json({ message: "Failed to detect framework" });
  }
});

export default router;
