"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AnimatedTabs } from "@/components/animated-tabs";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LogoIcon } from "./logo";
import { usePathname } from "next/navigation";

export default function AnimatedHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [scrollY, setScrollY] = React.useState(0);

  const isNewProjectPage = pathname.startsWith("/project/new");

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { label: "Overview", value: "overview", href: "/overview" },
    { label: "Integrations", value: "integrations", href: "/integrations" },
    { label: "Deployments", value: "deployments", href: "/deployments" },
    { label: "Activity", value: "activity", href: "/activity" },
    { label: "Domains", value: "domains", href: "/domains" },
    { label: "Usage", value: "usage", href: "/usage" },
    { label: "Observability", value: "observability", href: "/observability" },
    { label: "Storage", value: "storage", href: "/storage" },
    { label: "Flags", value: "flags", href: "/flags" },
    { label: "AI Gateway", value: "ai-gateway", href: "/ai-gateway" },
    { label: "Agent", value: "agent", href: "/agent" },
    { label: "Support", value: "support", href: "/support" },
    { label: "Settings", value: "settings", href: "/settings" },
  ];

  return (
    <>
      <header className="w-full bg-background relative border-b border-border/50">
        <motion.div
          className="fixed top-0 left-0 z-50 pt-5 pl-5"
          animate={{
            scale: Math.max(0.8, 1 - scrollY * 0.006),
          }}
          transition={{
            duration: 0.1,
            ease: "linear",
          }}
        >
          <LogoIcon />
        </motion.div>

        <div className="flex justify-between px-5 items-center pt-3 pb-3 pl-14">
          <div className="flex items-center gap-2"></div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Find..."
                className="h-8 w-64 pl-9 pr-8 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-0"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center h-5 px-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-[10px] text-zinc-500 font-medium">
                F
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 border-zinc-200 dark:border-zinc-800 font-medium text-sm hidden sm:flex"
            >
              Feedback
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full border-2 border-background" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <BookOpen className="h-4 w-4" />
              </Button>

              <Avatar className="h-8 w-8 border border-border cursor-pointer">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sticky Navigation with animated tabs */}
      {!isNewProjectPage && (
        <div className="sticky top-0 bg-background overflow-x-hidden border-b border-border">
          <div className="flex justify-center items-center">
            <motion.div
              className="flex justify-center flex-1"
              animate={{
                x: Math.min(scrollY * 0.5, 40), // Move 0.5px right per 1px scroll, max 40px
              }}
              transition={{
                duration: 0.05,
                ease: "linear",
              }}
            >
              <AnimatedTabs tabs={tabs} />
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
