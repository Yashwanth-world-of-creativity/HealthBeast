"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  Search,
  HeartPulse,
  Sparkles,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useHealthStore } from "@/store/health-store";
import Link from "next/link";

export default function ReportsPage() {
  const { reports, addReport, uploadReport, removeReport } = useHealthStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<"all" | "labs" | "prescriptions">("all");

  // Manual Import form states
  const [manualTitle, setManualTitle] = useState("");
  const [manualCategory, setManualCategory] = useState("General");
  const [manualVitals, setManualVitals] = useState("");
  const [manualText, setManualText] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);

  // react-dropzone config
  const onDrop = async (acceptedFiles: File[]) => {
    toast.promise(
      Promise.all(acceptedFiles.map((file) => uploadReport(file))),
      {
        loading: "Uploading and parsing document with AI...",
        success: `Successfully parsed and analyzed ${acceptedFiles.length} file(s)!`,
        error: "Failed to analyze document(s).",
      }
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: true,
  });

  const handleManualImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      toast.error("Please provide a report title.");
      return;
    }

    addReport({
      name: manualTitle.trim() + ".txt",
      size: `${(manualText.length / 1024).toFixed(1)} KB`,
      category: manualCategory,
      extractedVitals: manualVitals.trim() || "Manual notes logged",
      matchedSymptom: "General Health",
    });

    setManualTitle("");
    setManualVitals("");
    setManualText("");
    setShowManualForm(false);
    toast.success("Text report imported and scanned!");
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch = rep.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            rep.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "labs") return matchesSearch && rep.category !== "Prescription";
      return matchesSearch && rep.category === "Prescription";
    });
  }, [reports, searchQuery, activeTab]);

  // Selected report details
  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || reports[0];
  }, [reports, selectedReportId]);

  // Extract Mock Lab Values for UI charts/indicators
  const mockLabValues = useMemo(() => {
    if (!selectedReport) return null;
    
    const isCBC = selectedReport.name.toLowerCase().includes("cbc") || 
                  selectedReport.name.toLowerCase().includes("blood");
    const isThyroid = selectedReport.name.toLowerCase().includes("thyroid") || 
                      selectedReport.category.toLowerCase().includes("endocrinology");
    const isPrescription = selectedReport.category === "Prescription";

    if (isCBC) {
      return [
        { label: "Hemoglobin (Hb)", value: "14.2 g/dL", status: "Optimal", min: 13.5, max: 17.5, currentPercent: 65, color: "#10b981" },
        { label: "White Blood Cells (WBC)", value: "6.8 K/uL", status: "Optimal", min: 4.5, max: 11.0, currentPercent: 55, color: "#10b981" },
        { label: "Platelet Count", value: "245 K/uL", status: "Optimal", min: 150, max: 450, currentPercent: 50, color: "#10b981" },
        { label: "Serum Iron", value: "62 ug/dL", status: "Low Margin", min: 65, max: 175, currentPercent: 12, color: "#f97316" },
      ];
    } else if (isThyroid) {
      return [
        { label: "TSH (Thyroid Stimulating Hormone)", value: "4.1 uIU/mL", status: "High Alert", min: 0.4, max: 4.0, currentPercent: 88, color: "#f43f5e" },
        { label: "Free T4 (Thyroxine)", value: "1.1 ng/dL", status: "Optimal", min: 0.9, max: 1.7, currentPercent: 40, color: "#10b981" },
        { label: "Free T3 (Triiodothyronine)", value: "2.8 pg/mL", status: "Optimal", min: 2.0, max: 4.4, currentPercent: 45, color: "#10b981" },
      ];
    } else if (isPrescription) {
      return [
        { label: "Dosage Regimen", value: "Daily Post-Meal", status: "Scheduled", min: 0, max: 1, currentPercent: 100, color: "#a855f7" },
        { label: "Active Compound", value: "Cholecalciferol", status: "Parsed", min: 0, max: 1, currentPercent: 100, color: "#3b82f6" },
      ];
    } else {
      // General Panel
      return [
        { label: "Fast Glucose", value: "92 mg/dL", status: "Optimal", min: 70, max: 99, currentPercent: 60, color: "#10b981" },
        { label: "Total Cholesterol", value: "185 mg/dL", status: "Optimal", min: 100, max: 199, currentPercent: 55, color: "#10b981" },
        { label: "Serum Potassium", value: "4.2 mEq/L", status: "Optimal", min: 3.5, max: 5.1, currentPercent: 50, color: "#10b981" },
      ];
    }
  }, [selectedReport]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none flex-1 flex flex-col min-h-0">
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
            <UploadCloud className="size-6 text-emerald-500" />
            Clinical Reports & Prescriptions Hub
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Import doctor prescriptions, blood panels, or copy-pasted medical texts. Auto-extract clinical telemetry indexes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setShowManualForm(!showManualForm)}
            className="rounded-xl text-xs flex items-center gap-1.5 h-9 bg-card border border-border/40 hover:bg-muted text-foreground"
          >
            <Plus className="size-3.5 text-primary" /> Paste Report Text
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1 min-h-0">
        
        {/* COLUMN 1 & 2 (Left): UPLOADER, FILTERS, LIST */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          
          {/* Manual Text Import Form Section */}
          <AnimatePresence>
            {showManualForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden shrink-0"
              >
                <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="size-4" /> Import Copy-Pasted Report Text
                    </h3>
                    <button 
                      onClick={() => setShowManualForm(false)} 
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleManualImport} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground">Report / Prescr. Title</label>
                      <Input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="e.g. Thyroid Profile May"
                        className="h-9 text-xs bg-muted/20 border-border/40 focus-visible:ring-primary/45 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground">Category</label>
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className="w-full h-9 rounded-xl border border-border/40 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45"
                      >
                        <option value="Hematology">Hematology (Blood Work)</option>
                        <option value="Endocrinology">Endocrinology (Hormones)</option>
                        <option value="Prescription">Doctor Prescription</option>
                        <option value="General">General / Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground">Parsed Lab Metric (Optional)</label>
                      <Input
                        type="text"
                        value={manualVitals}
                        onChange={(e) => setManualVitals(e.target.value)}
                        placeholder="e.g. Vitamin D 28 ng/mL (Low)"
                        className="h-9 text-xs bg-muted/20 border-border/40 focus-visible:ring-primary/45 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground">Report Body / Text Copy</label>
                      <textarea
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="Paste prescription contents or lab report texts here..."
                        rows={3}
                        className="w-full rounded-xl border border-border/40 bg-muted/20 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/45 resize-none text-foreground"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button type="submit" size="sm" className="rounded-xl px-5 text-xs h-9">
                        Import Report
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag & Drop File Upload Beaker */}
          <div
            {...getRootProps()}
            className={cn(
              "border border-dashed border-border/40 hover:border-primary/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 shrink-0 relative overflow-hidden bg-card/15 backdrop-blur-md select-none",
              isDragActive ? "bg-primary/5 border-primary/40 shadow-inner scale-[0.99]" : ""
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              "size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-all",
              isDragActive ? "bg-primary/20 text-primary scale-105" : ""
            )}>
              <UploadCloud className="size-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                {isDragActive ? "Drop your files here..." : "Drag & drop clinical files here"}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-1">
                Upload blood work reports, medical PDFs, or scanned doctor prescriptions (PDF, PNG, JPG up to 10MB)
              </span>
            </div>
          </div>

          {/* List Toolbar (Tabs and Search) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-card/25 backdrop-blur-md p-3 rounded-2xl border border-border/40">
            {/* Tabs */}
            <div className="flex gap-1.5 w-full sm:w-auto">
              {(["all", "labs", "prescriptions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {tab === "all" ? "All Documents" : tab === "labs" ? "Lab Diagnostics" : "Prescriptions"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter files by name..."
                className="w-full pl-8 h-8 rounded-xl bg-muted/20 border-border/40 text-[10px] placeholder:text-muted-foreground/60 focus-visible:ring-primary/45"
              />
            </div>
          </div>

          {/* Reports Grid/List Container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
            {mounted && filteredReports.map((rep) => {
              const isSelected = selectedReportId === rep.id;
              const isPresc = rep.category === "Prescription";
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden",
                    isSelected
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                      : "bg-card/25 border-border/20 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Document category icon */}
                    <div className={cn(
                      "size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs",
                      isPresc ? "bg-purple-500/15 text-purple-500 border border-purple-500/10" : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/10"
                    )}>
                      {isPresc ? "Rx" : "PDF"}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-foreground truncate max-w-[240px] sm:max-w-xs">
                        {rep.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[9px] text-muted-foreground">
                        <span>{rep.size}</span>
                        <span>•</span>
                        <span>{rep.date}</span>
                        <span>•</span>
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-md font-bold uppercase",
                          isPresc ? "text-purple-500 bg-purple-500/5" : "text-emerald-500 bg-emerald-500/5"
                        )}>
                          {rep.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/10">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1 shrink-0">
                      <FileCheck className="size-3" /> AI Analyzed
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReport(rep.id);
                        toast.info(`Deleted report file`);
                      }}
                      className="size-7 rounded-lg bg-red-500/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {mounted && filteredReports.length === 0 && (
              <div className="text-center py-16 text-xs text-muted-foreground">
                No reports found matching your criteria. Try uploading or pasting details.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3 (Right): DETAILED REPORT INSIGHTS */}
        <div className="flex flex-col min-h-0">
          <Card className="flex-1 border-border/40 bg-card/45 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden relative">
            {mounted && selectedReport ? (
              <div className="flex-1 flex flex-col min-h-0 justify-between">
                
                {/* Header Information */}
                <div className="shrink-0 pb-4 border-b border-border/20 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-primary uppercase font-bold tracking-wider flex items-center gap-1">
                      <Sparkles className="size-3 text-primary animate-pulse" /> Telemetry Analysis
                    </span>
                    <span className="text-[9px] text-muted-foreground">{selectedReport.date}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-foreground truncate">{selectedReport.name}</h3>
                  <span className="text-[10px] text-muted-foreground block">{selectedReport.category} Diagnostic Summary</span>
                </div>

                {/* Lab Vitals Indicators Grid */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0 scrollbar-thin">
                  <div className="space-y-3">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Parsed Lab Indicators
                    </span>
                    {mockLabValues?.map((vital, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-border/20 bg-muted/10 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-foreground block leading-tight">{vital.label}</span>
                            <span className="text-[8px] text-muted-foreground mt-0.5 block leading-none">Normal Range: {vital.min} - {vital.max}</span>
                          </div>
                          <span
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded-md border"
                            style={{
                              color: vital.color,
                              backgroundColor: `${vital.color}15`,
                              borderColor: `${vital.color}25`,
                            }}
                          >
                            {vital.status}
                          </span>
                        </div>

                        {/* Progress line */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-muted-foreground">Reading: <strong className="text-foreground">{vital.value}</strong></span>
                          </div>
                          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${vital.currentPercent}%`,
                                backgroundColor: vital.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Clinical Summary Panel */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 space-y-2.5">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <HeartPulse className="size-3.5 text-primary animate-pulse" /> AI Biometric Insight
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {selectedReport.name.toLowerCase().includes("cbc") || selectedReport.name.toLowerCase().includes("blood")
                        ? "Inflammatory biomarkers are within physiological baselines. However, serum iron levels are on the lower margin (12% index). Consider dietary optimization with heme-iron sources or iron-rich vegetables, and consult your physician."
                        : selectedReport.name.toLowerCase().includes("thyroid") || selectedReport.category.toLowerCase().includes("endocrinology")
                        ? "Elevated Thyroid Stimulating Hormone (TSH) at 4.1 uIU/mL suggests slight subclinical sluggishness. Monitor core body temperatures, ensure trace iodine/selenium cofactor intake, and review results with your doctor."
                        : selectedReport.category === "Prescription"
                        ? "The uploaded prescription outlines your daily supplement schedule. I have successfully parsed Vitamin D3 to co-ordinate with your active medications calendar."
                        : "Biometric indicators show stable filtration. Fast glucose and lipid panels are optimized. Continue maintaining your current hydration levels above 2.5L to support systemic clearance."}
                    </p>
                  </div>

                  {/* Clinical Action Items */}
                  <div className="p-3.5 rounded-xl border border-border/20 bg-muted/5 space-y-2">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Recommended Actions</span>
                    <div className="space-y-1.5 text-[10px] text-muted-foreground">
                      <div className="flex items-start gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>Compare results with symptom tracker history.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>Schedule a follow-up test in 6-8 weeks to monitor trends.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redirect button to AI Assistant */}
                <div className="shrink-0 pt-4 border-t border-border/20">
                  <Link href="/ai-assistant">
                    <Button className="w-full rounded-xl text-xs font-semibold h-10 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
                      Discuss This Report with AI Companion <ArrowRight className="size-4 animate-pulse" />
                    </Button>
                  </Link>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="size-12 rounded-2xl bg-muted border border-border/20 flex items-center justify-center text-muted-foreground">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">No Report Selected</h4>
                  <p className="text-[9px] text-muted-foreground mt-1 max-w-[200px]">
                    Select an active file from the telemetry list or upload a new doctor report to begin analysis.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}