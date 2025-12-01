import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_SERVER_URL } from "@/lib/config";

export async function GET() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Verify token with backend if accessToken exists
  let isValid = false;
  let user = null;

  if (accessToken) {
    try {
      const verifyResponse = await fetch(`${API_SERVER_URL}/api/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // Don't cache token verification - always check fresh
        cache: "no-store",
      });

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        isValid = data.valid === true;
        user = data.user || null;
      } else {
        // Token verification failed (401, 403, etc.)
        console.warn("Token verification failed:", verifyResponse.status);
        isValid = false;
        user = null;
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      isValid = false;
      user = null;
    }
  }

  return NextResponse.json({
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    isValid,
    user,
  });
}
