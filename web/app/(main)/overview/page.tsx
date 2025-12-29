"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ListFilter,
  LayoutGrid,
  List,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
  ChevronUp,
  GitBranch,
  Github,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemActions,
  ItemGroup,
} from "@/components/ui/item";
import { CircularGauge } from "@/components/ui/circular-gauge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const USAGE_ITEMS = [
  {
    name: "Edge Requests",
    value: "$1.83K",
    percentage: 67.34,
  },
  {
    name: "Fast Data Transfer",
    percentage: 52.18,
    value: "$952.51",
  },
  {
    name: "Monitoring data points",
    percentage: 89.42,
    value: "$901.20",
  },
  {
    name: "Web Analytics Events",
    percentage: 45.67,
    value: "$603.71",
  },
  {
    name: "Edge Request CPU Duration",
    percentage: 23.91,
    value: "$4.65",
  },
  {
    name: "Fast Origin Transfer",
    percentage: 38.75,
    value: "$3.85",
  },
  {
    name: "ISR Reads",
    percentage: 71.24,
    value: "$2.86",
  },
  {
    name: "Function Invocations",
    percentage: 15.83,
    value: "$0.60",
  },
  {
    name: "ISR Writes",
    percentage: 26.23,
    value: "524.52K / 2M",
  },
  {
    name: "Function Duration",
    percentage: 5.11,
    value: "5.11 GB Hrs / 1K GB Hrs",
  },
];

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

export default function OverviewPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${SERVER_URL}/api/project`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground p-6 pt-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 gap-4 max-w-[1400px] mx-auto w-full">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Projects..."
            className="pl-10 bg-background border-border h-10 w-full focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <ListFilter className="h-4 w-4" />
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none border-r"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-foreground text-background hover:bg-foreground/90 font-medium px-4 h-10 gap-2">
                Add New...
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/project/new")}>
                Project
              </DropdownMenuItem>
              <DropdownMenuItem>Domain</DropdownMenuItem>
              <DropdownMenuItem>Store</DropdownMenuItem>
              <DropdownMenuItem>Integration</DropdownMenuItem>
              <DropdownMenuItem>Team Member</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[1400px] mx-auto w-full">
        {/* Left Column: Usage & Alerts */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Usage Section */}
          <div>
            <h2 className="text-sm font-semibold mb-4">Usage</h2>
            <Card className="bg-background border-border overflow-hidden">
              <CardHeader className="flex flex-col pb-2 pt-4 px-4 space-y-1">
                <CardTitle className="text-sm font-semibold">
                  5 days remaining in cycle
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 leading-none">
                <ItemGroup className="gap-0 border-none">
                  {USAGE_ITEMS.map((item) => (
                    <Item
                      key={item.name}
                      size="sm"
                      asChild
                      className="px-0 group-hover/item-group:bg-transparent border-none py-2"
                    >
                      <a href="#" className="flex items-center w-full">
                        <ItemMedia
                          variant="default"
                          className="bg-transparent border-none size-6 mr-3"
                        >
                          <CircularGauge
                            percentage={item.percentage}
                            size={20}
                            strokeWidth={2.5}
                          />
                        </ItemMedia>
                        <ItemContent className="flex-1 min-w-0">
                          <ItemTitle className="text-[11px] font-normal truncate">
                            {item.name}
                          </ItemTitle>
                        </ItemContent>
                        <ItemActions>
                          <span className="text-muted-foreground font-mono text-[10px] tabular-nums">
                            {item.value}
                          </span>
                        </ItemActions>
                      </a>
                    </Item>
                  ))}
                </ItemGroup>
                <div className="flex justify-center pt-2">
                  <ChevronUp className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          <div>
            <h2 className="text-sm font-semibold mb-4">Alerts</h2>
            <Card className="bg-background border-border">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-2">
                <h3 className="text-sm font-semibold">
                  Get alerted for anomalies
                </h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Automatically monitor your projects for anomalies and get
                  notified.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full text-xs h-9"
                >
                  Upgrade to Observability Plus
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Projects Grid */}
        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full py-10 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800" />
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full border border-dashed rounded-lg p-10 text-center text-muted-foreground">
                No projects yet. Create one to get started!
              </div>
            ) : (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-background border-border hover:border-border/80 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                          <img
                            src={"/globe.svg"}
                            alt=""
                            className="h-5 w-5 dark:invert"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold leading-none mb-1 group-hover:underline">
                            {project.name}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-none">
                            {project.subDomain}.localhost:8000
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle logic
                          }}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-muted hover:bg-muted text-[10px] h-5 px-2 gap-1.5 font-normal rounded-full border border-border"
                        >
                          <Github className="h-3 w-3" />
                          {project.repoName || "repo-name"}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        Deployment Status:{" "}
                        {project.Deployment?.[0]?.status || "Active"}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>
                          Created{" "}
                          {formatDistanceToNow(new Date(project.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          <span>main</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
