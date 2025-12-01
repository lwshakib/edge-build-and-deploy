"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Variants } from "framer-motion";
import {
  animate,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  GitBranch,
  Globe,
  Lock,
  PenTool,
  Rocket,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type FeatureCardConfig = {
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

type StepConfig = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type StatMetric = {
  value: string;
  label: string;
  icon: LucideIcon;
};

type PricingTier = {
  name: string;
  price: string;
  features: string[];
  description: string;
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

const heroHeadline = "Deploy React & HTML Apps in Seconds";
const heroSubheadline =
  "Zero config, instant previews, global CDN. The fastest way from code to production.";
const primaryCtaLabel = "Start Deploying Free";
const secondaryCtaLabel = "View Live Demo";
const heroBadges = ["React", "Next.js", "HTML5", "Vite"];

const featureDetailMap: Record<string, string> = {
  "Lightning Fast Deploys":
    "Edge caching + streaming compilation ship every commit in ~27s.",
  "Zero Configuration":
    "Auto-detects frameworks, build tools, and env vars from your repo.",
  "Global CDN": "200+ edge locations with smart routing keep latency low.",
  "Free SSL & Domains":
    "Automatic HTTPS with managed certificates on every project.",
  "Preview Environments":
    "Spin up shareable URLs for each PR with isolated data + logs.",
  "Real-time Analytics":
    "Monitor performance, cold starts, and traffic spikes live.",
};

const fallbackFeatures: FeatureCardConfig[] = [
  {
    title: "Instant Deployments",
    description: "Git push to live URLs in under 30 seconds.",
    detail: featureDetailMap["Lightning Fast Deploys"],
    icon: Zap,
  },
  {
    title: "Zero Configuration",
    description: "We auto-detect framework, build, and routing settings.",
    detail: featureDetailMap["Zero Configuration"],
    icon: Settings,
  },
  {
    title: "Global CDN",
    description: "Edge network across 200+ locations worldwide.",
    detail: featureDetailMap["Global CDN"],
    icon: Globe,
  },
  {
    title: "Custom Domains",
    description: "Free SSL and automatic renewals on every domain.",
    detail: featureDetailMap["Free SSL & Domains"],
    icon: Lock,
  },
  {
    title: "Preview Environments",
    description: "Give every PR its own live sandbox URL.",
    detail: featureDetailMap["Preview Environments"],
    icon: GitBranch,
  },
  {
    title: "Real-time Analytics",
    description: "See performance, errors, and traffic instantly.",
    detail: featureDetailMap["Real-time Analytics"],
    icon: BarChart3,
  },
];

const featureCards = fallbackFeatures;
const fallbackSteps: StepConfig[] = [
  {
    number: "01",
    title: "Connect repository",
    description: "Link GitHub, GitLab, or Bitbucket in seconds.",
    icon: GitBranch,
  },
  {
    number: "02",
    title: "Auto-configure builds",
    description: "Edge reads your package scripts and optimizes settings.",
    icon: Settings,
  },
  {
    number: "03",
    title: "Deploy & share",
    description: "Instant preview + production URLs with global caching.",
    icon: Rocket,
  },
];

const steps = fallbackSteps;
const fallbackStats: StatMetric[] = [
  { value: "10M+", label: "Deployments", icon: Rocket },
  { value: "50K+", label: "Developers", icon: Users },
  { value: "99.99%", label: "Uptime", icon: Shield },
  { value: "<30s", label: "Deploy Time", icon: Zap },
];

const stats: StatMetric[] = fallbackStats;

const fallbackPricing: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for side projects and prototypes.",
    features: [
      "100 deployments / month",
      "Basic analytics",
      "Community support",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$20",
    description: "Unlimited deploys for indie hackers & startups.",
    features: [
      "Unlimited deployments",
      "Advanced analytics",
      "Priority support",
      "Custom domains",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Team",
    price: "$50",
    description: "Scale with teams, SSO, and dedicated support.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "SSO",
      "Dedicated manager",
    ],
    cta: "Contact Sales",
  },
];

const pricingTiers = fallbackPricing;

const techLogos = ["React", "Next.js", "Vite", "Vue", "HTML5"];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const particles = Array.from({ length: 12 });

const terminalScript = [
  "$ edge login --github",
  "› Linked @studio-labs",
  "$ edge deploy --project edge-platform",
  "• Detecting framework… Next.js 14",
  "• Building optimized bundle",
  "• Distributing to 200+ edge locations",
  "✔ Done in 27.4s  —  https://edge.sh/edge-platform",
];

const FinalCtaTrust = [
  "No credit card required",
  "Free SSL included",
  "Cancel anytime",
];

const docsHighlights = [
  {
    title: "Edge Platform Docs",
    description:
      "Framework presets, routing rules, and CLI examples in one place.",
    icon: BookOpen,
    linkLabel: "Explore docs",
  },
  {
    title: "Deploy API Cookbook",
    description:
      "Copy‑paste snippets for Slack deploy hooks and audit logging.",
    icon: Code2,
    linkLabel: "View API reference",
  },
];

const blogHighlights = [
  {
    title: "How we ship every commit in 27 seconds",
    summary: "An inside look at streaming compilation and edge caching.",
    tag: "Engineering",
    readTime: "5 min read",
  },
  {
    title: "Designing delightful deploy previews",
    summary: "Why product teams adopted Edge for collaborative reviews.",
    tag: "Product",
    readTime: "4 min read",
  },
  {
    title: "From prototype to planet-scale",
    summary: "Lessons learned migrating 50K developers to the edge.",
    tag: "Community",
    readTime: "6 min read",
  },
];

const accentGradient = "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)";
const pageBackground = "#0A0E1A";

const containerClass = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">
      {eyebrow}
    </p>
    <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
      {title}
    </h2>
    <p className="mt-4 text-base text-slate-300">{description}</p>
  </div>
);

const HeroTerminal = ({ gradient }: { gradient: string }) => {
  const [output, setOutput] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;
    const script = `${terminalScript.join("\n")}\n`;

    const type = () => {
      let index = 0;
      interval = setInterval(() => {
        index += 1;
        setOutput(script.slice(0, index));
        setProgressValue(Math.min(100, (index / script.length) * 100));

        if (index >= script.length) {
          clearInterval(interval);
          timeout = setTimeout(() => {
            setOutput("");
            setProgressValue(0);
            type();
          }, 1600);
        }
      }, 30);
    };

    type();
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl"
      aria-label="Animated deployment terminal"
    >
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-auto text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
          LIVE DEPLOY
        </span>
      </div>
      <pre className="mt-5 min-h-[220px] whitespace-pre-wrap font-mono text-sm leading-relaxed text-sky-100">
        {output || terminalScript[0]}
        <span className="ml-1 animate-pulse text-sky-300">▮</span>
      </pre>
      <div className="mt-4">
        <Progress value={progressValue} className="h-2 bg-slate-800" />
        <span className="sr-only">Deployment progress</span>
      </div>
      <div
        className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200"
        style={{ backgroundImage: gradient }}
      >
        <span className="font-semibold uppercase tracking-[0.4em] text-cyan-100">
          edge deploy
        </span>
        <span>Streaming build logs · Global CDN</span>
      </div>
    </motion.div>
  );
};

