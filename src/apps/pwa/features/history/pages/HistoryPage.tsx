import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppConfigStore } from "@/shared/lib/config-store";
import { TransactionService } from "@/core/services/TransactionService";
import type { TransactionDocument } from "@/data/repositories/firestore/TransactionRepository";
import { TransactionCard } from "@/apps/pwa/features/history/components/TransactionCard";
import { SearchInput } from "@/apps/pwa/features/history/components/SearchInput";
import {
  HistoryFilter,
  type FilterType,
} from "@/apps/pwa/features/history/components/HistoryFilter";
import { filterByDateRange, formatFilterLabel } from "@/apps/pwa/features/history/components/filterByDateRange";
import { Skeleton } from "@/ui/components/ui/skeleton";
import { Card, CardContent } from "@/ui/components/ui/card";
import { Package, X } from "lucide-react";

function sortByDateDesc(a: TransactionDocument, b: TransactionDocument): number {
  const dateCmp = b.transactionDate.localeCompare(a.transactionDate);
  if (dateCmp !== 0) return dateCmp;
  return b.receiptSequence - a.receiptSequence;
}

export default function HistoryPage() {
  const outletName = useAppConfigStore((s) => s.outletName);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<TransactionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await TransactionService.getAll(outletName);
    if (result.success) {
      setTransactions(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [outletName]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions
      .filter((t) => {
        const matchesSearch =
          !q ||
          t.receiptNumber.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q);
        const matchesFilter = filterByDateRange(t.transactionDate, activeFilter, dateRange);
        return matchesSearch && matchesFilter;
      })
      .sort(sortByDateDesc);
  }, [transactions, search, activeFilter, dateRange]);

  function handleFilterApply(filter: FilterType, range: { from: string; to: string }) {
    setActiveFilter(filter);
    setDateRange(range);
  }

  function handleFilterReset() {
    setActiveFilter("all");
    setDateRange({ from: "", to: "" });
  }

  const hasActiveFilter = activeFilter !== "all";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Riwayat</h2>

      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari berdasarkan nomor nota atau nama..."
        />
        <HistoryFilter
          activeFilter={activeFilter}
          dateRange={dateRange}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />
      </div>

      {hasActiveFilter && (
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {formatFilterLabel(activeFilter, dateRange)}
            <button
              type="button"
              onClick={handleFilterReset}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
              aria-label="Hapus filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="border-destructive/50">
          <CardContent className="p-4 text-center text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search || hasActiveFilter
              ? "Tidak ada transaksi yang cocok."
              : "Belum ada transaksi."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TransactionCard
              key={t.id}
              receiptNumber={t.receiptNumber}
              customerName={t.customerName}
              transactionDate={t.transactionDate}
              totalItemCount={t.totalItemCount}
              onClick={() => navigate(`/riwayat/${t.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
