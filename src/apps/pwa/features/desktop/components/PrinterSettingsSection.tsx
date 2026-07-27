import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Skeleton } from "@/ui/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/ui/components/ui/radio-group";
import { Label } from "@/ui/components/ui/label";
import { Wifi, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { QzService } from "@/print/qz/QzService";
import { PrinterManager } from "@/print/services/PrinterManager";
import { useToast } from "@/shared/hooks/use-toast";

type Status = "idle" | "connecting" | "connected" | "error";

export function PrinterSettingsSection() {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = PrinterManager.getSelectedPrinter();
    if (saved) setSelectedPrinter(saved);

    async function init() {
      setStatus("connecting");
      const conn = await QzService.connect();
      if (conn.success) {
        setStatus("connected");
        const result = await QzService.getPrinters();
        if (result.success) {
          setPrinters(result.printers);
          if (result.printers.length === 0) {
            setErrorMessage("Tidak ada printer yang tersedia.");
          }
        } else {
          setErrorMessage(result.error);
        }
      } else {
        setStatus("error");
        setErrorMessage(conn.error ?? "Gagal menghubungkan ke QZ Tray.");
      }
      setLoading(false);
    }

    init();
  }, []);

  function handlePrinterChange(value: string) {
    setSelectedPrinter(value);
    PrinterManager.setSelectedPrinter(value);
    toast("Printer berhasil disimpan.");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Printer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Status QZ Tray</p>
          {loading && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          )}

          {!loading && status === "connected" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              QZ Tray terhubung
            </div>
          )}

          {!loading && status === "connecting" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Menghubungkan ke QZ Tray...
            </div>
          )}

          {!loading && status === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}
        </div>

        {!loading && status === "connected" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Daftar Printer</p>
            {printers.length === 0 && !errorMessage && (
              <p className="text-sm text-muted-foreground">Tidak ada printer yang tersedia.</p>
            )}

            {errorMessage && printers.length === 0 && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            {printers.length > 0 && (
              <RadioGroup value={selectedPrinter} onValueChange={handlePrinterChange}>
                {printers.map((name) => (
                  <div key={name} className="flex items-center space-x-2">
                    <RadioGroupItem value={name} id={`printer-${name}`} />
                    <Label htmlFor={`printer-${name}`} className="cursor-pointer text-sm">
                      {name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        )}

        {!loading && selectedPrinter && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            <Wifi className="h-4 w-4" />
            <span>
              Printer aktif: <strong>{selectedPrinter}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
