export interface ReceiptItem {
  name: string;
  quantity: number;
}

export interface ReceiptPrintModel {
  outletName: string;
  receiptNumber: string;
  customerName: string;
  transactionDate: string;
  totalItemCount: number;
  fixedItems: ReceiptItem[];
  dynamicItems: ReceiptItem[];
  notes: string;
  footer: string;
}
