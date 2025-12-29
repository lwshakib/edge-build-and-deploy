"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Github,
  GitBranch,
  ChevronDown,
  Info,
  Plus,
  Minus,
  Settings,
  Edit2,
  Lock,
  Globe,
  Terminal,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

function ImportProjectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const repo = searchParams.get("repo") || "owner/repo";
  const [owner, repoName] = repo.split("/");

  const [projectName, setProjectName] = React.useState(repoName || "");
  const [framework, setFramework] = React.useState("other");
  const [rootDirectory, setRootDirectory] = React.useState("./");
  const [buildCommand, setBuildCommand] = React.useState("");
  const [outputDirectory, setOutputDirectory] = React.useState("");
  const [installCommand, setInstallCommand] = React.useState("");
  const [envVariables, setEnvVariables] = React.useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  /* Override States */
  const [overrideBuild, setOverrideBuild] = React.useState(false);
  const [overrideOutput, setOverrideOutput] = React.useState(false);
  const [overrideInstall, setOverrideInstall] = React.useState(false);

  const [isDeploying, setIsDeploying] = React.useState(false);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [deploymentId, setDeploymentId] = React.useState<string | null>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle Socket Connection
  React.useEffect(() => {
    if (isDeploying && deploymentId) {
      const socket = io(SERVER_URL, {
        withCredentials: true,
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Connected to logs server");
        socket.emit("subscribe:logs", deploymentId);
      });

      socket.on("log", (log: string) => {
        setLogs((prev) => [...prev, log]);
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
      };
    }
  }, [isDeploying, deploymentId]);

  const handleDeploy = async () => {
    if (!projectName) {
      toast.error("Project name is required");
      return;
    }

    setIsDeploying(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/project/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: projectName,
          framework,
          rootDirectory,
          buildCommand: buildCommand || null,
          outputDirectory: outputDirectory || null,
          installCommand: installCommand || null,
          repoName: repo,
          envVariables: envVariables.filter((ev) => ev.key && ev.value),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Project created successfully!");
        // Redirect to success page to watch logs
        router.push(
          `/project/new/success?deploymentId=${data.deployment.id}&projectId=${data.project.id}`
        );
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create project");
        setIsDeploying(false);
      }
    } catch (error) {
      console.error("Error deploying project:", error);
      toast.error("An error occurred during deployment");
      setIsDeploying(false);
    }
  };

  const addEnvVar = () => {
    setEnvVariables([...envVariables, { key: "", value: "" }]);
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newVars = [...envVariables];
    newVars[index][field] = value;
    setEnvVariables(newVars);
  };

  const removeEnvVar = (index: number) => {
    setEnvVariables(envVariables.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">
          You&apos;re almost done.
        </h1>
        <p className="text-zinc-400">
          Please review the project settings before deploying.
        </p>

        {/* Import Source Card */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Github className="h-4 w-4" />
                <span>Importing from GitHub</span>
              </div>
              <div className="flex items-center gap-3 bg-black/40 p-4 rounded-lg border border-zinc-800">
                <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center">
                  <Github className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{repo}</span>
                    <Badge
                      variant="secondary"
                      className="bg-zinc-800 text-zinc-400 border-none h-5 px-1.5 gap-1 font-normal"
                    >
                      <GitBranch className="h-3 w-3" />
                      main
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Configuration Card */}
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label
                  htmlFor="team"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Project Team
                </Label>
                <Select defaultValue="personal">
                  <SelectTrigger
                    id="team"
                    className="bg-black/50 border-zinc-800 h-10 px-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-linear-to-r from-emerald-500 to-teal-500" />
                      <span>Shakib Khan&apos;s projects</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px] h-4 border-zinc-800 text-zinc-500"
                      >
                        Hobby
                      </Badge>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="personal">
                      Shakib Khan&apos;s projects
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project-name"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-black/50 border-zinc-800 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Framework Preset
              </Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-black/50 border-zinc-800 h-10">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-zinc-500" />
                    <SelectValue placeholder="Select Framework" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="nextjs">Next.js</SelectItem>
                  <SelectItem value="vite">Vite</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Root Directory
              </Label>
              <div className="relative">
                <Input
                  value="./"
                  readOnly
                  className="bg-black/50 border-zinc-800 h-10 pr-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 px-3 text-xs bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700"
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Advanced Settings */}
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-2 border-none"
            >
              <AccordionItem
                value="build-settings"
                className="border border-zinc-800 rounded-lg bg-black/20 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-zinc-800/30">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Settings className="h-4 w-4 text-zinc-500" />
                    Build and Output Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 w-full mr-4">
                        <Label className="text-sm font-medium">
                          Build Command
                        </Label>
                        <Input
                          placeholder="npm run build"
                          value={buildCommand}
                          onChange={(e) => setBuildCommand(e.target.value)}
                          disabled={!overrideBuild}
                          className="bg-black/50 border-zinc-800 h-8 text-xs mt-1 disabled:opacity-50"
                        />
                      </div>
                      <Switch
                        checked={overrideBuild}
                        onCheckedChange={setOverrideBuild}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 w-full mr-4">
                        <Label className="text-sm font-medium">
                          Output Directory
                        </Label>
                        <Input
                          placeholder="public"
                          value={outputDirectory}
                          onChange={(e) => setOutputDirectory(e.target.value)}
                          disabled={!overrideOutput}
                          className="bg-black/50 border-zinc-800 h-8 text-xs mt-1 disabled:opacity-50"
                        />
                      </div>
                      <Switch
                        checked={overrideOutput}
                        onCheckedChange={setOverrideOutput}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 w-full mr-4">
                        <Label className="text-sm font-medium">
                          Install Command
                        </Label>
                        <Input
                          placeholder="npm install"
                          value={installCommand}
                          onChange={(e) => setInstallCommand(e.target.value)}
                          disabled={!overrideInstall}
                          className="bg-black/50 border-zinc-800 h-8 text-xs mt-1 disabled:opacity-50"
                        />
                      </div>
                      <Switch
                        checked={overrideInstall}
                        onCheckedChange={setOverrideInstall}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="env-variables"
                className="border border-zinc-800 rounded-lg bg-black/20 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-zinc-800/30">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Lock className="h-4 w-4 text-zinc-500" />
                    Environment Variables
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 space-y-6">
                  {envVariables.map((ev, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="grid flex-1 items-start gap-2">
                        <Label className="text-xs text-zinc-500">Key</Label>
                        <Input
                          placeholder="EXAMPLE_NAME"
                          value={ev.key}
                          onChange={(e) =>
                            updateEnvVar(index, "key", e.target.value)
                          }
                          className="bg-black/50 border-zinc-800 h-9"
                        />
                      </div>
                      <div className="grid flex-1 items-start gap-2">
                        <Label className="text-xs text-zinc-500">Value</Label>
                        <Input
                          placeholder="EXAMPLE_VALUE"
                          value={ev.value}
                          onChange={(e) =>
                            updateEnvVar(index, "value", e.target.value)
                          }
                          className="bg-black/50 border-zinc-800 h-9"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeEnvVar(index)}
                        className="h-9 w-9 border-zinc-800 bg-black/50 text-zinc-500"
                        disabled={envVariables.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="outline"
                      onClick={addEnvVar}
                      className="w-full border-dashed border-zinc-800 bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900 h-10 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add More
                    </Button>
                    <div className="flex items-center gap-2 p-2 border border-zinc-800 rounded-lg bg-black/40">
                      <Settings className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs text-zinc-500">
                        Import .env or paste the .env contents above.{" "}
                        <a href="#" className="text-blue-500 hover:underline">
                          Learn more
                        </a>
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              onClick={handleDeploy}
              className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-semibold text-base transition-all active:scale-[0.98]"
            >
              Deploy
            </Button>
          </CardContent>
        </Card>

        {/* Deployment Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Deployment</h2>
          <Card className="bg-zinc-900/40 border-zinc-800 min-h-100 flex flex-col relative overflow-hidden group">
            <CardContent className="p-8 relative z-10">
              {!isDeploying ? (
                <p className="text-zinc-500 text-sm">
                  Once you&apos;re ready, start deploying to see the progress
                  here...
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Deployment in progress...</span>
                    </div>
                  </div>

                  {/* Logs Terminal */}
                  <div className="bg-black/80 rounded-lg border border-zinc-800 font-mono text-xs overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                      <Terminal className="h-3 w-3 text-zinc-500" />
                      <span className="text-zinc-400 uppercase tracking-widest text-[10px]">
                        Build Output
                      </span>
                    </div>
                    <div
                      ref={scrollRef}
                      className="p-4 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-800"
                    >
                      {logs.length === 0 ? (
                        <div className="text-zinc-600 italic">
                          Waiting for logs...
                        </div>
                      ) : (
                        logs.map((log, i) => (
                          <div
                            key={i}
                            className="text-zinc-300 break-words leading-relaxed"
                          >
                            <span className="text-zinc-600 mr-2">
                              [{i + 1}]
                            </span>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: deploymentId ? "100%" : "30%" }}
                      transition={{ duration: 10 }}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            {/* Globe Wireframe Visualization */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
              <div className="w-full h-75 relative overflow-hidden">
                <svg
                  viewBox="0 0 800 400"
                  className="w-full h-full text-zinc-500 translate-y-20"
                >
                  {/* Longitude lines */}
                  <ellipse
                    cx="400"
                    cy="400"
                    rx="400"
                    ry="300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <ellipse
                    cx="400"
                    cy="400"
                    rx="300"
                    ry="300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <ellipse
                    cx="400"
                    cy="400"
                    rx="200"
                    ry="300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <ellipse
                    cx="400"
                    cy="400"
                    rx="100"
                    ry="300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="400"
                    y1="100"
                    x2="400"
                    y2="400"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />

                  {/* Latitude lines */}
                  <path
                    d="M0 400 C300 100 500 100 800 400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M40 350 C300 150 500 150 760 350"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M100 300 C300 200 500 200 700 300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M200 250 C300 230 500 230 600 250"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ImportProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
        </div>
      }
    >
      <ImportProjectContent />
    </Suspense>
  );
}
