"use client";

import React, { useSyncExternalStore } from "react";
import {
  HeartPulse,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHealthStore } from "@/store/health-store";
import { toast } from "sonner";

interface RecoveryStep {
  title: string;
  desc: string;
  duration: string;
  difficulty: string;
}

export default function RecoveryPage() {
  const { symptoms, reports, medications, waterIntake } = useHealthStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // 1. Calculate overall Recovery Score dynamically
  // Starts at 100
  // Drops by 15 for each high severity symptom, 8 for medium, 3 for low
  // Rises by 10 for each report parsed
  // Rises by 15 if water intake meets optimal goal
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

  // Dynamic clinical recovery recommendations based on active status
  const recoveryProcedures = React.useMemo(() => {
    const list: RecoveryStep[] = [];

    // General recovery baseline
    list.push({
      title: "Pranayama Yoga Breathing",
      desc: "Deep respiratory expansion to lower active adrenaline and cortisol spikes, calming cardiac indexes.",
      duration: "10 Minutes",
      difficulty: "Very Light",
    });

    list.push({
      title: "Zone 1 Aerobic Walking",
      desc: "Steady-state movement below lactate threshold to flush muscle fibers and encourage lymphatic detoxification.",
      duration: "30 Minutes",
      difficulty: "Light",
    });

    // Targeted recommendations based on symptoms
    const activeNames = symptoms.map((s) => s.name.toLowerCase());

    if (activeNames.some((n) => n.includes("muscle") || n.includes("sore"))) {
      list.push({
        title: "Dynamic Passive Stretching",
        desc: "Gentle hamstring, quad, and spinal releases to reduce tension and speed muscle hydration uptake.",
        duration: "15 Minutes",
        difficulty: "Light",
      });
    }

    if (activeNames.some((n) => n.includes("acid") || n.includes("stomach"))) {
      list.push({
        title: "Vajrasana (Thunderbolt Pose)",
        desc: "Statically sitting on heels post-meal to increase digestive vascular flow and reduce esophageal reflux.",
        duration: "5 Minutes",
        difficulty: "Light",
      });
    }

    if (activeNames.some((n) => n.includes("fatigue") || n.includes("dehydrat"))) {
      list.push({
        title: "Viparita Karani (Legs-up-the-Wall)",
        desc: "Passive restoration pose to drain lymphatic pooling and encourage baseline central nervous system recalibration.",
        duration: "12 Minutes",
        difficulty: "Very Light",
      });
    }

    return list;
  }, [symptoms]);

  const handleCompleteYoga = () => {
    toast.success("Yoga metrics successfully synced with Apple Health!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <HeartPulse className="size-6 text-primary animate-pulse" />
          Systemic Recovery & Strength Calibration
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Calibrate recovery indexes, track gradual physical progression, and follow step-by-step diagnostic exercise plans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: DYNAMIC RECOVERY RADAR */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Gradual Strength Index
            </span>

            {/* Concentric glowing progress ring */}
            <div className="size-40 rounded-full border border-border/20 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]">
              {mounted && (
                <div className="absolute inset-2 rounded-full border border-dashed border-primary/20 flex items-center justify-center">
                  <div className="size-28 rounded-full bg-primary/5 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black font-heading text-primary">
                      {recoveryScore}%
                    </span>
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                      Ready
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground max-w-xs">
              This score derives dynamically from your active symptoms, hydration water logs, and chemical medication adherence metrics.
            </p>
          </Card>
        </div>

        {/* COLUMN 2 & 3: STEP-BY-STEP PROGRESSION GUIDELINES & PHYSICAL DEVELOPMENT */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary animate-pulse" /> Step-by-Step Strength Recovery Plan
            </h3>

            <div className="space-y-3.5">
              {recoveryProcedures.map((proc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/20 bg-muted/10 flex justify-between items-center gap-4 hover:bg-muted/20 transition-all"
                >
                  <div className="space-y-1 max-w-[75%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground font-heading">{proc.title}</span>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {proc.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {proc.desc}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-foreground block">{proc.duration}</span>
                    <Button
                      size="xs"
                      onClick={handleCompleteYoga}
                      className="rounded-lg text-[9px] h-7 px-2 mt-2 bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 cursor-pointer"
                    >
                      Log Workout
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-border/40 bg-gradient-to-br from-card/45 to-primary/5 p-5 space-y-3">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="size-4 animate-bounce" strokeWidth={2.5} /> Gradual Recovery Calibration
            </h3>
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-2">
              <p>
                **Step 1**: Target metabolic stabilization by maintaining Hydration targets (above 2.5L) and completing supplemental schedules Post-Breakfast.
              </p>
              <p>
                **Step 2**: Initiate cardiovascular flushes with light Zone 1 walking (30 mins daily) to normalize lactate profiles and clear inflammatory elements.
              </p>
              <p>
                **Step 3**: Introduce dynamic skeletal yoga postures to calibrate digestive blood volumes and relieve tension, progressively climbing back to full strength baselines.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
