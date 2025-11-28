"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  ArrowUpRight,
  Command,
  Github,
  Menu,
  Rocket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  headerConfig,
  layoutAnimations,
  layoutColorPalette,
  layoutSpacing,
  layoutTypography,
} from "@/lib/header-footer-config";
import { cn } from "@/lib/utils";

const SolidDot = ({ className }: { className?: string }) => (
  <span
    className={cn("inline-block size-2 rounded-full", className)}
    aria-hidden="true"
  />
);

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState(
    headerConfig.navigation[0]?.href ?? "#"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hashNavigation = useMemo(
    () =>
      headerConfig.navigation
        .map((item) => (item.href.startsWith("#") ? item.href.slice(1) : null))
        .filter((item): item is string => Boolean(item)),
    []
  );
  const primaryAction = useMemo(
    () => headerConfig.actions.find((action) => action.type === "primary"),
    []
  );

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!headerConfig.behavior.sticky) return;
    setIsScrolled(latest > headerConfig.behavior.scrollThreshold);
  });

  useEffect(() => {
    if (!hashNavigation.length) return;
    const sections = hashNavigation
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [hashNavigation]);

  const handleNavClick = (href: string) => {
    if (!href.startsWith("#")) {
      setActiveHref(href);
      return;
    }

    const target = document.getElementById(href.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", href);
      }
    }

    setActiveHref(href);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const accentGradient = layoutColorPalette.accent.gradient;
  const scrollAnimation = layoutAnimations.header.scroll;

  const baseHeaderClass =
    "fixed inset-x-0 top-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-8";
  const glassClass =
    "rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";

  const borderOpacity = isScrolled
    ? scrollAnimation.borderOpacity.to
    : scrollAnimation.borderOpacity.from;
  const backgroundOpacity = isScrolled
    ? scrollAnimation.backgroundOpacity.to
    : scrollAnimation.backgroundOpacity.from;
  const blurValue = isScrolled
    ? scrollAnimation.blur.to
    : scrollAnimation.blur.from;

  const status = headerConfig.status;

  const renderActionButton = (
    action: (typeof headerConfig.actions)[number]
  ) => {
    const isPrimary = action.type === "primary";
    return (
      <Button
        key={action.label}
        asChild
        variant={isPrimary ? "default" : "outline"}
        className={cn(
          "text-sm font-semibold transition hover:translate-y-[-1px]",
          isPrimary
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_20px_40px_rgba(6,182,212,0.35)]"
            : "border-cyan-300/40 text-cyan-200 hover:bg-cyan-400/10"
        )}
      >
        <Link
          href={action.href}
          className="flex items-center gap-1.5"
          aria-label={action.label}
        >
          <span>{action.label}</span>
          {isPrimary && <ArrowUpRight className="size-4" aria-hidden="true" />}
        </Link>
      </Button>
    );
  };

  return (
    <>
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full">
        <div
          className="h-full w-full animate-pulse"
          style={{ backgroundImage: accentGradient }}
          aria-hidden="true"
        />
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-cyan-500/20 via-[#050914]/40 to-transparent"
        aria-hidden="true"
      />
      <header className={baseHeaderClass}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 shadow-[0_10px_45px_rgba(14,165,233,0.15)] backdrop-blur-2xl sm:flex"
          >
            <div className="flex items-center gap-2 font-semibold text-white">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-cyan-200">
                <Sparkles
                  className="size-3.5 text-cyan-200"
                  aria-hidden="true"
                />
                New
              </div>
              Edge CLI v3.2 just shipped with zero-downtime rollbacks.
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500/90 to-blue-500/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:scale-[1.02]"
            >
              View changelog
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div
            className={cn(
              "relative flex w-full flex-wrap items-center gap-3 rounded-[28px] sm:flex-nowrap sm:gap-4",
              glassClass
            )}
            style={{
              padding: `${layoutSpacing.header.padding.y} ${layoutSpacing.header.padding.x}`,
              borderColor: `rgba(255,255,255,${borderOpacity})`,
              backgroundColor: `rgba(5,9,20,${backgroundOpacity})`,
              backdropFilter: headerConfig.behavior.blurOnScroll
                ? `blur(${blurValue})`
                : undefined,
            }}
            aria-label="Primary navigation"
          >
            <Link
              href="/"
              className={cn(
                "flex flex-1 items-center gap-2 text-white transition hover:text-cyan-200 md:flex-none",
                layoutTypography.header.logo
              )}
            >
              <span
                className="rounded-2xl px-2 py-1 text-base font-semibold text-white"
                style={{
                  backgroundImage: accentGradient,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {headerConfig.logo.text}
              </span>
              <Rocket className="size-5 text-cyan-300" aria-hidden="true" />
            </Link>

            <nav className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-slate-200">
                {headerConfig.navigation.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      className={cn(
                        "relative rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none",
                        layoutTypography.header.navigation,
                        isActive
                          ? "text-white"
                          : "text-slate-300 hover:text-white"
                      )}
                      onClick={() => handleNavClick(item.href)}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="active-nav-pill"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-[0_10px_40px_rgba(6,182,212,0.35)]"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 38,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="ml-auto hidden items-center gap-3 md:flex">
              {status.show && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  <SolidDot className="bg-emerald-400" />
                  {status.text}
                </div>
              )}
              <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] text-slate-200 xl:flex">
                <Command
                  className="size-3.5 text-cyan-200"
                  aria-hidden="true"
                />
                Press ⌘K
              </div>
              {headerConfig.actions.map(renderActionButton)}
              <Button
                asChild
                variant="outline"
                size="icon"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                aria-label="View GitHub repository"
              >
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
              {status.show && (
                <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-2 py-1 text-[11px] text-emerald-300 sm:flex">
                  <SolidDot className="bg-emerald-400" />
                  {status.text}
                </div>
              )}
              {primaryAction && (
                <Button
                  asChild
                  size="sm"
                  className="flex-1 min-w-0 justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.3)] sm:flex-none"
                >
                  <Link
                    href={primaryAction.href}
                    aria-label={primaryAction.label}
                  >
                    {primaryAction.label}
                    <ArrowUpRight
                      className="ml-1 size-3.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              )}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side={headerConfig.mobile.menuPosition}
                  className="border-white/10 bg-[#050914]/95 text-white backdrop-blur-2xl"
                >
                  <SheetHeader>
                    <div className="flex items-center gap-2">
                      <Rocket className="size-5 text-cyan-300" />
                      <p className="text-base font-semibold">
                        {headerConfig.logo.text}
                      </p>
                    </div>
                  </SheetHeader>
                  <div className="mt-8 flex flex-col gap-4">
                    {headerConfig.navigation.map((item) => {
                      const isActive = activeHref === item.href;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          className={cn(
                            "rounded-2xl border border-white/10 px-4 py-3 text-left text-lg transition hover:border-white/20",
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-slate-200"
                          )}
                          onClick={() => handleNavClick(item.href)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                    {headerConfig.actions.map((action) => (
                      <Button
                        key={action.label}
                        asChild
                        className={cn(
                          action.type === "primary"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                            : "border-cyan-300/40 text-cyan-200 hover:bg-cyan-400/10"
                        )}
                      >
                        <Link href={action.href}>{action.label}</Link>
                      </Button>
                    ))}
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Github className="mr-2 size-4" />
                        GitHub
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>
        </div>
      </header>
    </>
  );
}
