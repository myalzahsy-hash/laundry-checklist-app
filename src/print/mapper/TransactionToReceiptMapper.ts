import type { TransactionDocument } from "@/data/repositories/firestore/TransactionRepository";
import type { ReceiptPrintModel, ReceiptItem } from "@/print/types/ReceiptPrintModel";

export function mapTransactionToReceipt(
  tx: TransactionDocument,
  notes: string,
  footer: string,
): ReceiptPrintModel {
  const fixedItems: ReceiptItem[] = [
    { name: "Pakaian", quantity: tx.fixedItems.pakaian },
    { name: "Celana Dalam", quantity: tx.fixedItems.celanaDalam },
    { name: "BH", quantity: tx.fixedItems.bh },
    { name: "Kaos Kaki", quantity: tx.fixedItems.kaosKaki },
  ].filter((item) => item.quantity > 0);

  const dynamicItems: ReceiptItem[] = tx.dynamicItems
    .filter((item) => item.quantity > 0)
    .map((item) => ({ name: item.name, quantity: item.quantity }));

  return {
    outletName: tx.outletName,
    receiptNumber: tx.receiptNumber,
    customerName: tx.customerName,
    transactionDate: tx.transactionDate,
    totalItemCount: tx.totalItemCount,
    fixedItems,
    dynamicItems,
    notes: notes ?? "",
    footer: footer ?? "",
  };
}
