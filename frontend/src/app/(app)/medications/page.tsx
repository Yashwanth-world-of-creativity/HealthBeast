"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Plus,
  Trash2,
  Check,
  Apple,
  Sparkles,
  ShieldCheck,
  Ban,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHealthStore } from "@/store/health-store";
import { toast } from "sonner";

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
      "Include iron-rich leafy greens to support cellular oxygen distribution.",
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
      "Eat water-rich vegetable stalks to absorb trace cellular minerals slowly.",
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
};

export default function MedicationsPage() {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("1x Daily");
  const [targetSymptom, setTargetSymptom] = useState("");
  const [consultRequired, setConsultRequired] = useState(false);

  const { medications, addMedication, removeMedication, toggleMedication, symptoms } = useHealthStore();

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) {
      toast.error("Please enter a tablet name and dosage.");
      return;
    }

    addMedication({
      name: medName.trim(),
      dosage: dosage.trim(),
      time,
      targetSymptom: targetSymptom || "General Vital",
      requiresConsultation: consultRequired,
    });

    setMedName("");
    setDosage("");
    setTargetSymptom("");
    setConsultRequired(false);
    toast.success(`${medName} added to dosage schedule!`);
  };

  const medsTakenCount = medications.filter((m) => m.taken).length;
  const medsProgress = medications.length > 0 ? Math.round((medsTakenCount / medications.length) * 100) : 0;

  // Derive active food recommendations based on currently logged symptoms
  const activeRecommendations = React.useMemo(() => {
    const matched: DietRecommendation[] = [];
    const addedConditions = new Set<string>();

    symptoms.forEach((log) => {
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
  }, [symptoms]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <Pill className="size-6 text-primary animate-pulse" />
          Medications & Nutritional Therapy
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Calibrate tablet dosage schedules, view clinical therapeutic diets based on symptoms, and manage medical consultations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: DOSE LOGGER & ACTIVE SCHEDULE */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Plus className="size-4 text-primary" /> Log Medication
            </h3>

            <form onSubmit={handleAddMed} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Tablet/Supplement Name
                </label>
                <Input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Magnesium Glycinate"
                  className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Dosage
                  </label>
                  <Input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 400mg"
                    className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Schedule
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-xs bg-muted/40 border border-border/40 text-foreground outline-none focus:border-primary/45"
                  >
                    <option value="Post-Breakfast">Post-Breakfast</option>
                    <option value="1x Daily">1x Daily</option>
                    <option value="2x Daily">2x Daily</option>
                    <option value="Before Sleep">Before Sleep</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Target Symptom (Optional)
                </label>
                <select
                  value={targetSymptom}
                  onChange={(e) => setTargetSymptom(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-xs bg-muted/40 border border-border/40 text-foreground outline-none focus:border-primary/45"
                >
                  <option value="">General Wellness</option>
                  {symptoms.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Required Toggle */}
              <div className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border border-border/20">
                <div>
                  <span className="text-xs font-semibold block text-foreground">Requires Medical Consultation</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5 block">Requires physician authorization</span>
                </div>
                <input
                  type="checkbox"
                  checked={consultRequired}
                  onChange={(e) => setConsultRequired(e.target.checked)}
                  className="size-4 rounded accent-primary cursor-pointer border-border/40"
                />
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl text-xs font-semibold shadow-lg">
                Add to Schedule
              </Button>
            </form>
          </Card>
        </div>

        {/* COLUMN 2: ACTIVE MEDICATION CHECKLIST & CONSULTATIONS */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-4 text-primary animate-pulse" /> Active Intake Schedule
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {medsProgress}% Completed
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {medications.map((med) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "p-3 rounded-xl border flex justify-between items-center transition-all",
                      med.taken
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-muted/10 border-border/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => toggleMedication(med.id)}
                        className={cn(
                          "size-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer",
                          med.taken
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {med.taken && <Check className="size-4" />}
                      </div>

                      <div>
                        <span className={cn("text-xs font-bold block", med.taken && "line-through text-muted-foreground")}>
                          {med.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 block">
                          {med.dosage} • {med.time} • Target: {med.targetSymptom}
                        </span>

                        {med.requiresConsultation && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md mt-1">
                            <AlertCircle className="size-2.5" /> Doctor Consultation Recommended
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeMedication(med.id)}
                      className="size-7 rounded-lg bg-red-500/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {medications.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No active supplements configured.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* COLUMN 3: DYNAMIC ALIGNED NUTRITIONAL FOOD REQUIREMENTS */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-gradient-to-br from-card/45 to-primary/5 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Apple className="size-4 text-primary animate-bounce" /> Telemetry Food Requirements
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {activeRecommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/20 bg-muted/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground font-heading">{rec.condition}</span>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-xl bg-primary/10 text-primary flex items-center gap-1">
                      <Sparkles className="size-3" /> Diet Plan
                    </span>
                  </div>

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
