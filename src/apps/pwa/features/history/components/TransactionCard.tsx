import { Card, CardContent } from "@/ui/components/ui/card";
import { ChevronRight } from "lucide-react";

interface TransactionCardProps {
  receiptNumber: string;
  customerName: string;
  transactionDate: string;
  totalItemCount: number;
  onClick: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function TransactionCard({
  receiptNumber,
  customerName,
  transactionDate,
  totalItemCount,
  onClick,
}: TransactionCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={onClick}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-mono text-sm font-medium">{receiptNumber}</p>
          <p className="truncate text-sm text-muted-foreground">{customerName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(transactionDate)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">{totalItemCount} item</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
