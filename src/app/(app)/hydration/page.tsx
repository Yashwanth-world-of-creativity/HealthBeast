"use client";

import React, { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Plus,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHealthStore } from "@/store/health-store";

export default function HydrationPage() {
  const { waterIntake, logWater, resetWater, symptoms, medications } = useHealthStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Dynamic clinical calculation of optimal water target:
  // Base optimal = 2000 ml
  // + 350 ml for each high severity symptom
  // + 150 ml for each active medication logged (tablet metabolic absorption water requirement)
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
    return medications.length * 150;
  }, [medications]);

  const dailyGoal = baseTarget + symptomSurcharge + medicationSurcharge;

  const currentPercent = Math.min(100, Math.round((waterIntake / dailyGoal) * 100));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <Droplets className="size-6 text-primary animate-bounce" />
          Interactive Hydration Analytics
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Calibrate precise fluid requirements calculated dynamically against your active symptoms, medical reports, and active supplement intake.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* COLUMN 1: Dynamic Sound Wave Beaker */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-md p-6 flex flex-col items-center justify-center space-y-6">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Live Clinical Beaker
          </span>

          {/* Glowing dynamic cylinder glass container */}
          <div className="w-44 h-64 rounded-3xl bg-muted/20 border border-border/40 p-2 relative overflow-hidden flex flex-col justify-end shadow-2xl">
            {mounted && (
              <motion.div
                animate={{ height: `${currentPercent}%` }}
                transition={{ type: "spring" as const, stiffness: 60, damping: 15 }}
                className="w-full bg-gradient-to-t from-primary/80 to-sky-400/80 rounded-b-2xl relative shadow-lg"
              >
                {/* Simulated floating waves */}
                <div className="absolute inset-x-0 top-0 h-4 bg-sky-400/20 blur-xs animate-pulse rounded-full" />
              </motion.div>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
              <span className="text-3xl font-black font-heading text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {currentPercent}%
              </span>
              <span className="text-[9px] font-bold text-muted-foreground/80 mt-1 uppercase tracking-wider drop-shadow-md">
                {waterIntake} / {dailyGoal} ml
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              className="flex-1 rounded-xl text-xs flex items-center justify-center gap-1.5 h-10 shadow-lg"
              onClick={() => logWater(250)}
              disabled={waterIntake >= dailyGoal}
            >
              <Plus className="size-4" /> Log 250 ml
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border/30 h-10 size-10 shrink-0"
              onClick={resetWater}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </Card>

        {/* COLUMN 2: Clinical Telemetry Fluid Breakdown */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info className="size-4 text-primary" /> Dynamic Fluid Requirement Breakdown
            </h3>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl border border-border/20 bg-muted/10 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold block text-foreground">Metabolic Hydration Base</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">Standard clinical daily baseline</span>
                </div>
                <span className="font-bold text-primary">+{baseTarget} ml</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/20 bg-muted/10 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold block text-foreground">Active Symptoms Surcharge</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">
                    Calculated from your {symptoms.length} active symptoms
                  </span>
                </div>
                <span className="font-bold text-rose-500">+{symptomSurcharge} ml</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/20 bg-muted/10 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold block text-foreground">Medication Metabolization Demand</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">
                    Required for your {medications.length} active supplement intakes
                  </span>
                </div>
                <span className="font-bold text-primary">+{medicationSurcharge} ml</span>
              </div>

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex justify-between items-center text-xs pt-4 border-t-2">
                <span className="font-bold text-foreground">Optimized Daily Intake Target</span>
                <span className="font-black text-primary text-sm">{dailyGoal} ml</span>
              </div>
            </div>
          </Card>

          <Card className="border-border/40 bg-gradient-to-br from-card/45 to-primary/5 p-5 space-y-2">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="size-4 animate-bounce" /> Clinical Advice
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Consuming water in consistent micro-doses throughout the day optimizes tissue rehydration rates and blood plasma expansion. This supports liver filtration during supplement processing, significantly accelerating your overall recovery score.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
