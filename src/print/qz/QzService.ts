import type { QzPrinter } from "@/print/types/QzTypes";

declare global {
  interface Window {
    qz?: {
      websocket?: {
        connect: () => Promise<void>;
        disconnect: () => Promise<void>;
        isActive: () => boolean;
      };
      printers?: {
        find: () => Promise<string[]>;
        getDetails?: (name?: string) => Promise<QzPrinter[]>;
      };
      configs?: {
        create: (printer: string, options?: Record<string, unknown>) => Record<string, unknown>;
      };
      security?: {
        setCertificatePromise: (fn: () => Promise<string>) => void;
        setSignaturePromise: (fn: (opts?: unknown) => Promise<string>) => void;
      };
      print?: (config: unknown, data: unknown[]) => Promise<void>;
    };
  }
}

// Lebar kertas thermal (mm). Ganti ke 80 jika printer Anda pakai roll 80mm.
const RECEIPT_WIDTH_MM = 58;
// Batas atas tinggi kanvas render (mm). Dibuat longgar (bukan tinggi pas)
// karena panjang struk bervariasi tergantung jumlah item/catatan.
// Untuk printer continuous-feed, sisa kertas kosong di ujung biasanya
// dipotong sesuai posisi cut milik driver, bukan oleh nilai ini.
const RECEIPT_MAX_HEIGHT_MM = 297;
// DPI umum printer thermal 203dpi ≈ 8 dots/mm. Ubah ke 6 untuk 180dpi
// atau 12 untuk 300dpi jika printer Anda berbeda.
const RECEIPT_DENSITY_DOTS_PER_MM = 8;

let qzScriptLoaded = false;
let qzScriptLoading = false;
let qzScriptPromise: Promise<boolean> | null = null;

function loadQzScript(): Promise<boolean> {
  if (qzScriptLoaded) return Promise.resolve(true);
  if (qzScriptLoading && qzScriptPromise) return qzScriptPromise;

  qzScriptLoading = true;
  qzScriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.3/qz-tray.min.js";
    script.async = true;
    script.onload = () => {
      qzScriptLoaded = true;
      qzScriptLoading = false;
      resolve(true);
    };
    script.onerror = () => {
      qzScriptLoading = false;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return qzScriptPromise;
}

async function getQz(): Promise<typeof window.qz | null> {
  const loaded = await loadQzScript();
  if (!loaded) return null;
  return window.qz ?? null;
}

export const QzService = {
  async connect(): Promise<{ success: boolean; error?: string }> {
    const qz = await getQz();
    if (!qz?.websocket) {
      return { success: false, error: "QZ Tray tidak tersedia di browser ini." };
    }
    if (qz.websocket.isActive()) {
      return { success: true };
    }
    try {
      await qz.websocket.connect();
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("WebSocket") || msg.includes("ECONNREFUSED")) {
        return { success: false, error: "QZ Tray belum berjalan. Silakan buka aplikasi QZ Tray." };
      }
      return { success: false, error: `Gagal menghubungkan QZ Tray: ${msg}` };
    }
  },

  async disconnect(): Promise<void> {
    const qz = await getQz();
    if (qz?.websocket?.isActive()) {
      await qz.websocket.disconnect();
    }
  },

  async isConnected(): Promise<boolean> {
    const qz = await getQz();
    return qz?.websocket?.isActive() ?? false;
  },

  async getPrinters(): Promise<{ success: true; printers: string[] } | { success: false; error: string }> {
    const qz = await getQz();
    if (!qz?.websocket?.isActive()) {
      return { success: false, error: "QZ Tray belum terhubung." };
    }
    if (!qz.printers) {
      return { success: false, error: "QZ Tray tidak mendukung pengambilan daftar printer." };
    }
    try {
      const printers = await qz.printers.find();
      return { success: true, printers };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Gagal mengambil daftar printer: ${msg}` };
    }
  },

  isQzAvailable(): boolean {
    return Platform.isDesktop;
  },

  async printHTML(
    html: string,
    printerName: string,
  ): Promise<{ success: boolean; error?: string }> {
    const qz = await getQz();
    if (!qz?.websocket?.isActive()) {
      return { success: false, error: "QZ Tray belum terhubung." };
    }
    if (!qz.print || !qz.configs) {
      return { success: false, error: "QZ Tray tidak mendukung pencetakan." };
    }
    try {
      const config = qz.configs.create(printerName, {
        scaleContent: true,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        size: { width: RECEIPT_WIDTH_MM, height: RECEIPT_MAX_HEIGHT_MM },
        units: "mm",
        density: RECEIPT_DENSITY_DOTS_PER_MM,
      });
      await qz.print(config, [
        {
          type: "pixel",
          format: "html",
          flavor: "plain",
          data: html,
          options: { pageWidth: RECEIPT_WIDTH_MM },
        },
      ]);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not found") || msg.includes("Not Found")) {
        return { success: false, error: "Printer tidak ditemukan." };
      }
      return { success: false, error: `Gagal mencetak: ${msg}` };
    }
  },

  async printRaw(
    commands: string[],
    printerName: string,
  ): Promise<{ success: boolean; error?: string }> {
    const qz = await getQz();
    if (!qz?.websocket?.isActive()) {
      return { success: false, error: "QZ Tray belum terhubung." };
    }
    if (!qz.print || !qz.configs) {
      return { success: false, error: "QZ Tray tidak mendukung pencetakan." };
    }
    try {
      // Raw printing tidak butuh size/units/density/scaleContent — printer
      // mencetak persis sesuai command ESC/POS yang dikirim.
      const config = qz.configs.create(printerName);
      await qz.print(config, commands);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not found") || msg.includes("Not Found")) {
        return { success: false, error: "Printer tidak ditemukan." };
      }
      return { success: false, error: `Gagal mencetak: ${msg}` };
    }
  },
};

import { Platform } from "@/shared/lib/platform";
