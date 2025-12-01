import { auth } from "@/lib/auth";

/**
 * Example protected server component page
 * 
 * This page demonstrates how to use the server-side auth() function.
 * If the user is not authenticated, they will be automatically redirected to /auth
 */
export default async function ProtectedPage() {
  // This will redirect to /auth if not authenticated
  const { user } = await auth();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Protected Page</h1>
      <div className="space-y-2">
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
        <p>Provider: {user.provider}</p>
        {user.image && (
          <img 
            src={user.image} 
            alt={user.name} 
            className="w-20 h-20 rounded-full"
          />
        )}
      </div>
    </div>
  );
}

