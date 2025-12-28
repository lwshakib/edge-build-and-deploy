import express from "express";
import { auth } from "../services/auth.services";
import { prisma } from "../services/prisma.services";
import axios from "axios";
import { requireAuth } from "../middlewares/auth.middlewares";

const router = express.Router();

router.use(requireAuth);

router.get("/repos", async (req, res) => {
  // @ts-ignore
  const user = req.user;

  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "github",
    },
  });

  if (!account || !account.accessToken) {
    return res.status(404).json({ message: "GitHub account not found" });
  }

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
      params: {
        sort: "updated",
        per_page: 20,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
});

router.get("/accounts", async (req, res) => {
  // @ts-ignore
  const user = req.user;

  const accounts = await prisma.account.findMany({
    where: {
      userId: user.id,
    },
    select: {
      providerId: true,
    },
  });

  res.json(accounts);
});

export default router;
