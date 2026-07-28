import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppConfigStore } from "@/shared/lib/config-store";
import { TransactionService } from "@/core/services/TransactionService";
import type { TransactionDocument } from "@/data/repositories/firestore/TransactionRepository";
import { CustomerInfoSection } from "@/apps/pwa/features/cashier/components/CustomerInfoSection";
import { FixedItemsSection } from "@/apps/pwa/features/cashier/components/FixedItemsSection";
import { DynamicItemsSection } from "@/apps/pwa/features/cashier/components/DynamicItemsSection";
import { TotalItemsDisplay } from "@/apps/pwa/features/cashier/components/TotalItemsDisplay";
import {
  transactionFormSchema,
  type TransactionFormData,
  formatReceiptNumber,
} from "@/shared/validation/transactionSchema";
import { Button } from "@/ui/components/ui/button";
import { Textarea } from "@/ui/components/ui/textarea";
import { Label } from "@/ui/components/ui/label";
import { Skeleton } from "@/ui/components/ui/skeleton";
import { Card, CardContent } from "@/ui/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/components/ui/dialog";
import { Save, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const NOTES_DEFAULT = "";

export default function TransactionEditPage() {
  const { id } = useParams<{ id: string }>();
  const outletName = useAppConfigStore((s) => s.outletName);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [transaction, setTransaction] = useState<TransactionDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      receiptSequence: 0,
      customerName: "",
      transactionDate: "",
      fixedItems: { pakaian: 0, celanaDalam: 0, bh: 0, kaosKaki: 0 },
      dynamicItems: [],
      notes: NOTES_DEFAULT,
    },
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

  const fetchTransaction = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const result = await TransactionService.getById(outletName, id);
    if (result.success) {
      const t = result.data;
      setTransaction(t);
      reset({
        receiptSequence: t.receiptSequence,
        customerName: t.customerName,
        transactionDate: t.transactionDate,
        fixedItems: t.fixedItems,
        dynamicItems: t.dynamicItems,
        notes: t.notes ?? "",
      });
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [outletName, id, reset]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  async function onSubmit(data: TransactionFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const updatedReceiptNumber = formatReceiptNumber(data.transactionDate, data.receiptSequence);
      const result = await TransactionService.update(outletName, id, {
        receiptNumber: updatedReceiptNumber,
        receiptSequence: data.receiptSequence,
        customerName: data.customerName,
        transactionDate: data.transactionDate,
        fixedItems: data.fixedItems,
        dynamicItems: data.dynamicItems,
        totalItemCount,
        notes: data.notes ?? "",
      });

      if (result.success) {
        toast("Transaksi berhasil diperbarui.");
        navigate(`/riwayat/${id}`);
      } else {
        toast(result.error ?? "Gagal memperbarui transaksi.", "destructive");
      }
    } catch {
      toast("Terjadi kesalahan tidak terduga.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmReset() {
    if (transaction) {
      reset({
        receiptSequence: transaction.receiptSequence,
        customerName: transaction.customerName,
        transactionDate: transaction.transactionDate,
        fixedItems: transaction.fixedItems,
        dynamicItems: transaction.dynamicItems,
      });
    }
    setShowResetDialog(false);
    toast("Form berhasil dikosongkan.");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[150px] w-full rounded-lg" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive/50">
          <CardContent className="p-4 text-center text-sm text-destructive">
            {error ?? "Transaksi tidak ditemukan."}
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => navigate("/riwayat")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate(`/riwayat/${id}`)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Batal
        </Button>
        <h2 className="text-lg font-semibold">Edit Transaksi</h2>
      </div>

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
