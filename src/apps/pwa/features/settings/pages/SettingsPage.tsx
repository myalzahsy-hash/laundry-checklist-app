import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppConfigStore } from "@/shared/lib/config-store";
import { SettingsService } from "@/core/services/SettingsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Input } from "@/ui/components/ui/input";
import { Textarea } from "@/ui/components/ui/textarea";
import { Label } from "@/ui/components/ui/label";
import { Button } from "@/ui/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { MAX_OUTLET_NAME_LENGTH, MAX_NOTES_LENGTH } from "@/shared/constants";
import { Platform } from "@/shared/lib/platform";
import { PrinterSettingsSection } from "@/apps/pwa/features/desktop/components/PrinterSettingsSection";

const settingsSchema = z.object({
  outletName: z
    .string()
    .trim()
    .min(1, "Nama outlet wajib diisi")
    .max(MAX_OUTLET_NAME_LENGTH, `Nama outlet maksimal ${MAX_OUTLET_NAME_LENGTH} karakter`),
  outletFooter: z.string().max(MAX_NOTES_LENGTH, `Footer maksimal ${MAX_NOTES_LENGTH} karakter`).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const setOutletName = useAppConfigStore((s) => s.setOutletName);
  const setOutletFooter = useAppConfigStore((s) => s.setOutletFooter);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { outletName: "", outletFooter: "" },
  });

  const { register, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    async function load() {
      const result = await SettingsService.get();
      if (result.success) {
        const name = result.outletName || "";
        const footer = result.outletFooter || "";
        reset({ outletName: name, outletFooter: footer });
        if (name) setOutletName(name);
        if (footer) setOutletFooter(footer);
      }
      setLoading(false);
    }
    load();
  }, [reset, setOutletName, setOutletFooter]);

  async function onSubmit(data: SettingsFormData) {
    setIsSubmitting(true);
    try {
      const result = await SettingsService.save(data.outletName, data.outletFooter ?? "");
      if (result.success) {
        setOutletName(data.outletName);
        setOutletFooter(data.outletFooter ?? "");
        toast("Pengaturan berhasil disimpan.");
      } else {
        toast(result.error ?? "Gagal menyimpan pengaturan.", "destructive");
      }
    } catch {
      toast("Terjadi kesalahan tidak terduga.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pengaturan</h2>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pengaturan</h2>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pengaturan Outlet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outletName">Nama Outlet</Label>
              <Input id="outletName" placeholder="Nama outlet" {...register("outletName")} />
              {errors.outletName && (
                <p className="text-sm text-destructive">{errors.outletName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="outletFooter">Footer Outlet</Label>
              <Textarea
                id="outletFooter"
                placeholder="Footer yang akan dicetak pada seluruh transaksi (opsional)"
                className="min-h-[80px]"
                {...register("outletFooter")}
              />
              {errors.outletFooter && (
                <p className="text-sm text-destructive">{errors.outletFooter.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {Platform.isDesktop && <PrinterSettingsSection />}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tentang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Laundry Checklist</p>
            <p>{Platform.isDesktop ? "Desktop Edition" : "Mobile Edition"}</p>
            <p>Version 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
