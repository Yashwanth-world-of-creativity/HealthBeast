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
  Download,
  Share2,
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useHealthStore } from "@/store/health-store";

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

  const overallDangerIndex = React.useMemo(() => {
    if (symptoms.length === 0) return 15;
    const sum = symptoms.reduce((acc, curr) => acc + curr.dangerValue, 0);
    return Math.round(sum / symptoms.length);
  }, [symptoms]);

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

  const pieData = React.useMemo(() => {
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    symptoms.forEach((s) => {
      if (s.severity === "Low") lowCount++;
      else if (s.severity === "Medium") medCount++;
      else if (s.severity === "High") highCount++;
    });

    if (symptoms.length === 0) {
      return [{ name: "Stable Baseline", value: 1, color: "#10b981" }];
    }

    return [
      { name: "Low Severity", value: lowCount, color: "#10b981" },
      { name: "Medium Severity", value: medCount, color: "#f97316" },
      { name: "High Severity", value: highCount, color: "#f43f5e" },
    ].filter((item) => item.value > 0);
  }, [symptoms]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const handleExport = () => {
    toast.success("Analytics data exported successfully!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex flex-col gap-1 justify-between sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <BarChart3 className="size-6 text-primary" />
            </motion.div>
            Symptom-to-Vitals Analytics Console
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Calibrate dynamic distress graphs, evaluate weekly sleep-to-HRV bio-correlations, and review clinical recovery timelines.
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="rounded-xl flex items-center gap-2"
            >
              <Download className="size-4" /> Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Share feature coming soon!")}
              className="rounded-xl flex items-center gap-2"
            >
              <Share2 className="size-4" /> Share
            </Button>
          </motion.div>
        </div>
      </div>

      {mounted && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="space-y-6">
            <motion.div variants={cardVariants} className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -4 }}>
                <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 flex flex-col justify-between hover:border-primary/20 transition-all cursor-pointer h-full">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AlertTriangle className="size-3.5 text-rose-500" />
                    </motion.div>
                    Danger Index
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-3xl font-black font-heading text-rose-500"
                    >
                      {overallDangerIndex}%
                    </motion.span>
                    <span className="text-[9px] text-muted-foreground">Distress</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -4 }}>
                <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 flex flex-col justify-between hover:border-primary/20 transition-all cursor-pointer h-full">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <HeartPulse className="size-3.5 text-emerald-500" />
                    </motion.div>
                    Recovery Score
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                      className="text-3xl font-black font-heading text-emerald-500"
                    >
                      {recoveryScore}%
                    </motion.span>
                    <span className="text-[9px] text-muted-foreground">Adherence</span>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4 hover:border-primary/20 transition-all cursor-pointer">
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
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground font-semibold">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">{item.value}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
              <Card className="border-border/40 bg-gradient-to-br from-card/45 to-primary/5 p-5 space-y-2 cursor-pointer">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="size-4" />
                  </motion.div>
                  Clinical Telemetry Advice
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your dynamic danger distress curves correlate directly with systemic recovery readiness. Keeping active supplement checkpoints and maintaining fluid goals above 2.5L daily supports metabolic telemetry.
                </p>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4 hover:border-primary/20 transition-all cursor-pointer">
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

            <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
              <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4 hover:border-primary/20 transition-all cursor-pointer">
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