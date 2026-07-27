import type { FilterType } from "./HistoryFilter";

interface DateRange {
  from: string;
  to: string;
}

export function formatFilterLabel(filter: FilterType, dateRange: DateRange): string {
  switch (filter) {
    case "today":
      return "Hari Ini";
    case "thisWeek":
      return "Minggu Ini";
    case "thisMonth":
      return "Bulan Ini";
    case "custom": {
      if (!dateRange.from && !dateRange.to) return "Custom";
      const fmt = (d: string) => {
        const date = new Date(d);
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date);
      };
      const from = dateRange.from ? fmt(dateRange.from) : "...";
      const to = dateRange.to ? fmt(dateRange.to) : "...";
      return `${from} - ${to}`;
    }
    default:
      return "";
  }
}

export function filterByDateRange(
  dateStr: string,
  filter: FilterType,
  dateRange: DateRange,
): boolean {
  if (filter === "all") return true;

  const txDate = new Date(dateStr);
  const now = new Date();

  switch (filter) {
    case "today": {
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getDate() === now.getDate()
      );
    }
    case "thisWeek": {
      const startOfWeek = new Date(now);
      const day = now.getDay();
      startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return txDate >= startOfWeek && txDate <= endOfWeek;
    }
    case "thisMonth": {
      return (
        txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth()
      );
    }
    case "custom": {
      if (!dateRange.from && !dateRange.to) return true;
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      if (from && txDate < from) return false;
      if (to && txDate > to) return false;
      return true;
    }
    default:
      return true;
  }
}
