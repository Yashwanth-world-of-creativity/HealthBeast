import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  bloodGroup: string;
  activityLevel: string;
  allergies: string;
  existingConditions: string;
  onboarded: boolean;
}

interface HealthState {
  symptoms: SymptomLog[];
  reports: ReportFile[];
  medications: Medication[];
  waterIntake: number; // in ml
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchHealthData: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addSymptom: (symptom: Omit<SymptomLog, "id" | "date">) => Promise<void>;
  removeSymptom: (id: string) => Promise<void>;
  addReport: (report: Omit<ReportFile, "id" | "date">) => Promise<void>;
  uploadReport: (file: File) => Promise<void>;
  removeReport: (id: string) => Promise<void>;
  toggleMedication: (id: string) => Promise<void>;
  addMedication: (med: Omit<Medication, "id" | "taken">) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  logWater: (amount: number) => Promise<void>;
  resetWater: () => Promise<void>;
  clearStore: () => void;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      symptoms: [],
      reports: [],
      medications: [],
      waterIntake: 0,
      user: null,
      isLoading: false,
      error: null,

      fetchHealthData: async () => {
        set({ isLoading: true, error: null });
        try {
          const [symptomsRes, medsRes, waterRes, reportsRes, profileRes] = await Promise.all([
            fetch("/api/symptoms"),
            fetch("/api/medications"),
            fetch("/api/water"),
            fetch("/api/reports"),
            fetch("/api/auth/profile"),
          ]);

          if (
            symptomsRes.status === 401 ||
            medsRes.status === 401 ||
            waterRes.status === 401 ||
            reportsRes.status === 401 ||
            profileRes.status === 401
          ) {
            set({
              user: null,
              symptoms: [],
              reports: [],
              medications: [],
              waterIntake: 0,
              isLoading: false,
            });
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register") && window.location.pathname !== "/") {
              window.location.href = "/login";
            }
            return;
          }

          if (!symptomsRes.ok || !medsRes.ok || !waterRes.ok || !reportsRes.ok || !profileRes.ok) {
            throw new Error("Failed to fetch user health metrics from backend.");
          }

          const [symptoms, medications, waterData, reports, profileData] = await Promise.all([
            symptomsRes.json(),
            medsRes.json(),
            waterRes.json(),
            reportsRes.json(),
            profileRes.json(),
          ]);

          set({
            symptoms,
            medications,
            waterIntake: waterData.waterIntake,
            reports,
            user: profileData.user || null,
            isLoading: false,
          });
        } catch (err) {
          console.error("fetchHealthData error:", err);
          set({ error: getErrorMessage(err), isLoading: false });
        }
      },

      updateUserProfile: async (profileUpdates) => {
        try {
          const res = await fetch("/api/auth/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileUpdates),
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to update profile details.");
          }
          const data = await res.json();
          if (data.user) {
            set({ user: data.user });
          }
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      addSymptom: async (symptom) => {
        try {
          const res = await fetch("/api/symptoms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(symptom),
          });
          if (!res.ok) throw new Error("Failed to log symptom");
          const newSymptom = await res.json();
          set((state) => ({
            symptoms: [...state.symptoms, newSymptom],
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      removeSymptom: async (id) => {
        try {
          const res = await fetch(`/api/symptoms?id=${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to remove symptom");
          set((state) => ({
            symptoms: state.symptoms.filter((item) => item.id !== id),
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      addReport: async (report) => {
        try {
          const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(report),
          });
          if (!res.ok) throw new Error("Failed to save report");
          const newReport = await res.json();
          set((state) => ({
            reports: [newReport, ...state.reports],
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      uploadReport: async (file) => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/reports/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Failed to upload and parse report");
          const newReport = await res.json();
          set((state) => ({
            reports: [newReport, ...state.reports],
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      removeReport: async (id) => {
        try {
          const res = await fetch(`/api/reports?id=${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to remove report");
          set((state) => ({
            reports: state.reports.filter((item) => item.id !== id),
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      addMedication: async (med) => {
        try {
          const res = await fetch("/api/medications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(med),
          });
          if (!res.ok) throw new Error("Failed to save medication");
          const newMed = await res.json();
          set((state) => ({
            medications: [...state.medications, newMed],
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      toggleMedication: async (id) => {
        try {
          const res = await fetch(`/api/medications?id=${id}`, {
            method: "PUT",
          });
          if (!res.ok) throw new Error("Failed to update medication status");
          const updatedMed = await res.json();
          set((state) => ({
            medications: state.medications.map((m) => (m.id === id ? updatedMed : m)),
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      removeMedication: async (id) => {
        try {
          const res = await fetch(`/api/medications?id=${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete medication");
          set((state) => ({
            medications: state.medications.filter((m) => m.id !== id),
          }));
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      logWater: async (amount) => {
        try {
          const res = await fetch("/api/water", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
          });
          if (!res.ok) throw new Error("Failed to log water");
          const data = await res.json();
          set({ waterIntake: data.waterIntake });
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      resetWater: async () => {
        try {
          const res = await fetch("/api/water", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 0 }),
          });
          if (!res.ok) throw new Error("Failed to reset water");
          const data = await res.json();
          set({ waterIntake: data.waterIntake });
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      },

      clearStore: () => {
        set({
          symptoms: [],
          reports: [],
          medications: [],
          waterIntake: 0,
          user: null,
          error: null,
        });
      },
    }),
    {
      name: "healthbeast-health-v1",
    }
  )
);

