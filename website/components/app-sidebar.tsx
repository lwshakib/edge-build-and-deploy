"use client";

import * as React from "react";
import { useParams, usePathname } from "next/navigation";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Rocket,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { ProjectSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  websites: [
    {
      name: "E-commerce Platform",
      slug: "e-commerce-platform",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Portfolio Site",
      slug: "portfolio-site",
      logo: AudioWaveform,
      plan: "Personal",
    },
    {
      name: "Corporate Blog",
      slug: "corporate-blog",
      logo: Command,
      plan: "Business",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Deployments",
      url: "/deployments",
      icon: Rocket,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: PieChart,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  const navMain = [
    {
      title: "Dashboard",
      url: `/${slug}`,
      icon: LayoutDashboard,
      isActive: pathname === `/${slug}`,
    },
    {
      title: "Deployments",
      url: `/${slug}/~/deployments`,
      icon: Rocket,
      isActive: pathname === `/${slug}/~/deployments`,
    },
    {
      title: "Analytics",
      url: `/${slug}/~/analytics`,
      icon: PieChart,
      isActive: pathname === `/${slug}/~/analytics`,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: pathname.startsWith(`/${slug}/~/settings`),
      items: [
        {
          title: "General",
          url: `/${slug}/~/settings`,
          isActive: pathname === `/${slug}/~/settings`,
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher projects={data.websites} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
