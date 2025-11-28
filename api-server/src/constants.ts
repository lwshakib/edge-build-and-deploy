import dotenv from "dotenv";

dotenv.config();

type RequiredEnvKey =
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GOOGLE_CALLBACK_URL"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
  | "GITHUB_CALLBACK_URL"
  | "JWT_SECRET"
  | "SESSION_SECRET";

const getRequiredEnv = (key: RequiredEnvKey): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const GOOGLE_CLIENT_ID = getRequiredEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = getRequiredEnv("GOOGLE_CLIENT_SECRET");
export const GOOGLE_CALLBACK_URL = getRequiredEnv("GOOGLE_CALLBACK_URL");

export const GITHUB_CLIENT_ID = getRequiredEnv("GITHUB_CLIENT_ID");
export const GITHUB_CLIENT_SECRET = getRequiredEnv("GITHUB_CLIENT_SECRET");
export const GITHUB_CALLBACK_URL = getRequiredEnv("GITHUB_CALLBACK_URL");

export const SESSION_SECRET = getRequiredEnv("SESSION_SECRET");
export const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const AUTH_SUCCESS_REDIRECT =
  process.env.AUTH_SUCCESS_REDIRECT ?? "http://localhost:3000/auth/success";
export const AUTH_FAILURE_REDIRECT =
  process.env.AUTH_FAILURE_REDIRECT ?? "http://localhost:3000/auth/error";

