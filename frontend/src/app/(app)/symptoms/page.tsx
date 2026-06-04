"use client";

import React, { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Plus,
  Trash2,
  HeartPulse,
  AlertTriangle,
  Apple,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Ban,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useHealthStore } from "@/store/health-store";

interface DietRecommendation {
  condition: string;
  recommendations: string[];
  avoid: string[];
  bestFoods: string[];
}

// Therapeutic Food & Diet Database based on Symptoms
const dietDatabase: Record<string, DietRecommendation> = {
  Acidity: {
    condition: "Acidity & Heartburn",
    bestFoods: ["Bananas", "Oatmeal", "Melons", "Fennel", "Almond Milk"],
    recommendations: [
      "Eat water-rich, alkaline foods to neutralize active digestive acids.",
      "Include non-citrus fruits and oatmeal to soothe the esophageal lining.",
      "Consume small, frequent meals rather than large, dense portions.",
    ],
    avoid: ["Citrus Fruits", "Coffee/Caffeine", "Spicy Foods", "Carbonated Beverages"],
  },
  Fatigue: {
    condition: "Fatigue & Energy Deficits",
    bestFoods: ["Spinach", "Quinoa", "Avocados", "Chia Seeds", "Lean Proteins"],
    recommendations: [
      "Include iron-rich leafy greens to support oxygen distribution.",
      "Focus on complex carbohydrates for sustained energy production.",
      "Pair healthy fats with magnesium-dense seeds to regulate recovery speed.",
    ],
    avoid: ["Refined Sugars", "Energy Drinks", "Processed snacks", "Excessive Caffeine"],
  },
  "Muscle Soreness": {
    condition: "Muscle Soreness & Recovery",
    bestFoods: ["Tart Cherries", "Salmon", "Sweet Potatoes", "Greek Yogurt", "Nuts"],
    recommendations: [
      "Consume high-protein yogurt to provide amino acids for muscle synthesis.",
      "Enjoy anti-inflammatory Omega-3 fatty acids from walnuts and wild fish.",
      "Replenish muscular glycogen stores with potassium-rich root vegetables.",
    ],
    avoid: ["Alcohol", "Trans Fats", "Highly Refined Wheat", "Sugary sodas"],
  },
  "Mild Headache": {
    condition: "Mild Headache & Tension",
    bestFoods: ["Watermelon", "Cucumbers", "Spinach", "Almonds", "Ginger Tea"],
    recommendations: [
      "Hydrate immediately with water-rich foods to expand blood volumes.",
      "Consume magnesium-rich almonds to relax vascular constriction.",
      "Sip freshly brewed ginger tea to soothe neuro-inflammatory pathways.",
    ],
    avoid: ["Aged Cheeses", "Cured Meats", "Artificial Sweeteners", "Excessive Sodium"],
  },
  Dehydration: {
    condition: "Systemic Dehydration & Electrolyte Depletion",
    bestFoods: ["Coconut Water", "Celery", "Watermelon", "Oranges", "Bone Broth"],
    recommendations: [
      "Rehydrate using isotonic coconut water to supply minerals.",
      "Eat water-rich vegetable stalks to absorb trace minerals slowly.",
      "Drink warm, lightly salted broth to normalize tissue osmolarity.",
    ],
    avoid: ["Salty chips", "Alcohol", "Black tea", "Sweet juices"],
  },
  Insomnia: {
    condition: "Insomnia & Circadian Disruption",
    bestFoods: ["Kiwi", "Tart Cherry Juice", "Chamomile Tea", "Pumpkin Seeds", "Bananas"],
    recommendations: [
      "Incorporate foods rich in sleep-inducing tryptophan and serotonin precursors.",
      "Consume magnesium-dense pumpkin seeds to stimulate melatonin synthesis.",
      "Drink calming chamomile or lavender herbal tea before bed.",
    ],
    avoid: ["Dark Chocolate", "Spicy food close to sleep", "Caffeine after 2 PM", "Heavy meals"],
  },
  Migraine: {
    condition: "Migraine & Severe Headache",
    bestFoods: ["Ginger", "Magnesium Water", "Spinach", "Quinoa", "Sesame Seeds"],
    recommendations: [
      "Maintain stable hydration profiles to prevent cerebral vascular tension.",
      "Incorporate riboflavin-rich grains and magnesium-dense seeds to soothe nerves.",
      "Rest in a darkened room while sipping lukewarm ginger infusions to reduce nausea.",
    ],
    avoid: ["Chocolate", "Aged Cheeses", "Red Wine", "Processed Meats with Nitrates"],
  },
  "Brain Fog": {
    condition: "Brain Fog & Cognitive Fatigue",
    bestFoods: ["Blueberries", "Walnuts", "Wild Salmon", "Egg Yolks", "Green Tea"],
    recommendations: [
      "Support neural transmission with omega-3 fatty acids from walnuts and wild fish.",
      "Consume choline-rich egg yolks to optimize acetylcholine synthesis.",
      "Limit simple sugars to prevent reactive hypoglycemia and energy crashes.",
    ],
    avoid: ["Refined Wheat", "Sugary Pastries", "Processed Dairy", "Artificial Additives"],
  },
  "Muscle Cramps": {
    condition: "Muscle Cramps & Spasms",
    bestFoods: ["Bananas", "Coconut Water", "Avocados", "Pumpkin Seeds", "Sweet Potatoes"],
    recommendations: [
      "Replenish intracellular potassium with bananas and avocados.",
      "Consume magnesium-rich seeds to regulate neural muscle signals.",
      "Restore electrolyte osmotic balance with organic coconut water.",
    ],
    avoid: ["Excessive Caffeine", "Alcohol", "Salty chips", "Refined table salt"],
  },
};

