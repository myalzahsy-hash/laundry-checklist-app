import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
import { getDb, ensureAnonymousAuth } from "@/data/firebase";

interface PortalTransaction {
  id: string;
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

interface PortalSettings {
  outletName: string;
  outletFooter: string;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function padZero(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export async function searchTransaction(
  monthKey: string,
  receiptSequence: number,
): Promise<{ transaction: PortalTransaction | null; settings: PortalSettings }> {
  await ensureAnonymousAuth();
  const db = getDb();

  const settingsSnap = await getDoc(doc(db, "settings", "app"));
  let settings: PortalSettings = { outletName: "Laundry", outletFooter: "" };
  if (settingsSnap.exists()) {
    const d = settingsSnap.data();
    settings = {
      outletName: (d.outletName as string) || "Laundry",
      outletFooter: (d.outletFooter as string) || "",
    };
  }

  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const startDate = `${yearStr}-${padZero(month)}-01`;
  const endDate = `${yearStr}-${padZero(month)}-${padZero(getDaysInMonth(year, month))}`;

  const txRef = collection(db, "outlets", settings.outletName, "transactions");
  const q = query(
    txRef,
    where("transactionDate", ">=", startDate),
    where("transactionDate", "<=", endDate),
    where("receiptSequence", "==", receiptSequence),
    limit(1),
  );

  const txSnap = await getDocs(q);
  if (txSnap.empty) {
    return { transaction: null, settings };
  }

  const docSnap = txSnap.docs[0];
  if (!docSnap) {
    return { transaction: null, settings };
  }

  const data = docSnap.data();
  const tx: PortalTransaction = {
    id: docSnap.id,
    receiptNumber: (data.receiptNumber as string) ?? "",
    receiptSequence: (data.receiptSequence as number) ?? 0,
    customerName: (data.customerName as string) ?? "",
    transactionDate: (data.transactionDate as string) ?? "",
    outletName: (data.outletName as string) ?? "",
    fixedItems: data.fixedItems as PortalTransaction["fixedItems"],
    dynamicItems: (data.dynamicItems as Array<{ name: string; quantity: number }>) ?? [],
    totalItemCount: (data.totalItemCount as number) ?? 0,
    notes: (data.notes as string) ?? "",
  };

  return { transaction: tx, settings };
}
