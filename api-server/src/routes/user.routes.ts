import express from "express";
import {
  verifyToken,
  verifyJWT,
  verifyOAuth,
} from "../middlewares/auth.middlewares";

const userRouter = express.Router();

// Example: Protected route using verifyToken (supports both JWT and OAuth)
userRouter.get("/me", verifyToken, (req, res) => {
  res.json({
    user: req.user,
    message: "Token verified successfully",
  });
});

// Example: Protected route using only JWT verification
userRouter.get("/profile", verifyJWT, (req, res) => {
  res.json({
    user: req.user,
    message: "JWT token verified",
  });
});

// Example: Protected route using only OAuth verification
userRouter.get("/oauth-profile", verifyOAuth, (req, res) => {
  res.json({
    user: req.user,
    message: "OAuth token verified",
  });
});

export default userRouter;
