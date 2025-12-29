"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Globe,
  ExternalLink,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deploymentId = searchParams.get("deploymentId");
  const projectId = searchParams.get("projectId");

  const [project, setProject] = React.useState<any>(null);

  // Fetch project details
  React.useEffect(() => {
    if (projectId) {
      fetch(`${SERVER_URL}/api/project`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          const p = data.find((item: any) => item.id === projectId);
          if (p) {
            setProject(p);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        });
    }
  }, [projectId]);

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-12 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="bg-[#0A0A0A] border-zinc-800 overflow-hidden relative border-t-zinc-700 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-30" />

            <CardContent className="p-10 relative z-10">
              <h2 className="text-4xl font-bold text-white mb-3">
                Congratulations!
              </h2>
              <p className="text-zinc-400 text-lg mb-8">
                You just deployed a new project to{" "}
                <span className="inline-flex items-center gap-2 text-white">
                  <div className="h-4 w-4 rounded-full bg-emerald-500" />
                  Shakib Khan&apos;s projects.
                </span>
              </p>

              <div className="w-full h-[400px] bg-black rounded-xl border border-zinc-800 mb-10 overflow-hidden relative group">
                {project?.subDomain ? (
                  <iframe
                    src={`http://${project.subDomain}.localhost:8000`}
                    className="w-full h-full border-none"
                    title="Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
                    <div className="text-center space-y-4">
                      <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                        <Globe className="h-6 w-6 text-zinc-700" />
                      </div>
                      <div className="text-zinc-600 font-medium">
                        Preview generating...
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              <div className="space-y-6 mb-10">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                  Next Steps
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                      <ExternalLink className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        Instant Previews
                      </h4>
                      <p className="text-zinc-500 text-sm">
                        Push a new branch to preview changes instantly
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                      <Globe className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        Add Domain
                      </h4>
                      <p className="text-zinc-500 text-sm">
                        Add a custom domain to your project
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 self-center group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                      <Clock className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        Enable Speed Insights
                      </h4>
                      <p className="text-zinc-500 text-sm">
                        Track how users experience your site over time
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 self-center group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-zinc-200 h-14 text-lg font-semibold rounded-xl"
                onClick={() => router.push("/overview")}
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>

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
