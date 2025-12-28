import express from "express";
import githubRoutes from "./github.routes";

const router = express.Router();

router.use("/github", githubRoutes);

export default router;
