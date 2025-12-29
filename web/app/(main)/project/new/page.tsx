"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Search,
  Github,
  Link as LinkIcon,
  ChevronDown,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

const TEMPLATES = [
  {
    title: "Next.js Boilerplate",
    description: "Get started with Next.js and React in seconds.",
    image: "https://nextjs.org/static/blog/next-13/twitter-card.png",
  },
  {
    title: "AI Chatbot",
    description: "A full-featured, hackable Next.js AI chatbot built by Vercel",
    image: "https://vercel.com/api/www/template-image?id=nextjs-ai-chatbot",
  },
  {
    title: "Vite + React Starter",
    description: "Vite/React site that can be deployed to Vercel",
    image: "https://vitejs.dev/og-image.png",
  },
  {
    title: "Express.js on Vercel",
    description:
      "Simple Express.js + Vercel example that serves html conten...",
    image: "https://expressjs.com/images/express-facebook-share.png",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [accounts, setAccounts] = React.useState<any[]>([]);
  const [repos, setRepos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingRepos, setLoadingRepos] = React.useState(false);

  const isGitHubConnected = accounts.some((a) => a.providerId === "github-app");

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  React.useEffect(() => {
    console.log("Current accounts linked:", accounts);
    console.log(
      "GitHub App Connected:",
      accounts.some((a) => a.providerId === "github-app")
    );
  }, [accounts]);

  React.useEffect(() => {
    if (isGitHubConnected) {
      fetchRepos();
    }
  }, [isGitHubConnected]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/github/accounts`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        console.error("Error fetching accounts:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error fetching accounts (catch):", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/github/repos`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      } else {
        console.error("Error fetching repos:", res.status, res.statusText);
        toast.error("Failed to fetch GitHub repositories");
      }
    } catch (error) {
      console.error("Error fetching repos (catch):", error);
      toast.error("Failed to fetch GitHub repositories");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleLinkGitHub = async () => {
    // Correct GitHub App slug provided by the user
    const GITHUB_APP_SLUG = "edge-build-deploy";
    window.location.href = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20">
      <div className="max-w-300 mx-auto w-full px-6 pt-12">
        {/* Top Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Let&apos;s build something new
          </h1>
          <Button
            variant="outline"
            className="h-10 border-zinc-200 dark:border-zinc-800 bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900 group relative overflow-hidden px-4 gap-2 rounded-lg"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg opacity-30 group-hover:opacity-100 transition-opacity blur-[2px]" />
            <div className="relative flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm font-medium">
                Collaborate on a Pro Trial
              </span>
            </div>
          </Button>
        </div>

        {/* URL Input Bar */}
        <div className="flex gap-2 mb-16">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Enter a Git repository URL to deploy..."
              className="h-12 pl-11 bg-zinc-100/5 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </div>
          <Button className="h-12 px-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-white dark:hover:bg-zinc-200 font-medium transition-colors">
            Continue
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Import Git Repositories */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">
              Import Git Repository
            </h2>

            {!isGitHubConnected ? (
              <Card className="border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <Github className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      Install GitHub App
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-75">
                      Install our GitHub App to allow access to your
                      repositories for deployment.
                    </p>
                  </div>
                  <Button
                    onClick={handleLinkGitHub}
                    className="mt-2 bg-foreground text-background hover:bg-foreground/90 font-medium px-8"
                  >
                    Install GitHub App
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-background border-zinc-200 dark:border-zinc-800 h-10 gap-2 shrink-0"
                  >
                    <Github className="h-4 w-4" />
                    <span>
                      {session?.user?.name?.toLowerCase().replace(/\s+/g, "") ||
                        "account"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </Button>
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                    <Input
                      placeholder="Search..."
                      className="h-10 pl-9 bg-background border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {loadingRepos ? (
                    <div className="flex flex-col gap-4 p-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 w-full animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                        />
                      ))}
                    </div>
                  ) : repos.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                      No repositories found.
                    </div>
                  ) : (
                    repos.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors rounded-lg group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                            <Github className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate max-w-50 md:max-w-xs">
                              {repo.name}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              {new Date(repo.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          className="h-8 px-4 text-xs font-semibold bg-zinc-100 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shrink-0"
                          onClick={() =>
                            router.push(
                              `/project/new/import?repo=${
                                repo.full_name || repo.name
                              }`
                            )
                          }
                        >
                          Import
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column: Clone Template */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                Clone Template
              </h2>
              <div className="flex items-center gap-4">
                <button className="text-sm text-zinc-500 hover:text-foreground flex items-center gap-1 transition-colors">
                  Filter <ChevronDown className="h-3 w-3" />
                </button>
                <button className="text-sm text-zinc-500 hover:text-foreground flex items-center gap-1 transition-colors">
                  Browse All <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((template) => (
                <Card
                  key={template.title}
                  className="bg-background border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group flex flex-col h-full"
                >
                  <div className="p-5 flex-1">
                    <h3 className="text-sm font-semibold mb-1 group-hover:text-blue-500 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                  <div className="h-32 bg-zinc-100 dark:bg-zinc-900/50 mt-auto border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                    <img
                      src={template.image}
                      alt=""
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity-transform duration-500 scale-105 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-40" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
