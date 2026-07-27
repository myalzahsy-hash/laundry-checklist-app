import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/apps/portal/App";
import "@/apps/portal/portal.css";
import "@/ui/styles/index.css";

async function bootstrap() {
  try {
    const { isFirebaseReady, ensureAnonymousAuth } = await import("@/data/firebase");
    if (isFirebaseReady()) {
      await ensureAnonymousAuth();
    }
  } catch {
    // Firebase init failure handled in App
  }

  createRoot(document.getElementById("portal-root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
