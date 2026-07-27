import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppConfig {
  outletName: string;
  outletFooter: string;
}

interface AppConfigStore extends AppConfig {
  setOutletName: (name: string) => void;
  setOutletFooter: (footer: string) => void;
}

export const useAppConfigStore = create<AppConfigStore>()(
  persist(
    (set) => ({
      outletName: "",
      outletFooter: "",
      setOutletName: (name: string) => set({ outletName: name }),
      setOutletFooter: (footer: string) => set({ outletFooter: footer }),
    }),
    {
      name: "laundry-app-config",
    },
  ),
);
