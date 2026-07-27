import { X } from "lucide-react";
import { useToastStore, type Toast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-center justify-between rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-5",
        toast.variant === "destructive"
          ? "border-destructive/50 bg-destructive text-destructive-foreground"
          : "border-border bg-background text-foreground",
      )}
    >
      <p className="text-sm font-medium">{toast.title}</p>
      <button onClick={onDismiss} className="ml-3 shrink-0 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
