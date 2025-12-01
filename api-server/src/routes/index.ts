import express from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import githubRouter from "./github.routes.js";
import healthRouter from "./health.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/github", githubRouter);
router.use("/health", healthRouter);

export default router;
