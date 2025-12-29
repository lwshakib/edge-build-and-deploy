"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Globe,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowRight,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deploymentId = searchParams.get("deploymentId");
  const projectId = searchParams.get("projectId");

  const [status, setStatus] = React.useState<
    "queue" | "building" | "deploying" | "ready" | "error"
  >("queue");
  const [logs, setLogs] = React.useState<string[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [projectSubdomain, setProjectSubdomain] = React.useState("");

  // Auto-scroll logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch project details to get subdomain
  React.useEffect(() => {
    if (projectId) {
      fetch(`${SERVER_URL}/api/project`); // This brings all, let's filter or we might need a specific endpoint.
      // Actually, let's just wait for the logs or assume we can get it later.
      // For now, let's disable this or use the list endpoint efficiently.
      // Better approach: When status is ready, show a link.
      // We will assume subDomain is available or fetch specifically.
      // Let's rely on dashboard redirect for full details, providing a generic link here.
      // OR, fetch current project details.
    }
  }, [projectId]);

  // Socket Connection
  React.useEffect(() => {
    if (!deploymentId) return;

    const socket = io(SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to logs server");
      socket.emit("subscribe:logs", deploymentId);
    });

    socket.on("log", (log: string) => {
      // Clean log string if JSON
      let message = log;
      try {
        const parsed = JSON.parse(log);
        if (parsed.log) message = parsed.log;
      } catch (e) {}

      setLogs((prev) => [...prev, message]);

      // State transitions based on log parsing
      if (message.includes("Build Started")) {
        setStatus("building");
      }
      if (message.includes("Starting to upload")) {
        setStatus("deploying");
      }
      if (message.includes("Done")) {
        setStatus("ready");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      if (message.includes("ERROR") || message.includes("failed")) {
        setStatus("error");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [deploymentId]);

  const steps = [
    {
      id: "build",
      label: "Build Logs",
      status:
        status === "queue"
          ? "pending"
          : status === "building"
          ? "active"
          : "completed",
      icon: Terminal,
    },
    {
      id: "summary",
      label: "Deployment Summary",
      status:
        status === "ready"
          ? "completed"
          : status === "deploying"
          ? "active"
          : "pending",
      icon: Clock,
    },
    {
      id: "domain",
      label: "Assigning Custom Domains",
      status: status === "ready" ? "completed" : "pending",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Deployment</h1>
          <div className="flex items-center gap-2 text-zinc-400">
            {status === "queue" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deployment queued...</span>
              </>
            )}
            {status === "building" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-zinc-200">Building project...</span>
              </>
            )}
            {status === "deploying" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-zinc-200">Finalizing deployment...</span>
              </>
            )}
            {status === "ready" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Deployment Complete!</span>
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Deployment Failed</span>
              </>
            )}
          </div>
        </div>

        {/* Deployment Steps Accordion */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
          <Accordion
            type="single"
            collapsible
            defaultValue="build"
            className="w-full"
          >
            {/* Build Logs Step */}
            <AccordionItem value="build" className="border-b border-zinc-800">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 w-48">
                    <Terminal className="h-4 w-4 text-zinc-500" />
                    <span>Build Logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === "building" && (
                      <span className="text-xs text-zinc-500 flex items-center gap-2">
                        Running{" "}
                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                      </span>
                    )}
                    {(status === "deploying" || status === "ready") && (
                      <span className="text-xs text-emerald-500">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-black/50 border-t border-zinc-800">
                <div
                  ref={scrollRef}
                  className="p-4 h-[300px] overflow-y-auto font-mono text-xs space-y-1"
                >
                  {logs.length === 0 ? (
                    <div className="text-zinc-600 italic">Waiting...</div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="text-zinc-300 break-words">
                        <span className="text-zinc-600 mr-2 opacity-50">
                          {new Date().toLocaleTimeString()}
                        </span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Deployment Summary */}
            <AccordionItem value="summary" className="border-b border-zinc-800">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 w-48">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span>Deployment Summary</span>
                  </div>
                  <div>
                    {status === "ready" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 text-zinc-400 text-sm">
                Project files have been successfully built and uploaded to the
                storage bucket. The deployment is ready to be served.
              </AccordionContent>
            </AccordionItem>

            {/* Custom Domains */}
            <AccordionItem value="domains" className="border-none">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 w-48">
                    <Globe className="h-4 w-4 text-zinc-500" />
                    <span>Assigning Custom Domains</span>
                  </div>
                  <div>
                    {status === "ready" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 text-zinc-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>
                    Your project has been assigned a subdomain. It will be
                    available shortly.
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Success Card */}
        <AnimatePresence>
          {status === "ready" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative group">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 blur-[2px]" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl" />

                <CardContent className="p-12 text-center relative z-10">
                  <div className="mx-auto h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    You just deployed a new project. It is now live and ready to
                    share with the world.
                  </p>

                  <div className="w-full h-64 bg-black rounded-lg border border-zinc-800 mb-8 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-zinc-600 font-mono text-sm">
                        Preview generating...
                      </div>
                    </div>
                    {/* Placeholder for iframe/preview */}
                    <div className="absolute inset-0 bg-zinc-900/50 hover:bg-transparent transition-colors cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 h-12 px-6"
                      onClick={() => router.push(`/project/${projectId}`)}
                    >
                      Project Settings
                    </Button>
                    <Button
                      className="bg-white text-black hover:bg-zinc-200 h-12 px-8 gap-2 group/btn"
                      onClick={() => router.push("/overview")}
                    >
                      Continue to Dashboard
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-zinc-500 text-xs font-mono">
          Deployment ID: {deploymentId}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
