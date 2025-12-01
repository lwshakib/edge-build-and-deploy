"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to home if user is already signed in
    if (!isLoading && isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, isLoading, router]);

  // Show loading state or nothing while checking/auth
  if (isLoading || isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthForm defaultMode="signin" />;
}