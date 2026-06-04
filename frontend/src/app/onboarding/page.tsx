"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  Activity,
  Check,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import BrandTitle from "@/components/shared/BrandTitle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: DOB & Age States
  const [dobDay, setDobDay] = useState(30);
  const [dobMonth, setDobMonth] = useState("May");
  const [dobYear, setDobYear] = useState(2002);

  // Calculate age as a dynamic derived state during rendering (prevents cascading renders)
  const calculatedAge = React.useMemo(() => {
    const monthIndex = months.indexOf(dobMonth);
    const birthDate = new Date(dobYear, monthIndex, dobDay);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 0 : Math.max(0, age);
  }, [dobDay, dobMonth, dobYear]);

  // Step 2: Biometrics
  const [height, setHeight] = useState(178); // cm
  const [weight, setWeight] = useState(72); // kg

  // Step 3: Blood Group & Activity Level
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [activityLevel, setActivityLevel] = useState("Moderate");

  // Step 4: Allergies & Conditions
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    const monthIndex = months.indexOf(dobMonth) + 1;
    const formattedDOB = `${dobYear}-${String(monthIndex).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`;

    const profileData = {
      dateOfBirth: formattedDOB,
      age: calculatedAge,
      height,
      weight,
      bloodGroup,
      activityLevel,
      allergies: allergies.trim(),
      existingConditions: conditions.trim(),
      onboarded: true,
    };

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        throw new Error("Failed to save onboarding details");
      }

      toast.success("Profile setup complete!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Error saving profile. Please try again.";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background neon elements */}
      <div className="absolute top-[-20%] left-[-20%] size-[800px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] size-[800px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Main card panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl border border-border/30 bg-card/35 backdrop-blur-xl shadow-2xl p-8 relative z-10 min-h-[500px] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border/20 mb-6">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <BrandTitle size="default" />
          </div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Step {step} of 4
          </div>
        </div>

        {/* Dynamic Wizard Steps */}
        <div className="flex-1 flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <Calendar className="size-5 text-primary" /> When were you born?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your date of birth helps calibrate our daily baseline metrics.
                  </p>
                </div>

                {/* Rolling Date-of-Birth Selector Columns */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/20">
                  {/* Day Selection */}
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider pl-1">
                      Day
                    </span>
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(Number(e.target.value))}
                      className="bg-background border border-border/40 text-xs rounded-xl h-10 px-3 outline-none focus:ring-1 focus:ring-primary/45 appearance-none text-center font-semibold cursor-pointer"
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Selection */}
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider pl-1">
                      Month
                    </span>
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="bg-background border border-border/40 text-xs rounded-xl h-10 px-3 outline-none focus:ring-1 focus:ring-primary/45 appearance-none text-center font-semibold cursor-pointer"
                    >
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selection */}
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider pl-1">
                      Year
                    </span>
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(Number(e.target.value))}
                      className="bg-background border border-border/40 text-xs rounded-xl h-10 px-3 outline-none focus:ring-1 focus:ring-primary/45 appearance-none text-center font-semibold cursor-pointer"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Display calculated age in real time */}
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Calculated Longevity Age</span>
                  <span className="text-xl font-black font-heading text-primary">{calculatedAge} Years</span>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <Activity className="size-5 text-emerald-500" /> Biometric Metrics
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Calibrate metabolic hydration and sleep guidelines.
                  </p>
                </div>

                {/* Height Input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Height (cm)</span>
                    <span className="text-primary font-bold">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Weight (kg)</span>
                    <span className="text-primary font-bold">{weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <Activity className="size-5 text-violet-500 animate-pulse" /> Blood & Activity
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fine-tune nutritional suggestions and athletic workloads.
                  </p>
                </div>

                {/* Blood Group Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Blood Group
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBloodGroup(bg)}
                        className={cn(
                          "py-2.5 rounded-xl border text-xs font-semibold transition-colors",
                          bloodGroup === bg
                            ? "bg-primary/25 border-primary text-primary"
                            : "border-border/20 bg-muted/10 hover:bg-muted/30"
                        )}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Active Daily State
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Sedentary", "Moderate", "Active", "Elite"].map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setActivityLevel(act)}
                        className={cn(
                          "py-3 rounded-xl border text-center font-semibold transition-colors",
                          activityLevel === act
                            ? "bg-primary/25 border-primary text-primary"
                            : "border-border/20 bg-muted/10 hover:bg-muted/30"
                        )}
                      >
                        {act} {act === "Elite" ? "🏆" : act === "Active" ? "🔥" : act === "Moderate" ? "⚡" : "💤"}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <Sparkles className="size-5 text-yellow-500" /> Allergies & Conditions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Help our AI flag potential food ingredients or medication alerts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Allergies (Optional)
                  </label>
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Penicillin, Dairy..."
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/45 min-h-[70px] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Existing Medical Conditions (Optional)
                  </label>
                  <textarea
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="e.g. Hypertension, Asthma, Type-2 Diabetes..."
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/45 min-h-[70px] resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-border/20 pt-6 mt-6">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className="rounded-xl flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="rounded-xl flex items-center gap-1.5 text-xs bg-primary text-primary-foreground"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="rounded-xl flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20"
            >
              {loading ? "Constructing Baseline..." : "Complete Setup"} <Check className="size-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
