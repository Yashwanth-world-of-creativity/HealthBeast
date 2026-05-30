"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHealthStore } from "@/store/health-store";
import { toast } from "sonner";

export default function ReportsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reportName, setReportName] = useState("");
  const [category, setCategory] = useState("General Blood Panel");
  const [symptomMatch, setSymptomMatch] = useState("");
  const [fileSize, setFileSize] = useState("1.0 MB");

  const { reports, addReport, removeReport, symptoms } = useHealthStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(sizeMB + " MB");
      setReportName(file.name);
      
      // Auto-extract or default category
      if (file.name.toLowerCase().includes("blood")) setCategory("Hematology");
      else if (file.name.toLowerCase().includes("urine") || file.name.toLowerCase().includes("renal")) setCategory("Renal Metabolic");
      else if (file.name.toLowerCase().includes("lipid")) setCategory("Lipid Profile");
      else setCategory("General Diagnostics");

      toast.info(`Attached document: ${file.name}`);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim()) {
      toast.error("Please drag a report or click upload to attach a file first.");
      return;
    }

    // Dynamic simulated analysis of vitals
    let extracted = "Vitals calibration complete. All indicators nominal.";
    if (category.toLowerCase().includes("hemat")) extracted = "Hemoglobin 14.8 g/dL (Stable Baseline)";
    else if (category.toLowerCase().includes("renal")) extracted = "Creatinine 0.9 mg/dL (Perfect Osmolarity)";
    else if (category.toLowerCase().includes("lipid")) extracted = "LDL Cholesterol 95 mg/dL (Healthy Cardio)";

    addReport({
      name: reportName,
      size: fileSize,
      category,
      matchedSymptom: symptomMatch || "General Baseline",
      extractedVitals: extracted,
    });

    setReportName("");
    setSymptomMatch("");
    toast.success("Document analyzed and diagnostics logged successfully!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <FileText className="size-6 text-primary animate-pulse" />
          Clinical Reports & Diagnostics
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Upload local clinical files, parse diagnostics telemetry, and tie medical data with active symptom logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: DRAG & DROP FILE ANALYZER UPLOADER */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Upload className="size-4 text-primary" /> Upload Reports File
            </h3>

            <form onSubmit={handleSaveReport} className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.doc"
                className="hidden"
              />

              {/* Upload Dropzone Box */}
              <div
                onClick={triggerUploadClick}
                className={cn(
                  "border border-dashed border-border/40 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-muted/10 hover:border-primary/45 flex flex-col items-center justify-center gap-2.5",
                  reportName && "bg-primary/5 border-primary/30"
                )}
              >
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileCheck className="size-5.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold block text-foreground">
                    {reportName ? "Attached: " + reportName : "Drag & drop clinical file"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    PDF, PNG, JPG, or DOC up to 10MB
                  </span>
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Diagnostic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-xs bg-muted/40 border border-border/40 text-foreground outline-none focus:border-primary/45"
                >
                  <option className="bg-popover" value="Hematology Panel">Hematology (Blood Panels)</option>
                  <option className="bg-popover" value="Renal Metabolic">Renal Functional metabolic</option>
                  <option className="bg-popover" value="Lipid Cardiovascular">Lipid Cardio profile</option>
                  <option className="bg-popover" value="Respiratory Diagnostic">Respiratory telemetry</option>
                  <option className="bg-popover" value="General Health Screen">General Vitals screenings</option>
                </select>
              </div>

              {/* Matched Symptom Binder */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Tie with Active Symptom
                </label>
                <select
                  value={symptomMatch}
                  onChange={(e) => setSymptomMatch(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-xs bg-muted/40 border border-border/40 text-foreground outline-none focus:border-primary/45"
                >
                  <option className="bg-popover" value="">General Baseline (No match)</option>
                  {symptoms.map((sym) => (
                    <option key={sym.id} className="bg-popover" value={sym.name}>
                      {sym.name} ({sym.severity})
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl text-xs font-semibold shadow-lg">
                Upload & Run AI Parsing
              </Button>
            </form>
          </Card>
        </div>

        {/* COLUMN 2 & 3: REPORT TELEMETRY ARCHIVE LIST & AI PARSING PREVIEWS */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary animate-pulse" /> Analyzed Reports Database
            </h3>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {reports.map((rep) => (
                  <motion.div
                    key={rep.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl border border-border/20 bg-muted/5 space-y-3 hover:bg-muted/10 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">{rep.name}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5 block">
                            {rep.category} • {rep.size} • {rep.date}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeReport(rep.id)}
                        className="size-7 rounded-lg bg-red-500/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* AI Telemetry Details */}
                    {rep.extractedVitals && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="size-3.5 text-emerald-500" />
                          <span className="font-semibold">AI Extracted Telemetry:</span>
                          <span className="text-muted-foreground">{rep.extractedVitals}</span>
                        </div>
                        {rep.matchedSymptom && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary text-[8px] font-bold shrink-0">
                            Tied to: {rep.matchedSymptom}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {reports.length === 0 && (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  No medical reports logged. General diagnostics stable.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
