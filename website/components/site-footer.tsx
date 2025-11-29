"use client";

import type { ComponentType } from "react";

import { motion, type Easing, type Variants } from "framer-motion";
import {
  Disc,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
} from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Footer configuration
const footerConfig = {
  brand: {
    logo: "Edge",
    icon: "Rocket",
    tagline: "Deploy React & HTML Apps in Seconds",
    description:
      "Zero config, instant previews, and a global edge network built for developers.",
  },
  social: [
    { platform: "GitHub", icon: "Github", href: "https://github.com" },
    { platform: "Twitter", icon: "Twitter", href: "https://twitter.com" },
    { platform: "Discord", icon: "MessageCircle", href: "https://discord.com" },
    { platform: "LinkedIn", icon: "Linkedin", href: "https://linkedin.com" },
  ],
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/api" },
        { label: "Changelog", href: "/changelog" },
        { label: "Status", href: "/status" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
        { label: "Press Kit", href: "/press" },
        { label: "Partners", href: "/partners" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Community", href: "/community" },
        { label: "Support", href: "/support" },
        { label: "Guides", href: "/guides" },
        { label: "Templates", href: "/templates" },
        { label: "Case Studies", href: "/case-studies" },
      ],
    },
  ],
  newsletter: {
    show: true,
    title: "Stay Updated",
    description: "Get the latest updates and releases.",
    placeholder: "you@company.dev",
    buttonText: "Subscribe",
    position: "column-4",
  },
  bottom: {
    copyright: "© 2025 Edge. All rights reserved.",
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
    badges: [
      { text: "SOC 2 Certified", show: true },
      { text: "GDPR Compliant", show: true },
    ],
  },
};

const layoutColorPalette = {
  accent: {
    gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
  },
};

const layoutAnimations = {
  footer: {
    section: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, ease: "easeOut" },
    },
    stagger: {
      children: 0.1,
    },
    links: {
      hover: { x: 4, color: "#67e8f9", duration: 200 },
    },
    social: {
      hover: { scale: 1.1, rotate: 5, glow: true, duration: 200 },
    },
  },
};

const layoutEffects = {
  glow: "0px 0px 30px rgba(14, 165, 233, 0.4)",
};

const layoutTypography = {
  footer: {
    brand: "text-lg font-semibold",
    columnTitle: "text-sm font-semibold uppercase tracking-[0.3em]",
    links: "text-sm",
    copyright: "text-xs",
    legal: "text-xs",
  },
};

const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  Github,
  Twitter,
  Discord: Disc,
  Linkedin,
  MessageCircle,
};

const fallbackIcon = Mail;

const easingMap: Record<string, Easing> = {
  linear: (t: number) => t,
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

const resolveEase = (ease?: string): Easing | undefined =>
  ease ? easingMap[ease] ?? easingMap.easeOut : undefined;

const footerVariants: Variants = {
  hidden: layoutAnimations.footer.section.initial,
  visible: {
    ...layoutAnimations.footer.section.animate,
    transition: {
      duration: layoutAnimations.footer.section.transition.duration,
      ease: resolveEase(layoutAnimations.footer.section.transition.ease),
    },
  },
};

const linkHover = layoutAnimations.footer.links.hover;
const socialHover = layoutAnimations.footer.social.hover;

const renderLink = (label: string, href: string) => (
  <Link
    key={label}
    href={href}
    className={cn(
      "text-sm text-slate-300 transition",
      layoutTypography.footer.links,
      "hover:text-cyan-200"
    )}
  >
    <motion.span
      whileHover={{ x: linkHover.x, color: linkHover.color }}
      transition={{ duration: linkHover.duration }}
    >
      {label}
    </motion.span>
  </Link>
);

export function SiteFooter() {
  const columns = footerConfig.columns;
  const mobileColumns = footerConfig.columns;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.2, once: true }}
      variants={footerVariants}
      className="relative border-t border-white/10 bg-[#050914] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.25), transparent 50%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.25), transparent 45%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr,1fr,1fr,1.2fr]">
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl font-semibold"
                style={{
                  WebkitTextFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["0%", "100%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                aria-label="Edge logo"
              >
                <span
                  style={{
                    backgroundImage: layoutColorPalette.accent.gradient,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {footerConfig.brand.logo}
                </span>
              </motion.span>
              <span className="text-sm uppercase tracking-[0.4em] text-cyan-200">
                {footerConfig.brand.tagline}
              </span>
            </div>
            <p className={cn("text-slate-300", layoutTypography.footer.brand)}>
              {footerConfig.brand.description}
            </p>
            <div className="flex gap-3">
              {footerConfig.social.map((social) => {
                const Icon = socialIcons[social.icon] ?? fallbackIcon;
                return (
                  <motion.a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl"
                    whileHover={{
                      scale: socialHover.scale,
                      rotate: socialHover.rotate,
                      boxShadow: socialHover.glow
                        ? layoutEffects.glow
                        : undefined,
                    }}
                    transition={{ duration: socialHover.duration }}
                  >
                    <Icon className="size-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {columns.slice(0, 2).map((column) => (
            <div key={column.title} className="hidden space-y-4 md:block">
              <p
                className={cn(
                  "text-xs uppercase tracking-[0.4em] text-slate-400",
                  layoutTypography.footer.columnTitle
                )}
              >
                {column.title}
              </p>
              <div className="flex flex-col gap-3">
                {column.links.map((link) => renderLink(link.label, link.href))}
              </div>
            </div>
          ))}

          {columns[2] && (
            <div className="hidden space-y-4 md:block">
              <p
                className={cn(
                  "text-xs uppercase tracking-[0.4em] text-slate-400",
                  layoutTypography.footer.columnTitle
                )}
              >
                {columns[2].title}
              </p>
              <div className="flex flex-col gap-3">
                {columns[2].links.map((link) =>
                  renderLink(link.label, link.href)
                )}
              </div>
              {footerConfig.newsletter.show && (
                <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-sm font-semibold text-white">
                    {footerConfig.newsletter.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {footerConfig.newsletter.description}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="email"
                      placeholder={footerConfig.newsletter.placeholder}
                      aria-label="Email address"
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                      {footerConfig.newsletter.buttonText}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-8 sm:col-span-2 md:hidden">
            <Accordion type="single" collapsible className="w-full">
              {mobileColumns.map((column, index) => (
                <AccordionItem key={column.title} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                    {column.title}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2">
                    {column.links.map((link) =>
                      renderLink(link.label, link.href)
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {footerConfig.newsletter.show && (
              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">
                  {footerConfig.newsletter.title}
                </p>
                <p className="text-xs text-slate-400">
                  {footerConfig.newsletter.description}
                </p>
                <Input
                  type="email"
                  placeholder={footerConfig.newsletter.placeholder}
                  aria-label="Email address"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  {footerConfig.newsletter.buttonText}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col items-start gap-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
            <p className={layoutTypography.footer.copyright}>
              {footerConfig.bottom.copyright}
            </p>
            <div className="flex flex-wrap gap-4">
              {footerConfig.bottom.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-xs text-slate-400 transition hover:text-cyan-200",
                    layoutTypography.footer.legal
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {footerConfig.bottom.badges
                .filter((badge) => badge.show)
                .map((badge) => (
                  <span
                    key={badge.text}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-cyan-100"
                  >
                    {badge.text}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
