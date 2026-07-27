import { SettingsRepository } from "@/data/repositories/firestore/SettingsRepository";

function getErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("permission-denied")) return "permission-denied";
    if (msg.includes("unauthenticated")) return "unauthenticated";
    if (msg.includes("unavailable")) return "unavailable";
  }
  return "unknown";
}

function getErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  const MESSAGES: Record<string, string> = {
    "permission-denied": "Akses ditolak. Periksa izin Firestore.",
    unauthenticated: "Sesi berakhir. Muat ulang halaman.",
    unavailable: "Layanan tidak tersedia. Periksa koneksi internet.",
  };
  return MESSAGES[code] ?? "Terjadi kesalahan. Coba lagi.";
}

export const SettingsService = {
  async get(): Promise<
    { success: true; outletName: string; outletFooter: string } | { success: false; error: string }
  > {
    try {
      const settings = await SettingsRepository.get();
      return {
        success: true,
        outletName: settings?.outletName ?? "",
        outletFooter: settings?.outletFooter ?? "",
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async save(
    outletName: string,
    outletFooter: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await SettingsRepository.save(outletName, outletFooter);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
