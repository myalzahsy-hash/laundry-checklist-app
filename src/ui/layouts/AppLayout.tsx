import { Outlet } from "react-router-dom";
import { Header } from "@/ui/components/layout/Header";
import { NavigationBar } from "@/ui/components/layout/NavigationBar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 pb-20">
        <Outlet />
      </main>
      <NavigationBar />
    </div>
  );
}
