import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/envs";
import { verifyOAuthToken } from "../utils/tokenVerifier";
import { verifyJWT as verifyJWTHelper } from "../utils/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Verify JWT token middleware
 * Expects: Authorization: Bearer <token>
 */
export const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

/**
 * Verify OAuth access token middleware
 * Expects: Authorization: Bearer <oauth-token>
 * Optionally: X-Auth-Provider: GOOGLE | GITHUB
 */
export const verifyOAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if provider is specified in header
  const provider = req.headers["x-auth-provider"] as
    | "GOOGLE"
    | "GITHUB"
    | undefined;

  try {
    const result = await verifyOAuthToken(token, provider);

    if (!result) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user in database by email
    const email = result.userInfo.email;
    if (!email) {
      return res.status(401).json({ message: "Email not found in token" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying OAuth token:", error);
    return res.status(401).json({ message: "Token verification failed" });
  }
};

/**
 * Verify either JWT or OAuth token
 * Tries JWT first, then OAuth if JWT fails
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Try JWT first
  try {
    const jwtPayload = verifyJWTHelper(token);
    if (jwtPayload) {
      // Find user in database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, jwtPayload.userId))
        .limit(1);

      if (user) {
        req.user = user;
        return next();
      }
    }
  } catch (error) {
    // Not a JWT token, try OAuth
  }

  // Try OAuth token
  const provider = req.headers["x-auth-provider"] as
    | "GOOGLE"
    | "GITHUB"
    | undefined;

  try {
    const result = await verifyOAuthToken(token, provider);

    if (!result) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const email = result.userInfo.email;
    if (!email) {
      return res.status(401).json({ message: "Email not found in token" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Token verification failed" });
  }
};
