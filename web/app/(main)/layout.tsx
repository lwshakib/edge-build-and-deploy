"use client";

import AnimatedHeader from "@/components/animated-header";
import { useEdgeStore } from "@/context";
import { authClient } from "@/lib/auth-client";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession(); // Destructure isPending
  const { setSession } = useEdgeStore();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  if (isPending) {
    return null;
  }

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full min-h-screen">
      <AnimatedHeader />
      {children}
    </div>
  );
}
