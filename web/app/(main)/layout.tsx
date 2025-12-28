"use client";

import AnimatedHeader from "@/components/animated-header";
import { useEdgeStore } from "@/context";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
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
    } else if (!isPending && !session) {
      // Redirect only if not pending and no session
      router.push("/sign-in");
    }
  }, [session, setSession, isPending, router]);

  if (isPending) {
    return null;
  }

  return (
    <div className="w-full min-h-screen">
      <AnimatedHeader />
      {children}
    </div>
  );
}
