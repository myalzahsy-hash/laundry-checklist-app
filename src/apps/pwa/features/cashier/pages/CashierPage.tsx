import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/ui/components/ui/button";
import { Textarea } from "@/ui/components/ui/textarea";
import { Label } from "@/ui/components/ui/label";
import { Save, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/components/ui/dialog";
import { CustomerInfoSection } from "@/apps/pwa/features/cashier/components/CustomerInfoSection";
import { FixedItemsSection } from "@/apps/pwa/features/cashier/components/FixedItemsSection";
import { DynamicItemsSection } from "@/apps/pwa/features/cashier/components/DynamicItemsSection";
import { TotalItemsDisplay } from "@/apps/pwa/features/cashier/components/TotalItemsDisplay";
import {
  transactionFormSchema,
  type TransactionFormData,
} from "@/shared/validation/transactionSchema";
import { useAppConfigStore } from "@/shared/lib/config-store";
import { TransactionService } from "@/core/services/TransactionService";
import { useToast } from "@/shared/hooks/use-toast";
import { isFirebaseReady, getFirebaseError } from "@/data/firebase";

const DEFAULT_VALUES: TransactionFormData = {
  receiptSequence: 0,
  customerName: "",
  transactionDate: new Date().toISOString().split("T")[0] ?? "",
  fixedItems: {
    pakaian: 0,
    celanaDalam: 0,
    bh: 0,
    kaosKaki: 0,
  },
  dynamicItems: [],
  notes: "",
};

export default function CashierPage() {
  const outletName = useAppConfigStore((s) => s.outletName);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const firebaseReady = isFirebaseReady();
  const firebaseError = getFirebaseError();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, control, register } = form;

  const watchedFixed = useWatch({ control, name: "fixedItems" });
  const watchedDynamic = useWatch({ control, name: "dynamicItems" });

  const totalItemCount =
    (watchedFixed?.pakaian ?? 0) +
    (watchedFixed?.celanaDalam ?? 0) +
    (watchedFixed?.bh ?? 0) +
    (watchedFixed?.kaosKaki ?? 0) +
    (watchedDynamic?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0);

  async function onSubmit(data: TransactionFormData) {
    if (!firebaseReady) {
      toast(firebaseError ?? "Firebase belum dikonfigurasi.", "destructive");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await TransactionService.create({
        receiptSequence: data.receiptSequence,
        customerName: data.customerName,
        transactionDate: data.transactionDate,
        outletName,
        fixedItems: data.fixedItems,
        dynamicItems: data.dynamicItems,
        totalItemCount,
        notes: data.notes ?? "",
      });

      if (result.success) {
        toast("Transaksi berhasil disimpan.");
        reset(DEFAULT_VALUES);
      } else {
        toast(result.error ?? "Gagal menyimpan transaksi.", "destructive");
      }
    } catch {
      toast("Terjadi kesalahan tidak terduga.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmReset() {
    reset(DEFAULT_VALUES);
    setShowResetDialog(false);
    toast("Form berhasil dikosongkan.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <h2 className="text-xl font-semibold">Rekap Item</h2>

      {!firebaseReady && (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {firebaseError ?? "Firebase belum dikonfigurasi."} Form tetap dapat digunakan, namun
            data tidak akan tersimpan.
          </p>
        </div>
      )}

      <CustomerInfoSection form={form} />
      <FixedItemsSection form={form} />
      <DynamicItemsSection form={form} />

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          placeholder="Tulis catatan transaksi (opsional)"
          className="min-h-[80px]"
          {...register("notes")}
        />
      </div>

      <TotalItemsDisplay total={totalItemCount} />

      <div className="flex gap-3 pb-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowResetDialog(true)}
          disabled={isSubmitting}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogHeader>
          <DialogTitle>Kosongkan Form?</DialogTitle>
          <DialogDescription>
            Seluruh data yang belum disimpan akan dihapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowResetDialog(false)}>
            Batal
          </Button>
          <Button variant="secondary" onClick={confirmReset}>
            Reset
          </Button>
        </DialogFooter>
      </Dialog>
    </form>
  );
}
