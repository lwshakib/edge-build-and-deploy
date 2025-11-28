"use client";

import { useCallback, useState } from "react";

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

  const evaluateSession = useCallback(() => {
    const token = getCookieValue(ACCESS_TOKEN_COOKIE);
    setIsSignedIn(Boolean(token));
    setIsLoading(false);
    setIsLoaded(true);
  }, []);


 
  return {
    isLoading,
    isLoaded,
    isSignedIn,
    refresh: evaluateSession,
  };
};
