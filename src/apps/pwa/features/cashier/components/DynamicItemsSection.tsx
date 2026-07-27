import { Input } from "@/ui/components/ui/input";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { NumberStepper } from "@/ui/components/ui/number-stepper";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { TransactionFormData } from "@/shared/validation/transactionSchema";

interface DynamicItemsSectionProps {
  form: UseFormReturn<TransactionFormData>;
}

export function DynamicItemsSection({ form }: DynamicItemsSectionProps) {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dynamicItems",
  });

  return (
    <Card>
      <CardHeader className="pb-3 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Lain-lain</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", quantity: 1 })}
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada item. Tekan &quot;Tambah&quot; untuk menambahkan.
          </p>
        )}

        <div className="space-y-2">
          {fields.map((field, index) => {
            const quantityValue = watch(`dynamicItems.${index}.quantity`);

            return (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="Nama barang"
                  className="h-10 min-w-0 flex-1"
                  {...register(`dynamicItems.${index}.name`)}
                />
                <NumberStepper
                  value={quantityValue ?? 1}
                  onChange={(val) => setValue(`dynamicItems.${index}.quantity`, val)}
                  min={1}
                  max={9999}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {errors.dynamicItems && (
          <p className="mt-2 text-xs text-destructive">Ada item yang belum terisi dengan benar.</p>
        )}
      </CardContent>
    </Card>
  );
}