const StatCounter = ({
  value,
  suffix,
  decimals = 0,
  active,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  active: boolean;
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = latest.toFixed(decimals);
        }
      },
    });

    return () => controls.stop();
  }, [active, value, decimals]);

  return (
    <span className="text-4xl font-semibold text-white">
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
};

const StatCard = ({ stat }: { stat: StatMetric }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.4 });
  const numeric = parseFloat(stat.value.replace(/[^\d.]/g, "")) || 0;
  const decimals = stat.value.includes(".")
    ? stat.value.split(".")[1].length
    : 0;
  const suffix = stat.value.replace(/[\d.]/g, "");

  return (
    <motion.div
      ref={cardRef}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      <stat.icon className="size-10 text-cyan-300" />
      <StatCounter
        value={numeric}
        suffix={suffix}
        decimals={decimals}
        active={inView}
      />
      <p className="text-sm text-slate-300">{stat.label}</p>
    </motion.div>
  );
};

const TechMarquee = ({ logos }: { logos: string[] }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-4">
    <motion.div
      className="flex gap-10 text-sm uppercase tracking-[0.4em] text-cyan-200"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
    >
      {[...logos, ...logos].map((logo, index) => (
        <span key={`${logo}-${index}`}>{logo}</span>
      ))}
    </motion.div>
  </div>
);

