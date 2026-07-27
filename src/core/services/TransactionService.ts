import {
  TransactionRepository,
  type TransactionData,
  type TransactionDocument,
} from "@/data/repositories/firestore/TransactionRepository";
import { formatReceiptNumber } from "@/shared/validation/transactionSchema";

type CreateInput = {
  receiptSequence: number;
  customerName: string;
  transactionDate: string;
  outletName: string;
  fixedItems: {
    pakaian: number;
    celanaDalam: number;
    bh: number;
    kaosKaki: number;
  };
  dynamicItems: Array<{ name: string; quantity: number }>;
  totalItemCount: number;
  notes: string;
};

function mapToTransactionData(input: CreateInput): TransactionData {
  return {
    receiptNumber: formatReceiptNumber(input.transactionDate, input.receiptSequence),
    receiptSequence: input.receiptSequence,
    customerName: input.customerName,
    transactionDate: input.transactionDate,
    outletName: input.outletName,
    fixedItems: input.fixedItems,
    dynamicItems: input.dynamicItems,
    totalItemCount: input.totalItemCount,
    notes: input.notes ?? "",
  };
}

function getErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("permission-denied")) return "permission-denied";
    if (msg.includes("unauthenticated")) return "unauthenticated";
    if (msg.includes("unavailable")) return "unavailable";
    if (msg.includes("deadline-exceeded")) return "deadline-exceeded";
    if (msg.includes("not-found")) return "not-found";
    if (msg.includes("already-exists")) return "already-exists";
    if (msg.includes("invalid-argument")) return "invalid-argument";
  }
  return "unknown";
}

function getErrorMessage(error: unknown): string {
  const code = getErrorCode(error);

  const MESSAGES: Record<string, string> = {
    "permission-denied": "Akses ditolak. Periksa izin Firestore.",
    unauthenticated: "Sesi berakhir. Muat ulang halaman.",
    unavailable: "Layanan tidak tersedia. Periksa koneksi internet.",
    "deadline-exceeded": "Waktu permintaan habis. Coba lagi.",
    "not-found": "Data tidak ditemukan.",
    "already-exists": "Data sudah ada.",
    "invalid-argument": "Data tidak valid. Periksa input.",
    "failed-precondition": "Operasi gagal. Coba lagi.",
    "resource-exhausted": "Kuota habis. Coba lagi nanti.",
    aborted: "Operasi dibatalkan. Coba lagi.",
    cancelled: "Operasi dibatalkan.",
  };

  return MESSAGES[code] ?? "Terjadi kesalahan. Coba lagi.";
}

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

export const TransactionService = {
  async create(input: CreateInput): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const data = mapToTransactionData(input);
      const id = await TransactionRepository.create(input.outletName, data);
      return { success: true, id };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async getAll(outletName: string): Promise<ServiceResult<TransactionDocument[]>> {
    try {
      const data = await TransactionRepository.getAll(outletName);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async getById(
    outletName: string,
    transactionId: string,
  ): Promise<ServiceResult<TransactionDocument>> {
    try {
      const data = await TransactionRepository.getById(outletName, transactionId);
      if (!data) return { success: false, error: "Transaksi tidak ditemukan." };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async update(
    outletName: string,
    transactionId: string,
    data: Partial<TransactionData>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await TransactionRepository.update(outletName, transactionId, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async delete(
    outletName: string,
    transactionId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await TransactionRepository.delete(outletName, transactionId);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
