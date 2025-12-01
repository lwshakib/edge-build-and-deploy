"use client";

import { useCallback, useEffect, useState } from "react";

const ACCESS_TOKEN_COOKIE = "accessToken";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
};

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const evaluateSession = useCallback(async () => {
    setIsLoading(true);
    const token = getCookieValue(ACCESS_TOKEN_COOKIE);

    if (!token) {
      setIsSignedIn(false);
      setUser(null);
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }

    // Verify token with backend - always fetch fresh (no cache)
    try {
      const response = await fetch("/api/auth/status", {
        method: "GET",
        // Don't cache the auth status check
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      if (!response.ok) {
        // API route returned an error
        console.error("Auth status check failed:", response.status);
        setIsSignedIn(false);
        setUser(null);
        // Remove invalid token cookie
        document.cookie = `${ACCESS_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        setIsLoading(false);
        setIsLoaded(true);
        return;
      }

      const data = await response.json();

      // Verify that token is valid and user exists
      if (data.isValid === true && data.user) {
        setIsSignedIn(true);
        setUser(data.user);
      } else {
        // Token is invalid or expired
        setIsSignedIn(false);
        setUser(null);
        // Remove invalid token cookie
        document.cookie = `${ACCESS_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsSignedIn(false);
      setUser(null);
      // Remove token on error as well
      document.cookie = `${ACCESS_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    evaluateSession();
  }, [evaluateSession]);

  return {
    isLoading,
    isLoaded,
    isSignedIn,
    user,
    refresh: evaluateSession,
  };
};