export default function Page() {
  const router = useRouter();
  const { user, isSignedIn, isLoading } = useAuth();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    restDelta: 0.001,
  });

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallax = useTransform(heroScroll, [0, 1], ["0%", "25%"]);

  const [liveDeploys, setLiveDeploys] = useState(128);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDeploys((prev) => prev + Math.floor(Math.random() * 4));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Handle CTA button clicks
  const handleGetStarted = () => {
    if (isLoading) return;
    
    if (isSignedIn && user?.slug) {
      router.push(`/${user.slug}`);
    } else {
      router.push("/auth");
    }
  };

  return (
    <>
      <SiteHeader />
      <main
        className="min-h-screen text-white"
        style={{ backgroundColor: pageBackground }}
      >
        <motion.div
          className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300"
          style={{ scaleX: progressSpring }}
          aria-hidden="true"
        />

        <section
          ref={heroRef}
          className="relative min-h-[900px] overflow-hidden pb-40 pt-48"
          style={{ background: pageBackground }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(14,165,233,.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(59,130,246,.35), transparent 40%)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              y: heroParallax,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {particles.map((_, index) => (
            <motion.span
              key={`particle-${index}`}
              className="pointer-events-none absolute size-1 rounded-full bg-cyan-300/50"
              animate={{ y: ["0%", "-40%"], opacity: [0, 1, 0] }}
              transition={{
                duration: 10 + index,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "linear",
              }}
              style={{
                left: `${(index * 83) % 100}%`,
                bottom: `${(index * 37) % 100}%`,
              }}
            />
          ))}

          <div className={cn(containerClass, "relative z-10")}>
            <div className="flex flex-col gap-12 lg:flex-row">
              <div className="max-w-2xl space-y-8">
                <Badge className="bg-white/10 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">
                  Deploy in Seconds, Scale to Millions
                </Badge>
                <div>
                  <motion.h1
                    className="text-4xl font-semibold leading-tight text-white md:text-6xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {heroHeadline}
                  </motion.h1>
                  <motion.p
                    className="mt-6 text-lg text-slate-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                  >
                    {heroSubheadline}
                  </motion.p>
                </div>
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_20px_60px_rgba(14,165,233,0.3)]"
                    onClick={handleGetStarted}
                  >
                    {primaryCtaLabel}
                    <ArrowUpRight className="size-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cyan-400/40 bg-transparent text-cyan-200 hover:bg-cyan-400/10"
                    onClick={handleGetStarted}
                  >
                    {secondaryCtaLabel}
                  </Button>
                </motion.div>
                <motion.div
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                    deploy command
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-sm text-slate-100">
                    <span className="rounded-md bg-black/60 px-3 py-1 text-cyan-200">
                      edge deploy --project edge-app
                    </span>
                    <span className="text-slate-400">
                      Builds, tests, and ships in under 30s
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Auto SSL
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Preview URLs
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Observability
                  </div>
                </motion.div>
                <div className="flex flex-wrap gap-3">
                  {heroBadges.map((badge, index) => (
                    <motion.span
                      key={badge}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3 + index * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              </div>
              <HeroTerminal gradient={accentGradient} />
            </div>
          </div>
        </section>

        <section id="features" className={cn("py-20", containerClass)}>
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything you need to ship from commit to CDN"
            description="Modern deployment tooling, zero waiting. Edge automates the boring parts so you can keep building."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  y: -6,
                  boxShadow: "0px 20px 60px rgba(14, 165, 233, 0.15)",
                }}
              >
                <feature.icon className="size-10 rounded-2xl bg-cyan-500/10 p-2 text-cyan-300" />
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {feature.description}
                </p>
                <p className="mt-4 text-sm text-cyan-200">{feature.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className={cn("py-20", containerClass)}>
          <SectionHeading
            eyebrow="How it works"
            title="Connect, configure, deploy — done."
            description="A streamlined, 3-step flow that mirrors the design brief: connect repo, auto-configure, ship globally."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-sm font-semibold text-cyan-200">
                  {step.number}
                </span>
                <step.icon className="mt-4 size-12 rounded-2xl bg-cyan-500/15 p-3 text-cyan-300" />
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className={cn("py-20", containerClass)}>
          <SectionHeading
            eyebrow="Social proof"
            title="Trusted by builders shipping millions of deployments"
            description="Live insight into what Edge is handling right now — the stats, uptime, and supported stacks pulled from design metadata."
          />
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-6 text-center shadow-2xl backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.4em] text-cyan-100">
                  live deployments
                </p>
                <p className="mt-3 text-5xl font-semibold text-white">
                  {liveDeploys}
                </p>
                <p className="text-sm text-slate-200">
                  Deployments shipped in the last 10 minutes
                </p>
              </div>
              <TechMarquee logos={techLogos} />
            </div>
          </div>
        </section>

        <section id="pricing" className={cn("py-20", containerClass)}>
          <SectionHeading
            eyebrow="Pricing"
            title="Start free, upgrade as you grow"
            description="Transparent tiers with everything from basic SSL to dedicated support."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative h-full border-white/10 bg-white/[0.04] text-white backdrop-blur-xl",
                  tier.highlighted &&
                    "border-cyan-400/60 bg-gradient-to-b from-cyan-500/20 to-blue-500/10 shadow-[0_20px_60px_rgba(14,165,233,0.2)]"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold">
                      {tier.name}
                    </CardTitle>
                    {tier.badge && (
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-slate-300">
                    {tier.description}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-semibold">{tier.price}</span>
                    <span className="text-slate-400"> / month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm text-slate-200">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.highlighted ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      tier.highlighted
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                        : "border-cyan-300/40 text-cyan-200 hover:bg-cyan-400/10"
                    )}
                    onClick={handleGetStarted}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-slate-400">
            Need volume pricing?{" "}
            <a
              href="#"
              className="text-cyan-300 underline-offset-4 hover:underline"
            >
              View full pricing
            </a>
          </div>
        </section>

        <section id="docs" className={cn("py-20", containerClass)}>
          <SectionHeading
            eyebrow="Docs"
            title="Guides, API, and CLI playbooks"
            description="Everything documented with runnable snippets so you can self-serve without leaving the terminal."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {docsHighlights.map((doc) => (
              <Card
                key={doc.title}
                className="h-full border-white/10 bg-white/[0.04] text-white backdrop-blur-xl"
              >
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                    <doc.icon className="size-5" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-slate-300">{doc.description}</p>
                  <Button
                    variant="ghost"
                    className="group inline-flex items-center gap-2 px-0 text-cyan-200 hover:text-white"
                  >
                    {doc.linkLabel}
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="blog" className={cn("py-20", containerClass)}>
          <SectionHeading
            eyebrow="Blog"
            title="Stories from the edge"
            description="What we're learning while helping teams ship faster."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogHighlights.map((post, index) => (
              <motion.article
                key={post.title}
                className="flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  <PenTool
                    className="size-4 text-cyan-300"
                    aria-hidden="true"
                  />
                  {post.tag}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300">{post.summary}</p>
                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-slate-400">
                  <span>{post.readTime}</span>
                  <Button
                    variant="ghost"
                    className="group flex items-center gap-1 px-0 text-cyan-200 hover:text-white"
                  >
                    Read story
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className={cn("pb-24 pt-16", containerClass)}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/60 to-black p-10 text-center shadow-2xl">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top, rgba(14,165,233,.35), transparent 55%)",
              }}
            />
            <div className="relative z-10 space-y-6">
              <Badge className="bg-white/10 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-100">
                Ready to build
              </Badge>
              <h2 className="text-4xl font-semibold">
                Ready to deploy faster?
              </h2>
              <p className="text-lg text-slate-300">
                Join 50,000+ developers shipping with Edge. No credit card
                required.
              </p>
              <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="you@company.dev"
                  aria-label="Email address"
                  className="bg-white/10 text-white placeholder:text-slate-500"
                />
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
                {FinalCtaTrust.map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
