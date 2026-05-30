"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Activity,
  Brain,
  UploadCloud,
  Droplets,
  HeartPulse,
  Pill,
  ChevronDown,
  Play,
  Bot,
  Check,
  Plus,
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import BrandTitle from "@/components/shared/BrandTitle";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "meds" | "hydration">("ai");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Statistics State
  const [stats, setStats] = useState({ users: 0, accuracy: 0, meds: 0, recovery: 0 });

  // Interactive Mockup State (Hydration)
  const [waterIntake, setWaterIntake] = useState(750); // ml
  const waterGoal = 2500; // ml

  // Interactive Mockup State (Medications)
  const [medsTaken, setMedsTaken] = useState<{ [key: string]: boolean }>({
    "Omega 3": true,
    "Vitamin D3": false,
    "L-Theanine": false,
  });

  // Interactive Mockup State (AI Chat)
  const [chatMessages, setChatMessages] = useState([
    { role: "user", text: "I've been feeling slightly fatigued after running this week. Heart rate is fine. Any tips?" },
    { role: "assistant", text: "Based on your clinical record upload from May 15th, your iron levels were on the lower end of optimal. Coupled with cardio fatigue, consider reviewing your dietary iron or consulting your doctor. Shall I analyze your workout recovery trends?" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const [promptText, setPromptText] = useState("");

  // Parallax Scroll Elements
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  // Handle Stats Count Up
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setStats({
        users: Math.floor((24500 / steps) * step),
        accuracy: Math.min(99.8, parseFloat(((99.8 / steps) * step).toFixed(1))),
        meds: Math.floor((12000000 / steps) * step),
        recovery: Math.floor((84 / steps) * step),
      });

      if (step >= steps) {
        setStats({ users: 24500, accuracy: 99.8, meds: 12000000, recovery: 84 });
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    const userMsg = { role: "user", text: promptText };
    setChatMessages((prev) => [...prev, userMsg]);
    setPromptText("");
    setAiTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I've flagged this in your Symptom Tracker. I suggest logging your sleep stats tonight, as your average recovery score has dropped 8% this week. I can set an early-bedtime reminder for you?"
        }
      ]);
      setAiTyping(false);
    }, 1500);
  };

  const faqs = [
    {
      q: "Is HealthBeast an accredited medical diagnostic tool?",
      a: "HealthBeast is an advanced AI health assistant and companion designed to monitor wellness, catalog symptoms, structure schedules, and organize files. It does not replace professional medical diagnosis, advice, or treatment.",
    },
    {
      q: "How does the clinical report scanner work?",
      a: "Our advanced client-side processing extracts text from PDFs or photos using highly-optimized OCR. The AI companion then reads the raw metrics to provide context, explanations of lab terms, and schedule insights.",
    },
    {
      q: "Is my personal healthcare data secure?",
      a: "Absolutely. Security is our absolute priority. All data remains encrypted, and clinical documents scanned locally inside the client are securely handled under strict privacy standards. We never sell your personal data.",
    },
    {
      q: "Does it sync with wearable devices?",
      a: "Yes! HealthBeast connects to Apple Health, Google Fit, and major smartwatches to pull heart-rate, hydration, sleep, and recovery metrics directly into your live dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden select-none">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-20%] size-[800px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] size-[800px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-10%] size-[800px] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[150px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-border/20 sticky top-0 bg-background/50 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="default" />
          <BrandTitle size="xl" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#showcase" className="hover:text-foreground transition-colors">Interactive Demo</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button className="rounded-xl shadow-lg shadow-primary/20 flex items-center gap-1.5 px-5 h-10 text-sm">
              Enter Dashboard <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <motion.div style={{ y: yBg, opacity: opacityHero }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 ring-1 ring-emerald-500/30"
          >
            <Activity className="size-3.5 animate-pulse" /> Live Next-Gen AI Health Ecosystem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-heading leading-tight max-w-5xl mx-auto text-foreground"
          >
            The AI Health Companion You{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-primary to-violet-600 bg-clip-text text-transparent">
              Actually Love.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-3xl mx-auto mt-6 leading-relaxed"
          >
            HealthBeast combines symptom tracking, clinical scan scans, smart hydration grids, and recovery analytics into one premium dashboard. Coined with a conversational AI built to unlock your best self.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href="/dashboard">
              <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/25 h-12 px-8 font-semibold flex items-center gap-2 text-sm bg-foreground text-background hover:bg-foreground/90">
                Get Started Free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#showcase">
              <Button size="lg" variant="outline" className="rounded-2xl border-border/40 hover:bg-muted/40 h-12 px-8 font-semibold flex items-center gap-2 text-sm">
                <Play className="size-3.5 fill-foreground text-foreground" /> Interactive Demo
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-border/30 bg-card/25 backdrop-blur-xl shadow-2xl p-4 overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
            <div className="flex gap-1.5 pl-2">
              <div className="size-3 rounded-full bg-rose-500/80" />
              <div className="size-3 rounded-full bg-amber-500/80" />
              <div className="size-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[11px] text-muted-foreground/60 font-mono bg-muted/30 px-3 py-1 rounded-md">
              dashboard.healthbeast.ai
            </div>
            <div className="w-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="md:col-span-2 p-6 rounded-2xl bg-muted/20 border border-border/20 relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-primary font-semibold">
                <Brain className="size-4" /> Real-time Companion
              </div>
              <h3 className="font-heading text-lg font-bold">AI Health Insights</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
                &quot;Your heart rate variability improved 12% following your hydration goal adjustments. We recommend standardizing your recovery hours.&quot;
              </p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold">Sleep Optimized</span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">HRV Up +12%</span>
                <span className="px-3 py-1.5 rounded-xl bg-violet-500/10 text-violet-500 text-xs font-semibold">Dose Logged</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-muted/20 border border-border/20 flex flex-col justify-between">
              <div>
                <span className="text-muted-foreground text-xs font-semibold block uppercase tracking-wider">Recovery Score</span>
                <div className="text-5xl font-black font-heading text-foreground mt-2">84%</div>
                <p className="text-xs text-muted-foreground/80 mt-2">Your peak readiness. Muscles have rested efficiently for aerobic capacity.</p>
              </div>
              <div className="w-full bg-muted h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-primary h-full rounded-full w-[84%]" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-border/20 bg-muted/20 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              {stats.users.toLocaleString()}+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Active Beasts</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              {stats.accuracy}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">AI Recommendation Match</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              {(stats.meds / 1000000).toFixed(1)}M+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Medications Tracked</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              {stats.recovery}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Avg Recovery Improvement</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10 scroll-mt-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase block">Engineered For Longevity</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading mt-3">All Vitals. One Seamless Platform.</h2>
          <p className="text-muted-foreground/80 mt-4">No more jumping between medical logs, water reminders, and symptom apps. Everything coordinates beautifully.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Symptom Scan */}
          <div className="p-8 rounded-3xl border border-border/30 bg-card/20 backdrop-blur-md hover:border-primary/30 transition-all group">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform">
              <Brain className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-heading">AI Symptom Assistant</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              Describe symptoms naturally. Our AI assesses trends, analyzes severity levels, and tracks symptoms in your secure calendar.
            </p>
          </div>

          {/* Card 2: OCR Scanner */}
          <div className="p-8 rounded-3xl border border-border/30 bg-card/20 backdrop-blur-md hover:border-emerald-500/30 transition-all group">
            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-105 transition-transform">
              <UploadCloud className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-heading">Prescription & Report OCR</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              Drag-and-drop clinical reports or medication PDFs. Instantly extracts terms, units, and structures automated hydration or dose schedules.
            </p>
          </div>

          {/* Card 3: Wearable Sync */}
          <div className="p-8 rounded-3xl border border-border/30 bg-card/20 backdrop-blur-md hover:border-violet-600/30 transition-all group">
            <div className="size-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 mb-6 group-hover:scale-105 transition-transform">
              <HeartPulse className="size-6" />
            </div>
            <h3 className="text-xl font-bold font-heading">Recovery Vitals Sync</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              Combines hydration metrics, sleep scores, and training load to establish a unified health read and proactive notification warnings.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section id="showcase" className="py-20 bg-muted/10 border-y border-border/20 relative z-10 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold font-heading">Experience The Interface</h2>
            <p className="text-muted-foreground mt-4">Play with real widgets directly below to see how our micro-animations react live.</p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex justify-center gap-3 border-b border-border/20 pb-4 mb-8">
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                activeTab === "ai"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <Bot className="size-4" /> AI Companion
            </button>
            <button
              onClick={() => setActiveTab("meds")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                activeTab === "meds"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <Pill className="size-4" /> Medication Scheduling
            </button>
            <button
              onClick={() => setActiveTab("hydration")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                activeTab === "hydration"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <Droplets className="size-4" /> Hydration Progress
            </button>
          </div>

          {/* Interactive Showcase Card Panel */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-border/30 bg-card/45 backdrop-blur-xl shadow-2xl p-6 md:p-8 min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-border/30">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white">
                          <Sparkles className="size-3.5" />
                        </div>
                        <span className="font-heading font-semibold text-sm">HealthBeast AI Companion</span>
                      </div>
                      <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                        <span className="size-2 rounded-full bg-emerald-500 animate-ping" /> Online
                      </span>
                    </div>

                    {/* Chat dialog messages */}
                    <div className="space-y-4 my-6 max-h-56 overflow-y-auto pr-2">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start gap-3",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          {msg.role !== "user" && (
                            <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Sparkles className="size-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "p-3.5 rounded-2xl text-xs max-w-md leading-relaxed",
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted/40 border border-border/20 text-muted-foreground dark:text-foreground rounded-tl-none"
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {aiTyping && (
                        <div className="flex items-center gap-1.5 pl-10 text-muted-foreground/60 text-xs">
                          <span className="size-1 bg-muted-foreground/50 rounded-full animate-bounce" />
                          <span className="size-1 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="size-1 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendPrompt} className="flex gap-2">
                    <input
                      type="text"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Type a clinical question or symptom..."
                      className="flex-1 rounded-xl bg-muted/40 border border-border/40 px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/45"
                    />
                    <Button type="submit" size="sm" className="rounded-xl px-4 text-xs h-9">
                      Send
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeTab === "meds" && (
                <motion.div
                  key="meds"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-border/30 mb-6">
                    <span className="font-heading font-semibold text-sm">Today&apos;s Schedule</span>
                    <span className="text-xs text-muted-foreground">
                      {Object.values(medsTaken).filter(Boolean).length} of 3 taken
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.keys(medsTaken).map((name) => (
                      <div
                        key={name}
                        onClick={() =>
                          setMedsTaken((prev) => ({ ...prev, [name]: !prev[name] }))
                        }
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                          medsTaken[name]
                            ? "bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10"
                            : "bg-muted/20 border-border/20 hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-9 rounded-xl flex items-center justify-center",
                              medsTaken[name] ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Pill className="size-4.5" />
                          </div>
                          <div>
                            <span className={cn("text-xs font-semibold block", medsTaken[name] && "line-through text-muted-foreground/60")}>
                              {name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {name === "Omega 3" ? "1000mg • Post-Breakfast" : name === "Vitamin D3" ? "5000 IU • 1x Daily" : "200mg • 30m Before Sleep"}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Checkbox */}
                        <div
                          className={cn(
                            "size-6 rounded-full flex items-center justify-center transition-colors border",
                            medsTaken[name]
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-border/60 hover:bg-muted"
                          )}
                        >
                          {medsTaken[name] && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "hydration" && (
                <motion.div
                  key="hydration"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col md:flex-row gap-8 items-center justify-between"
                >
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h3 className="font-heading text-lg font-bold">Smart Hydration Engine</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                      Interactive tracker monitoring intake progress. Click below to add 250ml water and watch the fluid level animate live!
                    </p>
                    <div className="text-3xl font-extrabold font-heading text-foreground mt-4">
                      {waterIntake} <span className="text-sm font-semibold text-muted-foreground">/ {waterGoal} ml</span>
                    </div>

                    <div className="flex justify-center md:justify-start gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setWaterIntake((prev) => Math.min(waterGoal, prev + 250))}
                        className="rounded-xl flex items-center gap-1.5 text-xs h-9 px-4"
                        disabled={waterIntake >= waterGoal}
                      >
                        <Plus className="size-4" /> Add 250ml
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setWaterIntake(0)}
                        className="rounded-xl border-border/40 text-xs h-9 px-4"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Animated Water Cup Mockup */}
                  <div className="w-48 h-64 rounded-2xl bg-card border border-border/40 p-4 relative overflow-hidden flex flex-col justify-end shadow-inner">
                    {/* Glowing glass boundary */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 z-0" />

                    {/* Water Level Animating */}
                    <motion.div
                      animate={{ height: `${(waterIntake / waterGoal) * 100}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 15 }}
                      className="w-full bg-gradient-to-t from-primary/80 to-sky-400/80 rounded-b-xl relative z-10 shadow-lg shadow-primary/30"
                    >
                      {/* Animated wave bubble details */}
                      <span className="absolute inset-x-0 top-0 h-[2px] bg-white/40 block animate-pulse" />
                    </motion.div>

                    <div className="absolute inset-0 flex flex-col justify-center items-center z-20 font-mono text-[10px] text-muted-foreground/80">
                      <div>{Math.round((waterIntake / waterGoal) * 100)}% Goal</div>
                      <div className="mt-1 font-semibold text-foreground">{waterGoal - waterIntake} ml Left</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 relative z-10 scroll-mt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold font-heading">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-4">Have questions about clinical scans or device sync? We&apos;ve got answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border/30 bg-card/20 backdrop-blur-md rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-foreground focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    openFaq === index && "rotate-180 text-primary"
                  )}
                />
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/10">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        <div className="rounded-3xl bg-gradient-to-br from-card/85 to-card/50 border border-border/40 p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle Background Glows */}
          <div className="absolute top-[-20%] left-[-20%] size-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-20%] size-[300px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-bold font-heading max-w-2xl mx-auto text-foreground leading-tight">
            Unlock Your Peak Potential Today.
          </h2>
          <p className="text-muted-foreground/80 max-w-lg mx-auto text-sm mt-4 leading-relaxed">
            Unite symptom assessment, daily vitals, and actionable clinical scan scanners in one beautifully animated health suite.
          </p>

          <div className="mt-8 flex justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/20 h-12 px-8 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-2">
                Enter App Dashboard <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center border-t border-border/20 pt-8 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} HealthBeast AI platform. Built for longevity.</div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-foreground">App</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#showcase" className="hover:text-foreground">Demo</a>
          </div>
        </footer>
      </section>
    </div>
  );
}