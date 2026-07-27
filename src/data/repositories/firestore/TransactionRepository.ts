import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb } from "@/data/firebase";

export interface TransactionData {
  receiptNumber: string;
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
}

export interface TransactionDocument extends TransactionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

function transactionsCollection(outletName: string) {
  return collection(getDb(), "outlets", outletName, "transactions");
}

function transactionDoc(outletName: string, transactionId: string) {
  return doc(getDb(), "outlets", outletName, "transactions", transactionId);
}

function mapSnapshot(doc: { id: string; data: () => Record<string, unknown> }): TransactionDocument {
  const d = doc.data();
  return {
    id: doc.id,
    receiptNumber: d.receiptNumber as string,
    receiptSequence: d.receiptSequence as number,
    customerName: d.customerName as string,
    transactionDate: d.transactionDate as string,
    outletName: d.outletName as string,
    fixedItems: d.fixedItems as TransactionData["fixedItems"],
    dynamicItems: d.dynamicItems as TransactionData["dynamicItems"],
    totalItemCount: d.totalItemCount as number,
    notes: (d.notes as string) ?? "",
    createdAt: (d.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (d.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

export const TransactionRepository = {
  async create(outletName: string, data: TransactionData): Promise<string> {
    const docRef = await addDoc(transactionsCollection(outletName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAll(outletName: string): Promise<TransactionDocument[]> {
    const q = query(transactionsCollection(outletName), orderBy("transactionDate", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSnapshot);
  },

  async getById(outletName: string, transactionId: string): Promise<TransactionDocument | null> {
    const snap = await getDoc(transactionDoc(outletName, transactionId));
    if (!snap.exists()) return null;
    return mapSnapshot(snap);
  },

  async update(
    outletName: string,
    transactionId: string,
    data: Partial<TransactionData>,
  ): Promise<void> {
    await updateDoc(transactionDoc(outletName, transactionId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(outletName: string, transactionId: string): Promise<void> {
    await deleteDoc(transactionDoc(outletName, transactionId));
  },
};
