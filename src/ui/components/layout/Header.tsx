import { useAppConfigStore } from "@/shared/lib/config-store";

export function Header() {
  const outletName = useAppConfigStore((s) => s.outletName);

  return (
    <header className="sticky top-0 z-40 border-b bg-primary text-primary-foreground">
      <div className="mx-auto flex h-14 max-w-lg flex-col justify-center px-4 leading-tight">
        <span className="text-xs font-medium opacity-90">{outletName}</span>
        <h1 className="text-base font-semibold">Laundry Checklist</h1>
      </div>
    </header>
  );
}
