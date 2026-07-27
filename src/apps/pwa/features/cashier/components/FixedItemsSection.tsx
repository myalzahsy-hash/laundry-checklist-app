import { NumberStepper } from "@/ui/components/ui/number-stepper";
import { Card, CardContent } from "@/ui/components/ui/card";
import { FIXED_ITEM_CATEGORIES } from "@/shared/constants";
import type { UseFormReturn } from "react-hook-form";
import type { TransactionFormData } from "@/shared/validation/transactionSchema";

interface FixedItemsSectionProps {
  form: UseFormReturn<TransactionFormData>;
}

type FixedItemKey = "pakaian" | "celanaDalam" | "bh" | "kaosKaki";

const FIELD_MAP: Record<string, FixedItemKey> = {
  Pakaian: "pakaian",
  "Celana Dalam": "celanaDalam",
  BH: "bh",
  "Kaos Kaki": "kaosKaki",
};

export function FixedItemsSection({ form }: FixedItemsSectionProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {FIXED_ITEM_CATEGORIES.map(({ name }) => {
            const fieldKey = FIELD_MAP[name] as FixedItemKey;
            const value = watch(`fixedItems.${fieldKey}`);
            const fieldError = errors.fixedItems?.[fieldKey];

            return (
              <div key={name} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
                <NumberStepper
                  value={value ?? 0}
                  onChange={(val) => setValue(`fixedItems.${fieldKey}`, val)}
                  min={0}
                  max={9999}
                />
                {fieldError && (
                  <p className="w-full text-xs text-destructive">{fieldError.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
