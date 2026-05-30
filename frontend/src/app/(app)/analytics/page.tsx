"use client";

import React, { useSyncExternalStore } from "react";
import { motion, Variants } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  HeartPulse,
  AlertTriangle,
  Brain,
  Info,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useHealthStore } from "@/store/health-store";

// Mock Weekly HRV & Sleep Data (Clinical Correlation Vitals)
const vitalsCorrelationData = [
  { day: "Mon", sleepIndex: 72, hrv: 62 },
  { day: "Tue", sleepIndex: 78, hrv: 68 },
  { day: "Wed", sleepIndex: 85, hrv: 74 },
  { day: "Thu", sleepIndex: 68, hrv: 58 },
  { day: "Fri", sleepIndex: 82, hrv: 76 },
  { day: "Sat", sleepIndex: 90, hrv: 82 },
  { day: "Sun", sleepIndex: 88, hrv: 79 },
];

export default function AnalyticsPage() {
  const { symptoms, reports, medications, waterIntake } = useHealthStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // 1. Calculate overall Danger Index dynamically
  const overallDangerIndex = React.useMemo(() => {
    if (symptoms.length === 0) return 15; // healthy baseline
    const sum = symptoms.reduce((acc, curr) => acc + curr.dangerValue, 0);
    return Math.round(sum / symptoms.length);
  }, [symptoms]);

  // 2. Calculate overall Recovery Score dynamically
  const recoveryScore = React.useMemo(() => {
    let score = 85;

    symptoms.forEach((s) => {
      if (s.severity === "High") score -= 15;
      else if (s.severity === "Medium") score -= 8;
      else score -= 3;
    });

    score += reports.length * 5;

    const baseTarget = 2000;
    const dailyGoal = baseTarget + symptoms.length * 200 + medications.length * 150;
    if (waterIntake >= dailyGoal) score += 10;
    else if (waterIntake >= dailyGoal * 0.5) score += 5;

    return Math.min(100, Math.max(10, score));
  }, [symptoms, reports, waterIntake, medications]);

  // 3. Compute Pie Chart Severity Breakdown
  const pieData = React.useMemo(() => {
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    symptoms.forEach((s) => {
      if (s.severity === "Low") lowCount++;
      else if (s.severity === "Medium") medCount++;
      else if (s.severity === "High") highCount++;
    });

    // Default mock data if empty to display empty baseline
    if (symptoms.length === 0) {
      return [{ name: "Stable Baseline", value: 1, color: "#10b981" }];
    }

    return [
      { name: "Low Severity", value: lowCount, color: "#10b981" },
      { name: "Medium Severity", value: medCount, color: "#f97316" },
      { name: "High Severity", value: highCount, color: "#f43f5e" },
    ].filter((item) => item.value > 0);
  }, [symptoms]);

  // Framer Motion staggered reveals
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <BarChart3 className="size-6 text-primary animate-pulse" />
          Symptom-to-Vitals Analytics Console
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Calibrate dynamic distress graphs, evaluate weekly sleep-to-HRV bio-correlations, and review clinical recovery timelines.
        </p>
      </div>

      {mounted && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* COLUMN 1: INTEGRATED DANGER & RECOVERY RADARS */}
          <div className="space-y-6">
            <motion.div variants={cardVariants} className="grid grid-cols-2 gap-4">
              {/* Danger index widget */}
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 flex flex-col justify-between hover:border-primary/20 transition-all">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <AlertTriangle className="size-3.5 text-rose-500 animate-bounce" /> Danger Index
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-heading text-rose-500">
                    {overallDangerIndex}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">Distress</span>
                </div>
              </Card>

              {/* Recovery index widget */}
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 flex flex-col justify-between hover:border-primary/20 transition-all">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <HeartPulse className="size-3.5 text-emerald-500 animate-pulse" /> Recovery Score
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-heading text-emerald-500">
                    {recoveryScore}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">Adherence</span>
                </div>
              </Card>
            </motion.div>

            {/* Severity Breakdown Donut */}
            <motion.div variants={cardVariants}>
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4 hover:border-primary/20 transition-all">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Info className="size-4 text-primary" /> Active Severity Ratio
                </h3>

                <div className="flex gap-4 items-center justify-center">
                  <div className="size-28 shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={26}
                          outerRadius={44}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs font-bold text-foreground">
                        {symptoms.length}
                      </span>
                      <span className="text-[7px] text-muted-foreground uppercase font-semibold">
                        Logs
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {symptoms.length === 0 ? (
                      <div className="text-[9px] text-muted-foreground">
                        All clear. Log symptoms to visualize live distress ratios.
                      </div>
                    ) : (
                      pieData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground font-semibold">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">{item.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Clinical Analytics Insight */}
            <motion.div variants={cardVariants}>
              <Card className="border-border/40 bg-gradient-to-br from-card/45 to-primary/5 p-5 space-y-2">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Brain className="size-4 animate-bounce" /> Clinical Telemetry Advice
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your dynamic danger distress curves correlate directly with systemic recovery readiness. Keeping active supplement checkpoints (Omega 3 and L-Theanine) and maintaining fluid goals above the baseline significantly limits the spikes of inflammation markers, allowing heart rate variability (HRV) status to return to optimal peaks.
                </p>
              </Card>
            </motion.div>
          </div>

          {/* COLUMN 2 & 3: CHARTS & CORRELATIONS CONSOLE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Distress Danger vs Recovery Timeline */}
            <motion.div variants={cardVariants}>
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-center pb-2 border-b border-border/20">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="size-4 text-primary" /> Vitals Distress & Recovery Timeline
                    </h3>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Distress danger values tracked dynamically against overall wellness scores
                    </p>
                  </div>
                  <div className="flex gap-4 text-[9px] font-bold">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-rose-500" /> Distress Danger
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald-500" /> Wellness Readiness
                    </span>
                  </div>
                </div>

                <div className="h-48 w-full">
                  {symptoms.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={symptoms} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dangerColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="recoveryColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px" }} />
                        <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(10,10,10,0.95)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: "10px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="dangerValue"
                          name="Distress"
                          stroke="#f43f5e"
                          fillOpacity={1}
                          fill="url(#dangerColor)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="recoveryValue"
                          name="Wellness"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#recoveryColor)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      No active distress logs. Log symptoms to calibrate timeline graphs.
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Sleep Quality vs Heart Rate Variability (HRV) BarChart */}
            <motion.div variants={cardVariants}>
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-center pb-2 border-b border-border/20">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Activity className="size-4 text-emerald-500" /> Weekly Sleep Index vs HRV Correlation
                    </h3>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Monitoring Sleep indices (%) alongside Heart Rate Variability (ms)
                    </p>
                  </div>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vitalsCorrelationData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px" }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "9px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(10,10,10,0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          fontSize: "10px",
                        }}
                      />
                      <Legend style={{ fontSize: "10px" }} />
                      <Bar dataKey="sleepIndex" name="Sleep Quality (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hrv" name="HRV (ms)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}