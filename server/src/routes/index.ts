import express from "express";
import githubRoutes from "./github.routes";
import projectRoutes from "./project.routes";

const router = express.Router();

router.use("/github", githubRoutes);
router.use("/project", projectRoutes);

export default router;
