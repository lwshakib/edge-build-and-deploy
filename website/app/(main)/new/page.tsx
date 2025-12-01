"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

type GitHubRepo = {
  id: number | string;
  name: string;
  fullName?: string;
  owner?: string;
  description?: string | null;
  private?: boolean;
  updatedAt?: string;
};

export default function NewProjectPage() {
  const router = useRouter();
  const { isLoading, isSignedIn, user } = useAuth();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const isGithubConnected = !!user && user.provider === "GITHUB";

  useEffect(() => {
    if (isGithubConnected) {
      void loadRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGithubConnected]);

  const handleConnectGithub = () => {
    // Directly start the GitHub OAuth flow
    window.location.href = API_ENDPOINTS.AUTH.GITHUB;
  };

  const loadRepos = async () => {
    try {
      setIsFetchingRepos(true);
      setRepoError(null);

      // TODO: Wire this to a real API that returns the
      // authenticated user's GitHub repositories.
      // Example endpoint: /api/github/repos
      const res = await fetch("/api/github/repos");

      if (!res.ok) {
        throw new Error("Failed to load GitHub repositories.");
      }

      const data = await res.json();
      setRepos(data.repos ?? []);
    } catch (error) {
      console.error(error);
      setRepoError(
        "We couldn't load your GitHub repositories. Please try again."
      );
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleImport = (repo: GitHubRepo) => {
    // Navigate to a configuration page for the selected repository,
    // similar to Vercel's "New Project" screen.
    const slugSource = repo.fullName || repo.name;
    if (!slugSource) return;

    const encodedName = encodeURIComponent(String(slugSource));
    router.push(`/new/${encodedName}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">
          Checking your GitHub connection...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {!isSignedIn ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center max-w-md">
            <h3 className="text-2xl font-bold tracking-tight">
              Connect to your GitHub account
            </h3>
            <p className="text-sm text-muted-foreground">
              To create a project, first connect your GitHub account so we can
              list your repositories and let you import one.
            </p>
            <Button className="mt-2" onClick={handleConnectGithub}>
              <Plus className="mr-2 h-4 w-4" />
              Connect to GitHub Account
            </Button>
          </div>
        </div>
      ) : (
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Import a GitHub repository</CardTitle>
              <CardDescription>
                Choose one of your repositories below to create a new project.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRepos}
              disabled={isFetchingRepos}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {repoError && (
              <p className="mb-3 text-sm text-destructive">{repoError}</p>
            )}

            {isFetchingRepos && repos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Loading your GitHub repositories...
              </p>
            ) : repos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No repositories found yet. Make sure your GitHub account is
                connected and try refreshing.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Last updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repos.map((repo) => (
                    <TableRow key={repo.id}>
                      <TableCell className="font-medium">{repo.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {repo.description || "-"}
                      </TableCell>
                      <TableCell>
                        {repo.private ? "Private" : "Public"}
                      </TableCell>
                      <TableCell>{repo.updatedAt || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleImport(repo)}>
                          Import
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
