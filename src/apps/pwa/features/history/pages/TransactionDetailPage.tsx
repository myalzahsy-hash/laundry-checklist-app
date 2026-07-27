import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppConfigStore } from "@/shared/lib/config-store";
import { TransactionService } from "@/core/services/TransactionService";
import type { TransactionDocument } from "@/data/repositories/firestore/TransactionRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import { Skeleton } from "@/ui/components/ui/skeleton";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/ui/components/ui/dialog";
import { Pencil, Trash2, ArrowLeft, Printer } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Platform } from "@/shared/lib/platform";
import { PrintService } from "@/print/PrintService";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const outletName = useAppConfigStore((s) => s.outletName);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [transaction, setTransaction] = useState<TransactionDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const fetchTransaction = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const result = await TransactionService.getById(outletName, id);
    if (result.success) {
      setTransaction(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [outletName, id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    const result = await TransactionService.delete(outletName, id);
    setDeleting(false);
    setShowDeleteDialog(false);
    if (result.success) {
      toast("Transaksi berhasil dihapus.");
      navigate("/riwayat");
    } else {
      toast(result.error ?? "Gagal menghapus transaksi.", "destructive");
    }
  }

  async function handlePrint() {
    if (!transaction || printing) return;
    setPrinting(true);
    try {
      const result = await PrintService.print(transaction);
      if (result.success) {
        toast("Struk berhasil dikirim ke printer.");
      } else {
        toast(result.error, "destructive");
      }
    } catch {
      toast("Gagal mencetak.", "destructive");
    } finally {
      setPrinting(false);
    }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/riwayat")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex gap-2">
          {Platform.isDesktop && (
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={printing}>
              <Printer className="mr-1 h-4 w-4" />
              {printing ? "Mencetak..." : "Cetak Ulang"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate(`/riwayat/${id}/edit`)}>
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="No. Transaksi" value={transaction.receiptNumber} mono />
          <Row label="Nama Pelanggan" value={transaction.customerName} />
          <Row label="Tanggal Masuk" value={formatDate(transaction.transactionDate)} />
          <Row label="Nama Outlet" value={transaction.outletName} />
          <Row label="Total Item" value={String(transaction.totalItemCount)} bold />
          {transaction.notes && <Row label="Catatan" value={transaction.notes} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rincian Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <SectionTitle>Kategori Bawaan</SectionTitle>
          <Row label="Pakaian" value={String(transaction.fixedItems.pakaian)} />
          <Row label="Celana Dalam" value={String(transaction.fixedItems.celanaDalam)} />
          <Row label="BH" value={String(transaction.fixedItems.bh)} />
          <Row label="Kaos Kaki" value={String(transaction.fixedItems.kaosKaki)} />

          {transaction.dynamicItems.length > 0 && (
            <>
              <SectionTitle>Lain-lain</SectionTitle>
              {transaction.dynamicItems.map((item, i) => (
                <Row key={i} label={item.name} value={String(item.quantity)} />
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle>Hapus Transaksi?</DialogTitle>
          <DialogDescription>
            Transaksi {transaction.receiptNumber} akan dihapus secara permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono" : ""} ${bold ? "font-semibold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="pt-2 text-xs font-semibold uppercase text-muted-foreground">{children}</p>;
}
