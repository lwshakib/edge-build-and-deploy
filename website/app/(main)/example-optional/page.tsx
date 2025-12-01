import { getAuth } from "@/lib/auth";
import Link from "next/link";

/**
 * Example page with optional authentication
 * 
 * This page demonstrates how to use getAuth() for optional authentication.
 * Users can view the page even if not authenticated.
 */
export default async function OptionalAuthPage() {
  const { user } = await getAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Public Page</h1>
        <p className="mb-4">You are not signed in.</p>
        <Link 
          href="/auth" 
          className="text-blue-500 hover:underline"
        >
          Sign in to see personalized content
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome Page</h1>
      <div className="space-y-2">
        <p>Hello, {user.name}!</p>
        <p>You are signed in as {user.email}</p>
        <Link 
          href="/" 
          className="text-blue-500 hover:underline"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}

