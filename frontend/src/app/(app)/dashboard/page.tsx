"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Activity,
  Brain,
  ChevronRight,
  Plus,
  HeartPulse,
  UploadCloud,
  Check,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useHealthStore } from "@/store/health-store";

// Sample Analytics Data
const weeklyData = [
  { day: "Mon", recovery: 68, sleep: 75, water: 2000 },
  { day: "Tue", recovery: 74, sleep: 80, water: 2250 },
  { day: "Wed", recovery: 82, sleep: 85, water: 2500 },
  { day: "Thu", recovery: 70, sleep: 70, water: 1750 },
  { day: "Fri", recovery: 78, sleep: 82, water: 2100 },
  { day: "Sat", recovery: 88, sleep: 90, water: 2600 },
  { day: "Sun", recovery: 84, sleep: 85, water: 2400 },
];

export default function DashboardPage() {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );


  const {
    symptoms,
    addSymptom,
    medications: meds,
    toggleMedication,
    waterIntake,
    logWater,
    resetWater,
  } = useHealthStore();

  const [selectedSeverity, setSelectedSeverity] = useState<"Low" | "Medium" | "High">("Low");
  const [symptomText, setSymptomText] = useState("");

  // Calculate dynamic clinical water target
  const baseTarget = 2000;
  const symptomSurcharge = React.useMemo(() => {
    let sum = 0;
    symptoms.forEach((s) => {
      if (s.severity === "High") sum += 400;
      else if (s.severity === "Medium") sum += 200;
      else sum += 100;
    });
    return sum;
  }, [symptoms]);

  const medicationSurcharge = React.useMemo(() => {
    return meds.length * 150;
  }, [meds]);

  const waterGoal = baseTarget + symptomSurcharge + medicationSurcharge;

  const handleToggleMed = (id: string) => {
    toggleMedication(id);
  };

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;

    let dangerVal = 20;
    let recoveryVal = 80;
    if (selectedSeverity === "Medium") {
      dangerVal = 50;
      recoveryVal = 50;
    } else if (selectedSeverity === "High") {
      dangerVal = 90;
      recoveryVal = 20;
    }

    addSymptom({
      name: symptomText.trim(),
      severity: selectedSeverity,
      dangerValue: dangerVal,
      recoveryValue: recoveryVal,
    });
    setSymptomText("");
  };

  // Adherence Calculations
  const medsTakenCount = meds.filter((m) => m.taken).length;
  const medsProgress = meds.length > 0 ? Math.round((medsTakenCount / meds.length) * 100) : 0;

  // Framer Motion Grid Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none">
      {/* 1. Header Vitals Ribbon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight">
            Welcome back, Yashwanth
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vitals are optimal. You are in your peak recovery phase today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border/40 text-xs font-semibold shadow-xs">
          <Activity className="size-4 text-emerald-500 animate-pulse" />
          <span>HRV Status: </span>
          <span className="text-emerald-500 font-bold">78 ms (Optimal)</span>
        </div>
      </div>

      {/* 2. Grid Dashboard Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Widget A: Recovery Score Card */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-border/40 bg-card/45 backdrop-blur-md shadow-xs hover:border-primary/30 transition-all flex flex-col justify-between p-6">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Vitals Readiness
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black font-heading tracking-tight">84%</span>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5">
                  <Zap className="size-3" /> Excellent
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Sleep quality and metabolic heart rate are aligned. Aerobic capacity is ready for moderate/high workouts.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-border/20 mt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Sleep Index</span>
                <span className="font-semibold">88%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Resting HR</span>
                <span className="font-semibold">54 bpm</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
                <div className="bg-gradient-to-r from-emerald-500 to-primary h-full rounded-full w-[84%]" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Widget B: Medications Checklist */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-border/40 bg-card/45 backdrop-blur-md shadow-xs hover:border-primary/30 transition-all p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-border/20 mb-4">
                <div>
                  <h3 className="font-bold text-sm font-heading">Medications</h3>
                  <p className="text-[10px] text-muted-foreground">Today&apos;s active dosage schedule</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-primary/10 text-primary">
                  {medsProgress}% Done
                </span>
              </div>

              <div className="space-y-3">
                {meds.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => handleToggleMed(med.id)}
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between",
                      med.taken
                        ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10"
                        : "bg-muted/10 border-border/20 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center text-xs",
                          med.taken ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Pill className="size-4" />
                      </div>
                      <div>
                        <span className={cn("text-xs font-semibold block", med.taken && "line-through text-muted-foreground/60")}>
                          {med.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{med.dosage} • {med.time}</span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "size-5 rounded-full flex items-center justify-center border transition-colors",
                        med.taken ? "bg-emerald-500 border-emerald-500 text-white" : "border-border/60"
                      )}
                    >
                      {med.taken && <Check className="size-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full mt-4">
              <Progress value={medsProgress} className="h-1.5 bg-muted" />
            </div>
          </Card>
        </motion.div>

        {/* Widget C: Live Hydration Beaker */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-border/40 bg-card/45 backdrop-blur-md shadow-xs hover:border-primary/30 transition-all p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-sm font-heading">Hydration Intake</h3>
                <p className="text-[10px] text-muted-foreground">Daily objective: {waterGoal} ml</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-heading">{waterIntake}</span>
                <span className="text-[10px] text-muted-foreground"> / {waterGoal} ml</span>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              {/* Cup container */}
              <div className="w-20 h-28 rounded-xl bg-muted/30 border border-border/40 p-1 relative overflow-hidden flex flex-col justify-end">
                <motion.div
                  animate={{ height: `${(waterIntake / waterGoal) * 100}%` }}
                  transition={{ type: "spring" as const, stiffness: 80, damping: 15 }}
                  className="w-full bg-gradient-to-t from-primary/70 to-sky-400/80 rounded-b-lg relative shadow-lg"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/80 font-mono">
                  {Math.round((waterIntake / waterGoal) * 100)}%
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <Button
                  size="sm"
                  onClick={() => logWater(250)}
                  disabled={waterIntake >= waterGoal}
                  className="w-full rounded-xl text-xs flex items-center justify-center gap-1.5 h-9"
                >
                  <Plus className="size-3.5" /> Log 250 ml
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetWater}
                  className="w-full rounded-xl text-xs h-9 border-border/40"
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Widget D: AI Insights Carousel */}
        <motion.div variants={cardVariants} className="md:col-span-1">
          <Card className="h-full border-border/40 bg-gradient-to-br from-card/45 to-primary/5 backdrop-blur-md shadow-xs p-6 hover:border-primary/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Brain className="size-4" /> AI Companion Insight
              </div>
              <h4 className="font-bold text-sm mt-3 font-heading leading-tight">Sleep & Hydration Correlation</h4>
              <p className="text-xs text-muted-foreground/80 leading-relaxed mt-2">
                &quot;We detected your heart rate variability (HRV) is 12% lower on days you intake less than 2000 ml water. Hydrating earlier in the morning supports circadian thermal drop.&quot;
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/20 mt-4 text-[10px] text-muted-foreground">
              <span>Updated 2 hours ago</span>
              <span className="flex items-center gap-1 text-primary font-bold">
                Read metrics <ChevronRight className="size-3" />
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Widget E: Recharts Weekly Analytics Vitals AreaChart */}
        <motion.div variants={cardVariants} className="md:col-span-2">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md shadow-xs p-6 hover:border-primary/30 transition-all">
            <div className="flex justify-between items-center pb-4 border-b border-border/20 mb-4">
              <div>
                <h3 className="font-bold text-sm font-heading flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-primary" /> Vitals & Recovery Trends
                </h3>
                <p className="text-[10px] text-muted-foreground">Weekly tracking of readiness vs sleep index</p>
              </div>
              <div className="flex gap-4 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> Recovery Readiness</span>
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Sleep Index</span>
              </div>
            </div>

            <div className="h-52 w-full mt-2">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-[10px] fill-muted-foreground" />
                    <YAxis tickLine={false} axisLine={false} className="text-[10px] fill-muted-foreground" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        fontSize: "11px",
                        backdropFilter: "blur(8px)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="recovery"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRec)"
                    />
                    <Area
                      type="monotone"
                      dataKey="sleep"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSleep)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Widget F: Symptom fast logger */}
        <motion.div variants={cardVariants} className="md:col-span-1">
          <Card className="h-full border-border/40 bg-card/45 backdrop-blur-md shadow-xs p-6 hover:border-primary/30 transition-all flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm font-heading mb-3 flex items-center gap-1.5">
                <HeartPulse className="size-4.5 text-rose-500 animate-pulse" /> Fast Symptom Logger
              </h3>

              <form onSubmit={handleAddSymptom} className="space-y-3">
                <input
                  type="text"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder="Describe (e.g., Fatigue, Soreness)..."
                  className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/45"
                />

                <div className="flex gap-2 text-[10px] font-semibold">
                  {(["Low", "Medium", "High"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSelectedSeverity(sev)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-center transition-colors",
                        selectedSeverity === sev
                          ? sev === "Low"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                            : sev === "Medium"
                            ? "bg-amber-500/10 border-amber-500 text-amber-500"
                            : "bg-rose-500/10 border-rose-500 text-rose-500"
                          : "border-border/20 bg-muted/10 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <Button type="submit" size="sm" className="w-full rounded-xl text-xs h-9">
                  Add Symptom Log
                </Button>
              </form>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-border/20 max-h-24 overflow-y-auto pr-1">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex justify-between items-center text-[10px] p-2 rounded-lg bg-muted/30">
                  <span className="font-semibold text-foreground">{symptom.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-md font-bold uppercase",
                        symptom.severity === "Low"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : symptom.severity === "Medium"
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-rose-500/15 text-rose-500"
                      )}
                    >
                      {symptom.severity}
                    </span>
                    <span className="text-muted-foreground/60">{symptom.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Widget G: Recent clinical reports OCR */}
        <motion.div variants={cardVariants} className="md:col-span-2">
          <Card className="h-full border-border/40 bg-card/45 backdrop-blur-md shadow-xs p-6 hover:border-primary/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-border/20 mb-4">
                <div>
                  <h3 className="font-bold text-sm font-heading flex items-center gap-1.5">
                    <UploadCloud className="size-4 text-emerald-500" /> Recent Lab Reports OCR
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Clinical PDFs processed locally in-browser</p>
                </div>
                <span className="text-[10px] text-muted-foreground">2 files uploaded</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mock Files */}
                <div className="p-3.5 rounded-2xl border border-border/20 bg-muted/10 hover:bg-muted/30 transition-colors flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold font-mono">
                      PDF
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-foreground">BloodWork_May.pdf</span>
                      <span className="text-[9px] text-muted-foreground">3.2 MB • Scanned May 15</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    Analyzed
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-border/20 bg-muted/10 hover:bg-muted/30 transition-colors flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                      PNG
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-foreground">ThyroidScan.png</span>
                      <span className="text-[9px] text-muted-foreground">1.8 MB • Scanned May 24</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    Analyzed
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="mt-6 p-4 rounded-xl border border-dashed border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-muted/5">
              <div>
                <span className="text-xs font-bold text-foreground block">Upload prescription or scan</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Supports PDF, PNG, JPG up to 10MB</span>
              </div>
              <Button size="sm" className="rounded-xl text-xs h-8 px-4 flex items-center gap-1">
                <UploadCloud className="size-3.5" /> Upload File
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}