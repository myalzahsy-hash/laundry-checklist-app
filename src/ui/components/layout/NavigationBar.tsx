import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { ClipboardList, History, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Kasir", icon: ClipboardList },
  { to: "/riwayat", label: "Riwayat", icon: History },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function NavigationBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
