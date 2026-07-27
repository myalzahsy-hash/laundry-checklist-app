const PRINTER_STORAGE_KEY = "laundry-selected-printer";

export const PrinterManager = {
  getSelectedPrinter(): string | null {
    try {
      return localStorage.getItem(PRINTER_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  setSelectedPrinter(printerName: string): void {
    try {
      localStorage.setItem(PRINTER_STORAGE_KEY, printerName);
    } catch {
      // localStorage not available
    }
  },

  clearSelectedPrinter(): void {
    try {
      localStorage.removeItem(PRINTER_STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  },
};
