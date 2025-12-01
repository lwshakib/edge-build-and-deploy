import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutGrid,
  Layers,
  Activity,
  Settings,
  Search,
  Bell,
  HelpCircle,
  UploadCloud,
  Box,
  Timer,
  Zap,
  GitBranch,
  GitCommit,
  Clock,
  ExternalLink,
  ChevronsUpDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/**
 * Example dynamic route with authentication
 *
 * This page requires authentication - if user is not signed in,
 * they will be automatically redirected to /auth
 */
export default async function DynamicPage({
  params,
}: {
  params: { slug: string };
}) {
  // This will redirect to /auth if not authenticated
  const { user } = await auth();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Top Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your latest deployments and verify system status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-border text-foreground"
            >
              View Logs
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] gap-2">
              <UploadCloud className="w-4 h-4" />
              Deploy App
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-accent/20 backdrop-blur-sm hover:border-border/70 transition-colors group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  TOTAL DEPLOYMENTS
                </span>
                <Box className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight text-foreground">
                  142
                </span>
                <span className="text-xs text-emerald-500 font-medium flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-accent/20 backdrop-blur-sm hover:border-border/70 transition-colors group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  AVG. BUILD TIME
                </span>
                <Timer className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight text-foreground">
                  42s
                </span>
                <span className="text-xs text-emerald-500 font-medium flex items-center">
                  <ArrowDownRight className="w-3 h-3 mr-0.5" /> 1.4s
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-accent/20 backdrop-blur-sm hover:border-border/70 transition-colors group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  SUCCESS RATE
                </span>
                <Zap className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight text-foreground">
                  99.9%
                </span>
                <div className="h-1.5 w-16 bg-zinc-800 rounded-full ml-2 overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Deployment Card */}
        <Card className="border-border bg-card/50 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              Live
            </Badge>
          </div>
          <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 w-32 h-32 bg-zinc-900 rounded-lg border border-border flex items-center justify-center relative overflow-hidden group-hover:border-zinc-700 transition-all">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iIzIyMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-20"></div>
              <span className="text-4xl font-bold text-zinc-800 select-none">
                EC
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xl font-medium text-foreground tracking-tight">
                    {params.slug}
                  </h3>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors mt-1 flex items-center gap-1"
                  >
                    production-app-v2.edge.app
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="mt-6 flex items-center gap-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GitBranch className="w-4 h-4" />
                    <span className="font-mono text-xs bg-accent px-1.5 py-0.5 rounded border border-border">
                      main
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GitCommit className="w-4 h-4" />
                    <span className="font-mono text-xs text-muted-foreground/80">
                      8f2a1b
                    </span>
                    <span className="text-muted-foreground/60 text-xs">
                      Updated cart logic
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    2m ago
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/30 px-6 py-3 flex items-center gap-4 overflow-x-auto">
            <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap flex items-center gap-2">
              <span className="text-green-400">✓</span> Build completed in 42s
            </div>
            <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap flex items-center gap-2">
              <span className="text-blue-400">ℹ</span> Cold start duration:
              120ms
            </div>
            <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap flex items-center gap-2">
              <span className="text-zinc-400">→</span> Deployed to sfo1, iad1,
              lhr1
            </div>
          </div>
        </Card>

        {/* Recent Activity Table */}
        <Card className="border-border bg-accent/20 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Recent Deployments
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View All
            </Button>
          </CardHeader>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Commit</th>
                  <th className="px-6 py-3 font-medium">Environment</th>
                  <th className="px-6 py-3 font-medium text-right">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="group hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      docs-platform
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated API references
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                      Building
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3" /> a1b2c3
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    Preview
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-muted-foreground font-mono">
                    --
                  </td>
                </tr>
                <tr className="group hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      portfolio-v2
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fix mobile navigation
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                      Ready
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3" /> 9d8e7f
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    Production
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-muted-foreground font-mono">
                    24s
                  </td>
                </tr>
                <tr className="group hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      edge-functions
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Middleware optimization
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                      Failed
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3" /> 5g4h3j
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    Development
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-muted-foreground font-mono">
                    12s
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Console Area */}
        <Card className="border-border bg-black/50 backdrop-blur-xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Terminal
            </div>
          </div>
          <ScrollArea className="h-32">
            <div className="p-4 font-mono text-xs space-y-1 text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-muted-foreground/50 select-none">
                  10:42:01
                </span>
                <span>
                  Retrieving cache from{" "}
                  <span className="text-indigo-400">us-east-1</span>...
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground/50 select-none">
                  10:42:02
                </span>
                <span className="text-green-400">✓ Cache restored</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground/50 select-none">
                  10:42:03
                </span>
                <span>
                  Running build command:{" "}
                  <span className="text-foreground/90">npm run build</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground/50 select-none">
                  10:42:15
                </span>
                <span>Generating static pages (142/142)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground/50 select-none">
                  10:42:42
                </span>
                <span>
                  <span className="text-cyan-400">info</span> - Finalizing
                  edge function optimization...
                </span>
              </div>
              <div className="flex gap-2 animate-pulse">
                <span className="text-muted-foreground/50 select-none">
                  10:42:43
                </span>
                <span className="text-foreground">_</span>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
