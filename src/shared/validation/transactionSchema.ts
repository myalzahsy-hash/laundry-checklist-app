import { z } from "zod";
import {
  MAX_CUSTOMER_NAME_LENGTH,
  MAX_ITEM_NAME_LENGTH,
  MAX_ITEM_QUANTITY,
  MAX_NOTES_LENGTH,
} from "@/shared/constants";

const dynamicItemSchema = z.object({
  name: z
    .string()
    .min(1, "Nama barang wajib diisi")
    .max(MAX_ITEM_NAME_LENGTH, `Nama barang maksimal ${MAX_ITEM_NAME_LENGTH} karakter`),
  quantity: z
    .number({ message: "Jumlah harus berupa angka" })
    .int("Jumlah harus berupa bilangan bulat")
    .min(1, "Jumlah minimal 1")
    .max(MAX_ITEM_QUANTITY, `Jumlah maksimal ${MAX_ITEM_QUANTITY}`),
});

export const transactionFormSchema = z.object({
  receiptSequence: z
    .number({ message: "Nomor urut harus berupa angka" })
    .int("Nomor urut harus berupa bilangan bulat")
    .min(1, "Nomor urut wajib diisi")
    .max(99999, "Nomor urut maksimal 5 digit"),
  customerName: z
    .string()
    .min(1, "Nama pelanggan wajib diisi")
    .max(MAX_CUSTOMER_NAME_LENGTH, `Nama pelanggan maksimal ${MAX_CUSTOMER_NAME_LENGTH} karakter`),
  transactionDate: z.string().min(1, "Tanggal masuk wajib diisi"),
  fixedItems: z.object({
    pakaian: z
      .number({ message: "Jumlah harus berupa angka" })
      .int("Jumlah harus berupa bilangan bulat")
      .min(0, "Jumlah tidak boleh negatif")
      .max(MAX_ITEM_QUANTITY, `Jumlah maksimal ${MAX_ITEM_QUANTITY}`),
    celanaDalam: z
      .number({ message: "Jumlah harus berupa angka" })
      .int("Jumlah harus berupa bilangan bulat")
      .min(0, "Jumlah tidak boleh negatif")
      .max(MAX_ITEM_QUANTITY, `Jumlah maksimal ${MAX_ITEM_QUANTITY}`),
    bh: z
      .number({ message: "Jumlah harus berupa angka" })
      .int("Jumlah harus berupa bilangan bulat")
      .min(0, "Jumlah tidak boleh negatif")
      .max(MAX_ITEM_QUANTITY, `Jumlah maksimal ${MAX_ITEM_QUANTITY}`),
    kaosKaki: z
      .number({ message: "Jumlah harus berupa angka" })
      .int("Jumlah harus berupa bilangan bulat")
      .min(0, "Jumlah tidak boleh negatif")
      .max(MAX_ITEM_QUANTITY, `Jumlah maksimal ${MAX_ITEM_QUANTITY}`),
  }),
  dynamicItems: z.array(dynamicItemSchema),
  notes: z.string().max(MAX_NOTES_LENGTH, `Catatan maksimal ${MAX_NOTES_LENGTH} karakter`).optional(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

export type DynamicItemFormData = z.infer<typeof dynamicItemSchema>;

export function formatReceiptNumber(dateStr: string, sequence: number): string {
  if (!dateStr || !sequence) return "";
  const date = new Date(dateStr);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(5, "0");
  return `TRX/${yy}${mm}${dd}/${seq}`;
}
