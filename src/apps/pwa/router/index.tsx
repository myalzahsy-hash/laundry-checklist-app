import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/ui/layouts/AppLayout";
import { PageLoader } from "@/ui/components/layout/PageLoader";
import { lazy, Suspense } from "react";

const CashierPage = lazy(() => import("@/apps/pwa/features/cashier/pages/CashierPage"));
const HistoryPage = lazy(() => import("@/apps/pwa/features/history/pages/HistoryPage"));
const TransactionDetailPage = lazy(
  () => import("@/apps/pwa/features/history/pages/TransactionDetailPage"),
);
const TransactionEditPage = lazy(
  () => import("@/apps/pwa/features/history/pages/TransactionEditPage"),
);
const SettingsPage = lazy(() => import("@/apps/pwa/features/settings/pages/SettingsPage"));

function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: withSuspense(CashierPage),
      },
      {
        path: "riwayat",
        element: withSuspense(HistoryPage),
      },
      {
        path: "riwayat/:id",
        element: withSuspense(TransactionDetailPage),
      },
      {
        path: "riwayat/:id/edit",
        element: withSuspense(TransactionEditPage),
      },
      {
        path: "pengaturan",
        element: withSuspense(SettingsPage),
      },
    ],
  },
]);
