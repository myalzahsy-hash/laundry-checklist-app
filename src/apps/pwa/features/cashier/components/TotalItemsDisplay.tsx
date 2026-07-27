import { Card, CardContent } from "@/ui/components/ui/card";
import { Shirt } from "lucide-react";

interface TotalItemsDisplayProps {
  total: number;
}

export function TotalItemsDisplay({ total }: TotalItemsDisplayProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Shirt className="h-5 w-5 text-primary" />
          <span className="font-medium">Total Item</span>
        </div>
        <span className="text-2xl font-bold text-primary">{total}</span>
      </CardContent>
    </Card>
  );
}
