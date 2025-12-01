"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      // Set the accessToken as a cookie
      // Set cookie with 7 days expiration
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      const expires = expirationDate.toUTCString();

      document.cookie = `accessToken=${accessToken}; expires=${expires}; path=/; SameSite=Lax; Secure=${
        window.location.protocol === "https:"
      }`;

      // Redirect to home page or a redirect URL if provided
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    } else {
      // No accessToken provided, redirect to auth page
      router.push("/auth");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Completing authentication...
        </h1>
        <p className="text-muted-foreground">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
}
