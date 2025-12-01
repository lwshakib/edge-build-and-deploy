import express from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import githubRouter from "./github.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/github", githubRouter);

export default router;
