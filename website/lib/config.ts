// API Server configuration
export const API_SERVER_URL =
  process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: `${API_SERVER_URL}/api/auth/google`,
    GITHUB: `${API_SERVER_URL}/api/auth/github`,
  },
};
