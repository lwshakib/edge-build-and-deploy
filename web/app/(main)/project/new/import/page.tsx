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
  Loader2,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
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

  // Framework defaults
  React.useEffect(() => {
    if (framework === "vite") {
      setBuildCommand("vite build");
      setOutputDirectory("dist");
      setInstallCommand("");
    } else if (framework === "nextjs") {
      setBuildCommand("next build");
      setOutputDirectory(".next");
      setInstallCommand("");
    } else if (framework === "angular") {
      setBuildCommand("ng build");
      setOutputDirectory("dist");
      setInstallCommand("");
    } else if (framework === "nuxt") {
      setBuildCommand("nuxt build");
      setOutputDirectory(".output/public");
      setInstallCommand("");
    } else if (framework === "svelte") {
      setBuildCommand("npm run build");
      setOutputDirectory("build");
      setInstallCommand("");
    }
  }, [framework]);

  const [isDeploying, setIsDeploying] = React.useState(false);
  const [projectNameError, setProjectNameError] = React.useState<string | null>(
    null
  );
  const [status, setStatus] = React.useState<
    "queue" | "building" | "deploying" | "ready" | "error"
  >("queue");
  const [logs, setLogs] = React.useState<string[]>([]);
  const [deploymentId, setDeploymentId] = React.useState<string | null>(null);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const socketRef = React.useRef<Socket | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Timer for elapsed time
  React.useEffect(() => {
    if (!startTime || status === "ready" || status === "error") return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Auto-scroll logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Detect Framework
  React.useEffect(() => {
    const detectFramework = async () => {
      if (!owner || !repoName) return;
      try {
        const res = await fetch(
          `${SERVER_URL}/api/github/framework?owner=${owner}&repo=${repoName}`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.framework && data.framework !== "other") {
            setFramework(data.framework);
            toast.info(`Detected ${data.framework} framework`);
          }
        }
      } catch (error) {
        console.error("Error detecting framework:", error);
      }
    };

    detectFramework();
  }, [owner, repoName]);

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
        let message = log;
        try {
          const parsed = JSON.parse(log);
          if (parsed.log) message = parsed.log;
        } catch (e) { }

        setLogs((prev) => [...prev, message]);

        if (message.includes("Build Started")) {
          setStatus("building");
        }
        if (message.includes("Starting to upload")) {
          setStatus("deploying");
        }
        if (message.includes("Done")) {
          setStatus("ready");
        }
        if (message.includes("ERROR") || message.includes("failed")) {
          setStatus("error");
        }
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
      };
    }
  }, [isDeploying, deploymentId]);

  // Redirect on success
  React.useEffect(() => {
    if (status === "ready" && deploymentId && projectId) {
      router.push(
        `/project/new/success?deploymentId=${deploymentId}&projectId=${projectId}`
      );
    }
  }, [status, deploymentId, projectId, router]);

  const handleDeploy = async () => {
    if (!projectName) {
      setProjectNameError("Project name is required");
      toast.error("Project name is required");
      return;
    }

    setProjectNameError(null);

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
          buildCommand: overrideBuild ? buildCommand : null,
          outputDirectory: overrideOutput ? outputDirectory : null,
          installCommand: overrideInstall ? installCommand : null,
          repoName: repo,
          envVariables: envVariables.filter((ev) => ev.key && ev.value),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDeploymentId(data.deployment.id);
        setProjectId(data.project.id);
        setStartTime(Date.now());
        toast.success("Deployment started!");
      } else {
        const data = await res.json();
        if (data.message?.toLowerCase().includes("already exists")) {
          setProjectNameError(data.message);
        }
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
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (projectNameError) setProjectNameError(null);
                  }}
                  className={`bg-black/50 border-zinc-800 h-10 ${projectNameError ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[11px] text-zinc-500">Your URL:</span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {projectName
                      ? `${projectName.toLowerCase().replace(/\s+/g, "-")}.localhost:8000`
                      : "project-slug.localhost:8000"}
                  </span>
                </div>
                {projectNameError && (
                  <p className="text-xs text-red-500 mt-1">
                    {projectNameError}
                  </p>
                )}
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
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-zinc-400">
                Root Directory
              </Label>
              <div className="flex gap-2">
                <Input
                  value="./"
                  readOnly
                  className="bg-[#0A0A0A] border-zinc-800 h-11 flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  className="bg-[#0A0A0A] border-zinc-800 hover:bg-zinc-900 text-white h-11 px-6 font-medium"
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
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-zinc-800/30 [&>svg]:hidden [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center gap-2 font-medium text-sm text-zinc-300">
                    <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-200" />
                    Build and Output Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 space-y-6">
                  <div className="space-y-6">
                    {/* Build Command */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-[13px] font-medium text-zinc-400">
                          Build Command
                        </Label>
                        <Info className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <div
                        className={`flex items-center gap-2 bg-[#0A0A0A] border border-zinc-800 rounded-md px-3 py-1.5 transition-all ${!overrideBuild ? "opacity-50" : "ring-1 ring-zinc-700"
                          }`}
                      >
                        <Input
                          placeholder="npm run build"
                          value={buildCommand}
                          onChange={(e) => setBuildCommand(e.target.value)}
                          disabled={!overrideBuild}
                          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-7 text-sm p-0 flex-1 font-mono"
                        />
                        <Switch
                          checked={overrideBuild}
                          onCheckedChange={setOverrideBuild}
                          className="data-[state=checked]:bg-blue-600 scale-90"
                        />
                      </div>
                    </div>

                    {/* Output Directory */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-[13px] font-medium text-zinc-400">
                          Output Directory
                        </Label>
                        <Info className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <div
                        className={`flex items-center gap-2 bg-[#0A0A0A] border border-zinc-800 rounded-md px-3 py-1.5 transition-all ${!overrideOutput ? "opacity-50" : "ring-1 ring-zinc-700"
                          }`}
                      >
                        <Input
                          placeholder="dist"
                          value={outputDirectory}
                          onChange={(e) => setOutputDirectory(e.target.value)}
                          disabled={!overrideOutput}
                          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-7 text-sm p-0 flex-1 font-mono"
                        />
                        <Switch
                          checked={overrideOutput}
                          onCheckedChange={setOverrideOutput}
                          className="data-[state=checked]:bg-blue-600 scale-90"
                        />
                      </div>
                    </div>

                    {/* Install Command */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-[13px] font-medium text-zinc-400">
                          Install Command
                        </Label>
                        <Info className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <div
                        className={`flex items-center gap-2 bg-[#0A0A0A] border border-zinc-800 rounded-md px-3 py-1.5 transition-all ${!overrideInstall ? "opacity-50" : "ring-1 ring-zinc-700"
                          }`}
                      >
                        <Input
                          placeholder="`yarn install`, `pnpm install`, `npm install`, or `bun install`"
                          value={installCommand}
                          onChange={(e) => setInstallCommand(e.target.value)}
                          disabled={!overrideInstall}
                          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-7 text-sm p-0 flex-1 font-mono"
                        />
                        <Switch
                          checked={overrideInstall}
                          onCheckedChange={setOverrideInstall}
                          className="data-[state=checked]:bg-blue-600 scale-90"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="env-variables"
                className="border border-zinc-800 rounded-lg bg-black/20 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-zinc-800/30 [&>svg]:hidden [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center gap-2 font-medium text-sm text-zinc-300">
                    <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-200" />
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
          <Card className="bg-[#0A0A0A] border-zinc-800 min-h-100 flex flex-col relative overflow-hidden group rounded-xl">
            <CardContent className="p-0 relative z-10">
              {!isDeploying ? (
                <div className="p-8">
                  <p className="text-zinc-500 text-sm">
                    Once you&apos;re ready, start deploying to see the progress
                    here...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="p-6 border-b border-zinc-800 flex items-center gap-3 text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                    <span className="text-[15px]">
                      {status === "queue"
                        ? "Deployment queued..."
                        : `Deployment started ${elapsedTime}s ago...`}
                    </span>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="build"
                    className="w-full"
                  >
                    {/* Build Logs Step */}
                    <AccordionItem
                      value="build"
                      className="border-b border-zinc-800"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-zinc-800/20 [&>svg]:hidden">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <ChevronRight className="h-4 w-4 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            <span className="font-medium text-zinc-300">
                              Build Logs
                            </span>
                            {status === "building" && (
                              <span className="text-sm text-zinc-500 ml-2">
                                Installing dependencies ...
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {status === "building" && (
                              <span className="text-sm text-zinc-500">
                                {elapsedTime}s
                              </span>
                            )}
                            {status === "building" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                            ) : status === "queue" ? (
                              <Clock className="h-4 w-4 text-zinc-600" />
                            ) : status === "error" ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-black border-t border-zinc-800">
                        <div className="p-4 bg-[#050505]">
                          <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                              <Terminal className="h-3.5 w-3.5" />
                              <span>{logs.length} lines</span>
                            </div>
                            <div className="relative">
                              <Input
                                placeholder="Find in logs"
                                className="h-8 w-64 bg-zinc-900/50 border-zinc-800 text-xs pl-8"
                              />
                              <Terminal className="h-3 w-3 absolute left-2.5 top-2.5 text-zinc-600" />
                            </div>
                          </div>
                          <div
                            ref={scrollRef}
                            className="h-[300px] overflow-y-auto font-mono text-[11px] space-y-1 px-2 scrollbar-thin scrollbar-thumb-zinc-800"
                          >
                            {logs.length === 0 ? (
                              <div className="text-zinc-700 italic">
                                Waiting for logs...
                              </div>
                            ) : (
                              logs.map((log, i) => (
                                <div
                                  key={i}
                                  className="text-zinc-400 flex gap-4"
                                >
                                  <span className="text-zinc-700 select-none min-w-[80px]">
                                    {new Date().toLocaleTimeString([], {
                                      hour12: false,
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                  </span>
                                  <span className="break-words">{log}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Deployment Summary */}
                    <AccordionItem
                      value="summary"
                      className="border-b border-zinc-800"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-zinc-800/20 [&>svg]:hidden">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <ChevronRight className="h-4 w-4 text-zinc-500" />
                            <span className="font-medium text-zinc-300">
                              Deployment Summary
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {status === "deploying" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                            ) : status === "error" ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-zinc-600" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-6 text-zinc-500 text-sm">
                        Finalizing the build and preparing the deployment for
                        production.
                      </AccordionContent>
                    </AccordionItem>

                    {/* Custom Domains */}
                    <AccordionItem value="domains" className="border-none">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-zinc-800/20 [&>svg]:hidden">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <ChevronRight className="h-4 w-4 text-zinc-500" />
                            <span className="font-medium text-zinc-300">
                              Assigning Custom Domains
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {status === "error" ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-zinc-600" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-6 text-zinc-500 text-sm">
                        Assigning the unique subdomain and configuring the
                        routing.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </CardContent>
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
