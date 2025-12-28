import express from "express";
import githubRoutes from "./github.routes";
import projectRoutes from "./project.routes";
import deploymentRoutes from "./deployment.routes";

const router = express.Router();

router.use("/github", githubRoutes);
router.use("/project", projectRoutes);
router.use("/deployment", deploymentRoutes);

export default router;
