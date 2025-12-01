import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_SERVER_URL } from "./config";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  slug: string;
  provider: "EMAIL" | "GOOGLE" | "GITHUB";
  image?: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Server-side authentication utility
 *
 * Usage in server components:
 * ```ts
 * import { auth } from "@/lib/auth";
 *
 * export default async function Page() {
 *   const { user } = await auth();
 *   // user is guaranteed to be authenticated
 *   return <div>Hello {user.name}</div>;
 * }
 * ```
 *
 * If user is not authenticated, this will automatically redirect to /auth
 *
 * @returns Promise with authenticated user
 * @throws Redirects to /auth if not authenticated
 */
export async function auth(): Promise<{ user: AuthUser }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/auth");
  }

  try {
    const verifyResponse = await fetch(`${API_SERVER_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      // Important: Don't cache this request
      cache: "no-store",
    });

    if (!verifyResponse.ok) {
      redirect("/auth");
    }

    const data = await verifyResponse.json();

    if (!data.valid || !data.user) {
      redirect("/auth");
    }

    return {
      user: data.user as AuthUser,
    };
  } catch (error) {
    console.error("Error verifying token in auth():", error);
    redirect("/auth");
  }
}

/**
 * Optional server-side authentication utility
 *
 * Usage in server components when authentication is optional:
 * ```ts
 * import { getAuth } from "@/lib/auth";
 *
 * export default async function Page() {
 *   const { user } = await getAuth();
 *   // user might be null
 *   return <div>{user ? `Hello ${user.name}` : "Please sign in"}</div>;
 * }
 * ```
 *
 * @returns Promise with user if authenticated, null otherwise (no redirect)
 */
export async function getAuth(): Promise<{ user: AuthUser | null }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { user: null };
  }

  try {
    const verifyResponse = await fetch(`${API_SERVER_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!verifyResponse.ok) {
      return { user: null };
    }

    const data = await verifyResponse.json();

    if (!data.valid || !data.user) {
      return { user: null };
    }

    return {
      user: data.user as AuthUser,
    };
  } catch (error) {
    console.error("Error verifying token in getAuth():", error);
    return { user: null };
  }
}
