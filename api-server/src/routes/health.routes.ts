import express from "express";

const healthRouter = express.Router();

// Simple health check endpoint
healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;


