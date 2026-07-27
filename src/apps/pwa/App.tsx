import { RouterProvider } from "react-router-dom";
import { router } from "@/apps/pwa/router";
import { Toaster } from "@/ui/components/ui/toaster";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
