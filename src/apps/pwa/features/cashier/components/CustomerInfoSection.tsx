import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { formatReceiptNumber, type TransactionFormData } from "@/shared/validation/transactionSchema";
import { useCallback } from "react";

interface CustomerInfoSectionProps {
  form: UseFormReturn<TransactionFormData>;
}

export function CustomerInfoSection({ form }: CustomerInfoSectionProps) {
  const {
    register,
    setValue,
    formState: { errors },
    control,
  } = form;

  const watchedDate = useWatch({ control, name: "transactionDate" });
  const watchedSequence = useWatch({ control, name: "receiptSequence" });

  const receiptDisplay = watchedSequence === 0 ? "" : String(watchedSequence);

  const handleReceiptChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        setValue("receiptSequence", 0);
        return;
      }
      if (/^\d*$/.test(raw)) {
        const parsed = parseInt(raw, 10);
        setValue("receiptSequence", isNaN(parsed) ? 0 : parsed);
      }
    },
    [setValue],
  );

  const receiptPreview = formatReceiptNumber(
    watchedDate,
    typeof watchedSequence === "number" ? watchedSequence : 0,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Nama Pelanggan</Label>
        <Input id="customerName" placeholder="Nama pelanggan" {...register("customerName")} />
        {errors.customerName && (
          <p className="text-sm text-destructive">{errors.customerName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="transactionDate">Tanggal Masuk</Label>
          <Input id="transactionDate" type="date" className="h-10" {...register("transactionDate")} />
          {errors.transactionDate && (
            <p className="text-sm text-destructive">{errors.transactionDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiptSequence">No. Transaksi</Label>
          <Input
            id="receiptSequence"
            type="text"
            inputMode="numeric"
            placeholder="Nomor urut"
            className="h-10"
            value={receiptDisplay}
            onChange={handleReceiptChange}
          />
          {receiptPreview && (
            <p className="font-mono text-xs text-muted-foreground">{receiptPreview}</p>
          )}
          {errors.receiptSequence && (
            <p className="text-sm text-destructive">{errors.receiptSequence.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
