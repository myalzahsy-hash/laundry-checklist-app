import { useState, useEffect, useCallback, useRef } from "react";
import SearchForm from "@/apps/portal/components/SearchForm";
import type { SearchFormHandle } from "@/apps/portal/components/SearchForm";
import LoadingView from "@/apps/portal/components/LoadingView";
import ReceiptView from "@/apps/portal/components/ReceiptView";
import ErrorView from "@/apps/portal/components/ErrorView";
import { searchTransaction } from "@/apps/portal/portal-service";

type View = "search" | "loading" | "result" | "error";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function buildMonthOptions(): Array<{ value: string; label: string }> {
  const now = new Date();
  const options: Array<{ value: string; label: string }> = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const value = `${year}-${month < 10 ? "0" + month : month}`;
    const label = `${MONTH_NAMES[d.getMonth()]} ${year}`;
    options.push({ value, label });
  }
  return options;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  return `${now.getFullYear()}-${month < 10 ? "0" + month : month}`;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

export default function App() {
  const searchFormRef = useRef<SearchFormHandle>(null);
  const [view, setView] = useState<View>("search");
  const [outletName, setOutletName] = useState("Laundry");
  const [searchLoading, setSearchLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const [receiptNumber, setReceiptNumber] = useState("-");
  const [customerName, setCustomerName] = useState("-");
  const [transactionDate, setTransactionDate] = useState<Date | null>(null);
  const [items, setItems] = useState<Array<{ label: string; qty: number }>>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [notes, setNotes] = useState("");

  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const monthOptions = buildMonthOptions();
  const defaultMonth = getCurrentMonthKey();

  useEffect(() => {
    import("@/data/firebase").then(({ isFirebaseReady, ensureAnonymousAuth }) => {
      if (isFirebaseReady()) {
        ensureAnonymousAuth().then(() => setFirebaseReady(true)).catch(() => setFirebaseReady(true));
      } else {
        setInitError("Firebase belum dikonfigurasi.");
      }
    }).catch(() => {
      setInitError("Gagal memuat Firebase.");
    });
  }, []);

  const fetchSettings = useCallback(async () => {
    const { getDb } = await import("@/data/firebase");
    const { doc, getDoc } = await import("firebase/firestore");
    const db = getDb();
    const snap = await getDoc(doc(db, "settings", "app"));
    if (snap.exists()) {
      const d = snap.data();
      const name = (d.outletName as string) || "Laundry";
      setOutletName(name);
      return { outletName: name, outletFooter: (d.outletFooter as string) || "" };
    }
    return { outletName: "Laundry", outletFooter: "" };
  }, []);

  useEffect(() => {
    if (firebaseReady) {
      fetchSettings().catch(() => {});
    }
  }, [firebaseReady, fetchSettings]);

  async function handleSearch(monthKey: string, receiptSequence: number) {
    setSearchLoading(true);
    setView("loading");

    try {
      const result = await searchTransaction(monthKey, receiptSequence);
      setOutletName(result.settings.outletName);

      if (result.transaction) {
        const tx = result.transaction;
        const txDate = parseDate(tx.transactionDate);
        const fixed = tx.fixedItems;
        const dynamicItems: Array<{ label: string; qty: number }> = [];
        if (fixed.pakaian > 0) dynamicItems.push({ label: "Pakaian", qty: fixed.pakaian });
        if (fixed.bh > 0) dynamicItems.push({ label: "BH / Bra", qty: fixed.bh });
        if (fixed.celanaDalam > 0) dynamicItems.push({ label: "Celana Dalam", qty: fixed.celanaDalam });
        if (fixed.kaosKaki > 0) dynamicItems.push({ label: "Kaos Kaki", qty: fixed.kaosKaki });
        for (const item of tx.dynamicItems) {
          if (item.quantity > 0) dynamicItems.push({ label: item.name, qty: item.quantity });
        }

        setReceiptNumber(tx.receiptNumber || String(receiptSequence).padStart(5, "0"));
        setCustomerName(tx.customerName || "-");
        setTransactionDate(txDate);
        setItems(dynamicItems);
        setTotalItems(tx.totalItemCount);
        setNotes(tx.notes || "");
        setView("result");
      } else {
        setErrorTitle("Data Tidak Ditemukan");
        setErrorMessage(`
          <p class="mb-3">Pastikan:</p>
          <ul class="list-disc pl-5 space-y-1.5 text-gray-600">
            <li>Bulan sudah benar.</li>
            <li>Nomor transaksi sudah benar.</li>
          </ul>
          <p class="mt-4 text-xs text-gray-400 text-center italic">Data mungkin masih dalam proses input oleh petugas laundry.</p>
        `);
        setView("error");
        searchFormRef.current?.focusNota();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Terjadi gangguan. Silakan coba lagi.";
      setErrorTitle("Terjadi Gangguan");
      setErrorMessage(`
        <p class="mb-2">${msg}</p>
        <p class="text-xs text-gray-400">Silakan coba beberapa saat lagi.</p>
      `);
      setView("error");
      searchFormRef.current?.focusNota();
    } finally {
      setSearchLoading(false);
    }
  }

  function handleBack() {
    setView("search");
  }

  if (initError) {
    return (
      <main className="max-w-[420px] w-full">
        <section className="flex flex-col items-center bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Koneksi Bermasalah</h2>
          <p className="text-sm text-gray-500 mb-6">{initError}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-[420px] w-full">
      {view === "search" && (
        <SearchForm
          ref={searchFormRef}
          outletName={outletName}
          searchLoading={searchLoading}
          monthOptions={monthOptions}
          defaultMonth={defaultMonth}
          onSearch={handleSearch}
        />
      )}

      {view === "loading" && <LoadingView />}

      {view === "result" && (
        <ReceiptView
          outletName={outletName}
          receiptNumber={receiptNumber}
          customerName={customerName}
          transactionDate={transactionDate}
          items={items}
          totalItems={totalItems}
          notes={notes}
          onBack={handleBack}
        />
      )}

      {view === "error" && (
        <ErrorView
          title={errorTitle}
          message={errorMessage}
          onRetry={handleBack}
        />
      )}
    </main>
  );
}
