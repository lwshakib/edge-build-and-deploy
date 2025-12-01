import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/envs";

export interface JWTPayload {
  userId: string;
  email: string;
  provider: "EMAIL" | "GOOGLE" | "GITHUB";
}

/**
 * Generate a JWT token for a user
 */
export function generateJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
