import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Filter, Calendar } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type FilterType = "all" | "today" | "thisWeek" | "thisMonth" | "custom";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "today", label: "Hari Ini" },
  { value: "thisWeek", label: "Minggu Ini" },
  { value: "thisMonth", label: "Bulan Ini" },
  { value: "custom", label: "Rentang Tanggal" },
];

interface HistoryFilterProps {
  activeFilter: FilterType;
  dateRange: { from: string; to: string };
  onApply: (filter: FilterType, dateRange: { from: string; to: string }) => void;
  onReset: () => void;
}

export function HistoryFilter({ activeFilter, dateRange, onApply, onReset }: HistoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<FilterType>(activeFilter);
  const [pendingRange, setPendingRange] = useState(dateRange);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPendingFilter(activeFilter);
    setPendingRange(dateRange);
  }, [activeFilter, dateRange]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setPendingFilter(activeFilter);
        setPendingRange(dateRange);
      }
    },
    [open, activeFilter, dateRange],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPendingFilter(activeFilter);
        setPendingRange(dateRange);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, activeFilter, dateRange]);

  function handleApply() {
    onApply(pendingFilter, pendingRange);
    setOpen(false);
  }

  function handleReset() {
    setPendingFilter("all");
    setPendingRange({ from: "", to: "" });
    onReset();
    setOpen(false);
  }

  const hasActive = activeFilter !== "all";

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant={hasActive ? "default" : "outline"}
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter"
      >
        <Filter className="h-4 w-4" />
      </Button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-[150] mt-2 w-72 rounded-lg border bg-background p-4 shadow-lg"
        >
          <p className="mb-3 text-sm font-medium">Riwayat</p>

          <div className="space-y-1">
            {FILTER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                  pendingFilter === opt.value && "bg-accent",
                )}
                onClick={() => setPendingFilter(opt.value)}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    pendingFilter === opt.value ? "border-primary" : "border-muted-foreground/40",
                  )}
                >
                  {pendingFilter === opt.value && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </span>
                {opt.label}
              </label>
            ))}
          </div>

          {pendingFilter === "custom" && (
            <div className="mt-3 space-y-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  type="date"
                  value={pendingRange.from}
                  onChange={(e) => setPendingRange((r) => ({ ...r, from: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  type="date"
                  value={pendingRange.to}
                  onChange={(e) => setPendingRange((r) => ({ ...r, to: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={handleReset}>
              Reset Filter
            </Button>
            <Button type="button" size="sm" className="flex-1" onClick={handleApply}>
              Terapkan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
