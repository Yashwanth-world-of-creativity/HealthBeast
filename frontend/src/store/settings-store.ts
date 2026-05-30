import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  emailAlerts: boolean;
  whatsappReminders: boolean;
  dataSharing: boolean;
  setEmailAlerts: (value: boolean) => void;
  setWhatsappReminders: (value: boolean) => void;
  setDataSharing: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      emailAlerts: true,
      whatsappReminders: false,
      dataSharing: true,
      setEmailAlerts: (value) => set({ emailAlerts: value }),
      setWhatsappReminders: (value) => set({ whatsappReminders: value }),
      setDataSharing: (value) => set({ dataSharing: value }),
    }),
    {
      name: "healthbeast-settings-v1",
    }
  )
);
