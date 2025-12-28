import express from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import { getLogs } from "../services/clickhouse.services";

const router = express.Router();

router.use(requireAuth);

router.get("/logs/:id", async (req, res) => {
  const deploymentId = req.params.id;
  try {
    const logs = await getLogs(deploymentId);
    res.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

export default router;
