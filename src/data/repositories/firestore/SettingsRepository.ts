import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/data/firebase";

export interface AppSettings {
  outletName: string;
  outletFooter: string;
  updatedAt?: Date;
}

function settingsDoc() {
  return doc(getDb(), "settings", "app");
}

export const SettingsRepository = {
  async get(): Promise<AppSettings | null> {
    const snap = await getDoc(settingsDoc());
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      outletName: d.outletName as string,
      outletFooter: (d.outletFooter as string) ?? "",
      updatedAt: (d.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    };
  },

  async save(outletName: string, outletFooter: string): Promise<void> {
    await setDoc(settingsDoc(), {
      outletName,
      outletFooter,
      updatedAt: serverTimestamp(),
    });
  },
};
