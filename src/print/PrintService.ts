import type { TransactionDocument } from "@/data/repositories/firestore/TransactionRepository";
import type { ReceiptPrintModel } from "@/print/types/ReceiptPrintModel";
import { mapTransactionToReceipt } from "@/print/mapper/TransactionToReceiptMapper";
import { generateReceiptHTML } from "@/print/templates/ReceiptTemplate";
import { generateReceiptCommands } from "@/print/templates/ReceiptRawTemplate";
import { SettingsRepository } from "@/data/repositories/firestore/SettingsRepository";
import { QzService } from "@/print/qz/QzService";
import { PrinterManager } from "@/print/services/PrinterManager";

type PrintResult = { success: true } | { success: false; error: string };

export const PrintService = {
  async buildReceiptHTML(tx: TransactionDocument): Promise<string> {
    const settings = await SettingsRepository.get();
    const notes = tx.notes ?? "";
    const footer = settings?.outletFooter ?? "";
    const model: ReceiptPrintModel = mapTransactionToReceipt(tx, notes, footer);
    return generateReceiptHTML(model);
  },

  async buildReceiptCommands(tx: TransactionDocument): Promise<string[]> {
    const settings = await SettingsRepository.get();
    const notes = tx.notes ?? "";
    const footer = settings?.outletFooter ?? "";
    const model: ReceiptPrintModel = mapTransactionToReceipt(tx, notes, footer);
    return generateReceiptCommands(model);
  },

  async print(tx: TransactionDocument): Promise<PrintResult> {
    const printerName = PrinterManager.getSelectedPrinter();
    if (!printerName) {
      return { success: false, error: "Silakan pilih printer terlebih dahulu pada Pengaturan." };
    }

    const conn = await QzService.connect();
    if (!conn.success) {
      return { success: false, error: conn.error ?? "QZ Tray belum terhubung." };
    }

    const commands = await this.buildReceiptCommands(tx);
    const printResult = await QzService.printRaw(commands, printerName);
    if (printResult.success) {
      return { success: true };
    }
    return { success: false, error: printResult.error ?? "Gagal mencetak." };
  },
};
