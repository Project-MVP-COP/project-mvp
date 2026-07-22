import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppProvider } from "./app/AppProvider";
import { router } from "./app/router";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Failed to find the root element");

async function enableMocking() {
  const useMsw = import.meta.env.VITE_USE_MSW === "true";

  if (import.meta.env.DEV && useMsw) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </StrictMode>,
  );
});
