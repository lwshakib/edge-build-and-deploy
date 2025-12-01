// API Server configuration
export const API_SERVER_URL =
  process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_SERVER_URL}/api/auth/google`,
    GITHUB: `${API_SERVER_URL}/api/auth/github`,
    VERIFY: `${API_SERVER_URL}/api/auth/verify`,
  },
  GITHUB: {
    REPOS: `${API_SERVER_URL}/api/github/repos`,
    // Frontend should use the Next.js routes `/api/github/...` instead of
    // calling the backend directly.
    FRAMEWORK_ROUTE: (owner: string, repo: string) =>
      `/api/github/framework?owner=${encodeURIComponent(
        owner
      )}&repo=${encodeURIComponent(repo)}`,
  },
};
