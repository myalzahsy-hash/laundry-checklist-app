import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/apps/pwa/App";
import "@/ui/styles/index.css";
import { ensureAnonymousAuth, isFirebaseReady } from "@/data/firebase";
import { SettingsService } from "@/core/services/SettingsService";
import { useAppConfigStore } from "@/shared/lib/config-store";

async function bootstrap() {
  if (isFirebaseReady()) {
    await ensureAnonymousAuth();
    const result = await SettingsService.get();
    if (result.success && result.outletName) {
      useAppConfigStore.getState().setOutletName(result.outletName);
      if (result.outletFooter) {
        useAppConfigStore.getState().setOutletFooter(result.outletFooter);
      }
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