export default function SymptomsPage() {
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High">("Low");

  const { symptoms: logs, addSymptom, removeSymptom } = useHealthStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Common quick-select symptoms list
  const commonSymptoms = ["Fatigue", "Acidity", "Muscle Soreness", "Mild Headache", "Dehydration", "Insomnia", "Migraine", "Brain Fog", "Muscle Cramps"];

  // Log new symptom click handler
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomName.trim()) {
      toast.error("Please enter or select a symptom.");
      return;
    }

    let dangerVal = 20;
    let recoveryVal = 80;
    if (severity === "Medium") {
      dangerVal = 50;
      recoveryVal = 50;
    } else if (severity === "High") {
      dangerVal = 90;
      recoveryVal = 20;
    }

    addSymptom({
      name: symptomName.trim(),
      severity,
      dangerValue: dangerVal,
      recoveryValue: recoveryVal,
    });
    setSymptomName("");
    toast.success(`${symptomName} logged successfully!`);
  };

  const handleDeleteLog = (id: string, name: string) => {
    removeSymptom(id);
    toast.info(`Removed ${name} log`);
  };

  // 1. Calculate overall Danger Index
  const overallDangerIndex = React.useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, curr) => acc + curr.dangerValue, 0);
    return Math.round(sum / logs.length);
  }, [logs]);

  // 2. Calculate overall Recovery Index
  const overallRecoveryIndex = React.useMemo(() => {
    if (logs.length === 0) return 100;
    const sum = logs.reduce((acc, curr) => acc + curr.recoveryValue, 0);
    return Math.round(sum / logs.length);
  }, [logs]);

  // 3. Recharts Pie Chart Data Calculation
  const pieData = React.useMemo(() => {
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    logs.forEach((log) => {
      if (log.severity === "Low") lowCount++;
      else if (log.severity === "Medium") medCount++;
      else if (log.severity === "High") highCount++;
    });

    return [
      { name: "Low Severity", value: lowCount, color: "#10b981" },
      { name: "Medium Severity", value: medCount, color: "#f97316" },
      { name: "High Severity", value: highCount, color: "#f43f5e" },
    ].filter((item) => item.value > 0);
  }, [logs]);

  // Derive active food recommendations based on currently logged symptoms
  const activeRecommendations = React.useMemo(() => {
    const matched: DietRecommendation[] = [];
    const addedConditions = new Set<string>();

    logs.forEach((log) => {
      if (dietDatabase[log.name] && !addedConditions.has(log.name)) {
        matched.push(dietDatabase[log.name]);
        addedConditions.add(log.name);
      }
    });

    if (matched.length === 0) {
      matched.push({
        condition: "General Health Maintenance",
        bestFoods: ["Leafy Greens", "Berries", "Olive Oil", "Wild Fish", "Almonds"],
        recommendations: [
          "Maintain a balanced caloric baseline rich in whole, unprocessed ingredients.",
          "Keep hydration levels above 2.5 Liters daily to support metabolic telemetry.",
          "Incorporate a colorful variety of polyphenol-rich fruits and vegetables daily.",
        ],
        avoid: ["Ultra-processed snack foods", "Refined seed oils", "High-fructose corn syrups"],
      });
    }

    return matched;
  }, [logs]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Title block */}
      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <HeartPulse className="size-6 text-primary animate-pulse" />
          Symptom & Wellness Analytics Hub
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Calibrate dynamic danger indexes, track daily wellness correlations, and receive clinical food and diet recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: LOGGER FORM & LIVE LIST */}
        <div className="space-y-6">
          {/* Logger Card */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Plus className="size-4 text-primary" /> Log Symptom
            </h3>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Symptom Name
                </label>
                <Input
                  type="text"
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  placeholder="e.g. Acidity, Fatigue"
                  className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {commonSymptoms.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSymptomName(sym)}
                    className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/10 text-[9px] text-muted-foreground hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all font-semibold cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Severity Switcher */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Low", "Medium", "High"] as const).map((level) => {
                    const isActive = severity === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={cn(
                          "py-2 rounded-xl border text-[10px] uppercase font-bold transition-all cursor-pointer",
                          isActive
                            ? level === "Low"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                              : level === "Medium"
                              ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                              : "bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                            : "border-border/20 text-muted-foreground hover:bg-muted/30"
                        )}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl text-xs font-semibold shadow-lg">
                Save & Analyze
              </Button>
            </form>
          </Card>

          {/* Active Logs List */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-4 text-primary animate-pulse" /> Active Telemetry Logs
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted border border-border/20 text-muted-foreground">
                {logs.length} Logged
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-3 rounded-xl border border-border/20 bg-muted/10 flex justify-between items-center transition-all hover:bg-muted/20"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{log.name}</span>
                        <span
                          className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded-md border",
                            log.severity === "Low"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : log.severity === "Medium"
                              ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          )}
                        >
                          {log.severity}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground block">{log.date}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id, log.name)}
                      className="size-7 rounded-lg bg-red-500/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No active symptoms logged. General wellness active.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* COLUMN 2: ANALYTICS GRAPHS & PIE CHART */}
        <div className="space-y-6">
          {/* Vitals Index Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 flex flex-col justify-between">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-rose-500 animate-bounce" /> Danger Index
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black font-heading text-rose-500">{overallDangerIndex}%</span>
                <span className="text-[10px] text-muted-foreground">Severity</span>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 flex flex-col justify-between">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <HeartPulse className="size-3.5 text-emerald-500 animate-pulse" /> Recovery Index
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black font-heading text-emerald-500">{overallRecoveryIndex}%</span>
                <span className="text-[10px] text-muted-foreground">Adherence</span>
              </div>
            </Card>
          </div>

          {/* AreaChart Severity Timeline */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" /> Daily Severity & Recovery Trend
            </h3>

            <div className="h-44 w-full">
              {mounted && logs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
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
                      name="Danger"
                      stroke="#f43f5e"
                      fillOpacity={1}
                      fill="url(#dangerGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="recoveryValue"
                      name="Recovery"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#recoveryGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                  No data to plot. Log symptoms to view daily trends.
                </div>
              )}
            </div>
          </Card>

          {/* PieChart Severity Breakdown */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Symptom Severity Breakdown
            </h3>

            <div className="flex gap-4 items-center justify-center">
              <div className="size-28 shrink-0 relative flex items-center justify-center">
                {mounted && logs.length > 0 ? (
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
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                    No logs
                  </div>
                )}
              </div>

              {/* Legends list */}
              <div className="flex-1 space-y-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground font-semibold">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{item.value} count</span>
                  </div>
                ))}
                {pieData.length === 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    General baseline stable. Log logs to view active severity ratio.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 3: DIET & FOOD RECOMMENDATIONS */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-gradient-to-br from-card/45 to-primary/5 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Apple className="size-4 text-primary animate-bounce" /> Clinical Food & Diet Recommendations
            </h3>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">
              Based on your active symptom telemetry, our nutrition module recommends specific metabolic support foods and items to restrict.
            </p>

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {activeRecommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/20 bg-muted/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground font-heading">{rec.condition}</span>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-xl bg-primary/10 text-primary flex items-center gap-1">
                      <Sparkles className="size-3" /> Diet Plan
                    </span>
                  </div>

                  {/* Best Foods Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Target Healing Foods
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.bestFoods.map((food, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-semibold flex items-center gap-1"
                        >
                          <ShieldCheck className="size-3 shrink-0" /> {food}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="space-y-1.5 text-[10px]">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Specific Instructions
                    </span>
                    <ul className="space-y-1 text-muted-foreground">
                      {rec.recommendations.map((step, idx) => (
                        <li key={idx} className="flex gap-1.5 items-start">
                          <ChevronRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Foods to Avoid */}
                  <div className="space-y-1.5 pt-2 border-t border-border/10">
                    <span className="text-[9px] text-rose-500 uppercase font-bold tracking-wider block">
                      Toxic Foods to Avoid
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.avoid.map((food, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-medium flex items-center gap-1"
                        >
                          <Ban className="size-3 shrink-0" /> {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}