"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  File,
  ExternalLink,
  Loader2,
  Clock,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

export default function NewProjectConfigurePage() {
  const router = useRouter();
  const params = useParams<{ repo?: string }>();
  const rawParam = params?.repo ?? "";
  const decodedRepo = rawParam ? decodeURIComponent(rawParam) : "";

  const [framework, setFramework] = useState<
    "nextjs" | "react" | "vite" | "static" | "unknown"
  >("unknown");
  const [rootDirectory, setRootDirectory] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isLoadingPreset, setIsLoadingPreset] = useState(true);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [isDirDialogOpen, setIsDirDialogOpen] = useState(false);
  const [dirPath, setDirPath] = useState("");
  const [directories, setDirectories] = useState<
    { name: string; path: string }[]
  >([]);

  // Build settings state
  const [isBuildSettingsOpen, setIsBuildSettingsOpen] = useState(true);
  const [isEnvVarsOpen, setIsEnvVarsOpen] = useState(false);
  const [buildCommand, setBuildCommand] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");
  const [installCommand, setInstallCommand] = useState("");
  const [overrideBuildCommand, setOverrideBuildCommand] = useState(false);
  const [overrideOutputDirectory, setOverrideOutputDirectory] = useState(false);
  const [overrideInstallCommand, setOverrideInstallCommand] = useState(false);

  // Environment variables state
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);

  const [isLoadingDirs, setIsLoadingDirs] = useState(false);
  const [dirError, setDirError] = useState<string | null>(null);

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [isBuildLogsOpen, setIsBuildLogsOpen] = useState(true);
  const [isDeploymentSummaryOpen, setIsDeploymentSummaryOpen] = useState(false);
  const [isAssigningDomainsOpen, setIsAssigningDomainsOpen] = useState(false);

  // Default project name from repo
  const defaultProjectName =
    decodedRepo && decodedRepo.includes("/")
      ? decodedRepo.split("/").pop() ?? ""
      : decodedRepo || "";

  // Set initial project name from repo
  useEffect(() => {
    if (defaultProjectName && !projectName) {
      setProjectName(defaultProjectName);
    }
  }, [defaultProjectName]);

  // Owner/repo parsed once for reuse
  const [owner, repo] = decodedRepo.split("/");

  const detectPreset = async (path?: string) => {
    try {
      if (!owner || !repo) {
        setPresetError(
          "Could not determine repository owner and name from URL."
        );
        return;
      }

      setIsLoadingPreset(true);
      setPresetError(null);

      const url = new URL(
        API_ENDPOINTS.GITHUB.FRAMEWORK_ROUTE(owner, repo),
        window.location.origin
      );
      if (path) {
        url.searchParams.set("path", path);
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          "Failed to detect framework preset for this repository."
        );
      }

      const data = await response.json();

      if (data.frameworkPreset) {
        setFramework(data.frameworkPreset);
      }

      if (typeof data.rootDirectory === "string" && !path) {
        // Only override rootDirectory on initial auto-detection
        setRootDirectory(data.rootDirectory || "./");
      }
    } catch (error) {
      console.error(error);
      setPresetError(
        "We couldn't automatically detect the framework preset. You can select it manually."
      );
    } finally {
      setIsLoadingPreset(false);
    }
  };

  useEffect(() => {
    if (decodedRepo) {
      void detectPreset();
    }
  }, [decodedRepo]);

  const loadDirectories = async (path: string) => {
    try {
      if (!owner || !repo) return;
      setIsLoadingDirs(true);
      setDirError(null);

      const url = new URL("/api/github/dirs", window.location.origin);
      url.searchParams.set("owner", owner);
      url.searchParams.set("repo", repo);
      if (path) {
        url.searchParams.set("path", path);
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load directories from GitHub.");
      }

      const data = await response.json();
      setDirPath(data.path ?? path);
      setDirectories(data.directories ?? []);
    } catch (error) {
      console.error(error);
      setDirError("Could not load directories for this repository.");
    } finally {
      setIsLoadingDirs(false);
    }
  };

  const handleDeploy = () => {
    // For now this is a client-side placeholder.
    // Later this can call an API to create the project + trigger a deployment.
    // Show a deployment status card with collapsible sections.
    setIsDeploying(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
          <p className="text-sm text-muted-foreground">
            Configure how Edge should build and deploy{" "}
            <span className="font-mono text-foreground">{decodedRepo}</span>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Choose a name, framework preset, and root directory for this
                project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-next-app"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Framework Preset</Label>
                  <Select
                    value={framework}
                    onValueChange={(value) =>
                      setFramework(
                        value as
                          | "nextjs"
                          | "react"
                          | "vite"
                          | "static"
                          | "unknown"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nextjs">Next.js</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vite">Vite</SelectItem>
                      <SelectItem value="static">Static HTML</SelectItem>
                    </SelectContent>
                  </Select>
                  {isLoadingPreset && (
                    <p className="text-xs text-muted-foreground">
                      Detecting framework preset from your repository...
                    </p>
                  )}
                  {presetError && (
                    <p className="text-xs text-destructive">{presetError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="root-directory">Root Directory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="root-directory"
                      value={rootDirectory}
                      readOnly
                      placeholder="./"
                      className="cursor-pointer"
                      onClick={() => setIsDirDialogOpen(true)}
                    />
                    <Dialog
                      open={isDirDialogOpen}
                      onOpenChange={(open) => {
                        setIsDirDialogOpen(open);
                        if (open) {
                          void loadDirectories("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button">
                          Browse
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select project root</DialogTitle>
                          <DialogDescription>
                            Choose the folder that contains your application.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono break-all">
                              {dirPath || "./"}
                            </span>
                            {dirPath && (
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() => {
                                  const segments = dirPath.split("/");
                                  segments.pop();
                                  const parent = segments.join("/");
                                  void loadDirectories(parent);
                                }}
                              >
                                Up
                              </Button>
                            )}
                          </div>
                          {dirError && (
                            <p className="text-xs text-destructive">
                              {dirError}
                            </p>
                          )}
                          {isLoadingDirs ? (
                            <p className="text-xs text-muted-foreground">
                              Loading folders...
                            </p>
                          ) : directories.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No subfolders found here.
                            </p>
                          ) : (
                            <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
                              {directories.map((dir) => (
                                <li key={dir.path}>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start font-mono"
                                    type="button"
                                    onClick={() =>
                                      void loadDirectories(dir.path)
                                    }
                                  >
                                    {dir.name}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={async () => {
                              setRootDirectory(dirPath || "./");
                              await detectPreset(dirPath || undefined);
                              setIsDirDialogOpen(false);
                            }}
                          >
                            Use this folder
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional. Set if your app lives in a subfolder like{" "}
                    <code className="rounded bg-muted px-1 py-0.5">
                      apps/web
                    </code>
                    .
                  </p>
                </div>
              </div>

              <Separator />

              {/* Build and Output Settings */}
              <Collapsible
                open={isBuildSettingsOpen}
                onOpenChange={setIsBuildSettingsOpen}
                className="space-y-4"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:opacity-70 transition-opacity">
                  <div className="flex items-center gap-2">
                    {isBuildSettingsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Build and Output Settings
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  {/* Build Command */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="build-command"
                        className="text-sm text-muted-foreground"
                      >
                        Build Command
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="override-build"
                          checked={overrideBuildCommand}
                          onCheckedChange={setOverrideBuildCommand}
                        />
                      </div>
                    </div>
                    <Input
                      id="build-command"
                      value={buildCommand}
                      onChange={(e) => setBuildCommand(e.target.value)}
                      disabled={!overrideBuildCommand}
                      placeholder="`npm run vercel-build` or `npm run build`"
                      className="font-mono text-sm placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Output Directory */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="output-directory"
                        className="text-sm text-muted-foreground"
                      >
                        Output Directory
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="override-output"
                          checked={overrideOutputDirectory}
                          onCheckedChange={setOverrideOutputDirectory}
                        />
                      </div>
                    </div>
                    <Input
                      id="output-directory"
                      value={outputDirectory}
                      onChange={(e) => setOutputDirectory(e.target.value)}
                      disabled={!overrideOutputDirectory}
                      placeholder="`public` if it exists, or `.`"
                      className="font-mono text-sm placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Install Command */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="install-command"
                        className="text-sm text-muted-foreground"
                      >
                        Install Command
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="override-install"
                          checked={overrideInstallCommand}
                          onCheckedChange={setOverrideInstallCommand}
                        />
                      </div>
                    </div>
                    <Input
                      id="install-command"
                      value={installCommand}
                      onChange={(e) => setInstallCommand(e.target.value)}
                      disabled={!overrideInstallCommand}
                      placeholder="`yarn install`, `pnpm install`, `npm install`, or `bun install`"
                      className="font-mono text-sm placeholder:text-muted-foreground/50"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Environment Variables */}
              <Collapsible
                open={isEnvVarsOpen}
                onOpenChange={setIsEnvVarsOpen}
                className="space-y-4"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:opacity-70 transition-opacity">
                  <div className="flex items-center gap-2">
                    {isEnvVarsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Environment Variables
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  <div className="space-y-3">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr,1fr,auto] gap-3 text-sm text-muted-foreground">
                      <div>Key</div>
                      <div>Value</div>
                      <div className="w-10"></div>
                    </div>

                    {/* Environment variable rows */}
                    {envVars.map((envVar, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr,1fr,auto] gap-3 items-center"
                      >
                        <Input
                          value={envVar.key}
                          onChange={(e) => {
                            const newEnvVars = [...envVars];
                            newEnvVars[index].key = e.target.value;
                            setEnvVars(newEnvVars);
                          }}
                          placeholder="EXAMPLE_NAME"
                          className="font-mono text-sm h-10"
                        />
                        <Input
                          value={envVar.value}
                          onChange={(e) => {
                            const newEnvVars = [...envVars];
                            newEnvVars[index].value = e.target.value;
                            setEnvVars(newEnvVars);
                          }}
                          placeholder="I9JU23NF394R6HH"
                          className="font-mono text-sm h-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newEnvVars = envVars.filter(
                              (_, i) => i !== index
                            );
                            setEnvVars(newEnvVars);
                          }}
                          className="h-10 w-10 shrink-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add More button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEnvVars([...envVars, { key: "", value: "" }])
                      }
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add More
                    </Button>

                    {/* Import .env */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <File className="h-4 w-4" />
                      <span className="font-medium">Import .env</span>
                      <span>or paste the .env contents above.</span>
                      <a
                        href="https://vercel.com/docs/projects/environment-variables"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Learn more
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Repository</span>
                  <Badge variant="outline" className="font-normal">
                    GitHub
                  </Badge>
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  {decodedRepo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  We&apos;ll automatically deploy every push to this repository.
                  You can configure production and preview branches later.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 pt-4">
                <Button
                  className="w-full bg-linear-to-r from-cyan-500 to-blue-500 text-white"
                  onClick={handleDeploy}
                >
                  Deploy
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  By deploying you agree to the Terms of Service and understand
                  that usage is subject to fair-use limits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Deployment status card */}
      {isDeploying && (
        <div className="mx-auto mt-2 w-full max-w-4xl">
          <Card className="border-muted/60 bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">Deployment</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deployment queued...</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Build Logs */}
              <Collapsible
                open={isBuildLogsOpen}
                onOpenChange={setIsBuildLogsOpen}
                className="border border-border/60 rounded-md bg-background/60"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/70 rounded-md">
                  <div className="flex items-center gap-2">
                    {isBuildLogsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>Build Logs</span>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  Build logs will appear here as your deployment progresses.
                </CollapsibleContent>
              </Collapsible>

              {/* Deployment Summary */}
              <Collapsible
                open={isDeploymentSummaryOpen}
                onOpenChange={setIsDeploymentSummaryOpen}
                className="border border-border/60 rounded-md bg-background/60"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/70 rounded-md">
                  <div className="flex items-center gap-2">
                    {isDeploymentSummaryOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>Deployment Summary</span>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  Once the deployment finishes, you&apos;ll see an overview of
                  the build, preview URL, and any relevant metadata here.
                </CollapsibleContent>
              </Collapsible>

              {/* Assigning Custom Domains */}
              <Collapsible
                open={isAssigningDomainsOpen}
                onOpenChange={setIsAssigningDomainsOpen}
                className="border border-border/60 rounded-md bg-background/60"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/70 rounded-md">
                  <div className="flex items-center gap-2">
                    {isAssigningDomainsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>Assigning Custom Domains</span>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-border/60 px-3 py-3 text-xs text-muted-foreground">
                  Connect your custom domains and configure DNS after your first
                  successful deployment.
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsDeploying(false)}
              >
                Cancel Deployment
              </Button>
              <Button variant="link" className="px-0 text-xs" type="button">
                Update package.json - 728208
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
