import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SymptomLog {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High";
  date: string;
  dangerValue: number;
  recoveryValue: number;
}

export interface ReportFile {
  id: string;
  name: string;
  size: string;
  date: string;
  category: string;
  extractedVitals?: string;
  matchedSymptom?: string;
  fileUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  targetSymptom: string;
  taken: boolean;
  requiresConsultation: boolean;
}

interface HealthState {
  symptoms: SymptomLog[];
  reports: ReportFile[];
  medications: Medication[];
  waterIntake: number; // in ml
  addSymptom: (symptom: Omit<SymptomLog, "id" | "date">) => void;
  removeSymptom: (id: string) => void;
  addReport: (report: Omit<ReportFile, "id" | "date">) => void;
  removeReport: (id: string) => void;
  toggleMedication: (id: string) => void;
  addMedication: (med: Omit<Medication, "id" | "taken">) => void;
  removeMedication: (id: string) => void;
  logWater: (amount: number) => void;
  resetWater: () => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      symptoms: [
        { id: "1", name: "Muscle Soreness", severity: "Medium", date: "May 26", dangerValue: 50, recoveryValue: 60 },
        { id: "2", name: "Dehydration", severity: "Low", date: "May 27", dangerValue: 20, recoveryValue: 80 },
        { id: "3", name: "Acidity", severity: "Medium", date: "May 28", dangerValue: 50, recoveryValue: 55 },
        { id: "4", name: "Fatigue", severity: "High", date: "May 29", dangerValue: 90, recoveryValue: 25 },
        { id: "5", name: "Mild Headache", severity: "Low", date: "Today", dangerValue: 20, recoveryValue: 85 },
      ],
      reports: [
        { id: "1", name: "CBC_Blood_Panel.pdf", size: "1.4 MB", date: "May 28", category: "Hematology", extractedVitals: "Hemoglobin 14.2 g/dL (Stable)", matchedSymptom: "Fatigue" },
        { id: "2", name: "Renal_Function_Telemetry.pdf", size: "2.1 MB", date: "May 27", category: "Metabolic Panel", extractedVitals: "eGFR 94 mL/min/1.73m2 (Normal)", matchedSymptom: "Dehydration" },
      ],
      medications: [
        { id: "1", name: "Omega 3 Fish Oil", dosage: "1000mg", time: "Post-Breakfast", targetSymptom: "Muscle Soreness", taken: true, requiresConsultation: false },
        { id: "2", name: "Vitamin D3 Co-factors", dosage: "5000 IU", time: "1x Daily", targetSymptom: "Fatigue", taken: false, requiresConsultation: false },
        { id: "3", name: "L-Theanine", dosage: "200mg", time: "Before Sleep", targetSymptom: "Insomnia", taken: false, requiresConsultation: true },
      ],
      waterIntake: 1250,

      addSymptom: (symptom) =>
        set((state) => {
          const dateStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
          const newSymptom: SymptomLog = {
            ...symptom,
            id: `sym-${Date.now()}-${Math.random()}`,
            date: dateStr,
          };
          return { symptoms: [...state.symptoms, newSymptom] };
        }),

      removeSymptom: (id) =>
        set((state) => ({
          symptoms: state.symptoms.filter((item) => item.id !== id),
        })),

      addReport: (report) =>
        set((state) => {
          const dateStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
          const newReport: ReportFile = {
            ...report,
            id: `rep-${Date.now()}-${Math.random()}`,
            date: dateStr,
          };
          return { reports: [newReport, ...state.reports] };
        }),

      removeReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((item) => item.id !== id),
        })),

      toggleMedication: (id) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, taken: !m.taken } : m
          ),
        })),

      addMedication: (med) =>
        set((state) => {
          const newMed: Medication = {
            ...med,
            id: `med-${Date.now()}-${Math.random()}`,
            taken: false,
          };
          return { medications: [...state.medications, newMed] };
        }),

      removeMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        })),

      logWater: (amount) =>
        set((state) => ({
          waterIntake: Math.max(0, state.waterIntake + amount),
        })),

      resetWater: () => set({ waterIntake: 0 }),
    }),
    {
      name: "healthbeast-health-v1",
    }
  )
);
