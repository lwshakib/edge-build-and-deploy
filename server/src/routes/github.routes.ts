import express from "express";
import { prisma } from "../services/prisma.services";
import { requireAuth } from "../middlewares/auth.middlewares";
import { App } from "octokit";
import { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, WEB_URL } from "../env";
import crypto from "node:crypto";
import axios from "axios";

const router = express.Router();

// Initialize GitHub App
const app = new App({
  appId: GITHUB_APP_ID,
  privateKey: GITHUB_APP_PRIVATE_KEY,
});

router.use(requireAuth);

/**
 * Sync installations using the user's OAuth token if available.
 */
async function syncInstallations(userId: string) {
  const githubAccount = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
  });

  if (!githubAccount || !githubAccount.accessToken) {
    return [];
  }

  try {
    const response = await axios.get(
      "https://api.github.com/user/installations",
      {
        headers: {
          Authorization: `Bearer ${githubAccount.accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const installations = response.data.installations || [];
    const linkedInstallations = [];

    for (const inst of installations) {
      // Check if we already have this installation linked
      let record = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github-app",
          accountId: String(inst.id),
        },
      });

      if (!record) {
        record = await prisma.account.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            providerId: "github-app",
            accountId: String(inst.id),
          },
        });
      }
      linkedInstallations.push(record);
    }
    return linkedInstallations;
  } catch (error) {
    console.error("Error syncing installations:", error);
    return [];
  }
}

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

  // 1. Try to find existing linked installations
  let installations = await prisma.account.findMany({
    where: {
      userId: user.id,
      providerId: "github-app",
    },
  });

  // 2. If none, try to sync from OAuth token
  if (installations.length === 0) {
    console.log("No installations found, attempting to sync via OAuth...");
    installations = await syncInstallations(user.id);
  }

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

export default router;
