import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App, { action as appAction, loader as appLoader } from "./App.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Failed to find the root element");

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

const queryClient = new QueryClient();

enableMocking().then(() => {
  const router = createBrowserRouter([
    {
      index: true,
      element: <App />,
      loader: appLoader(queryClient),
      action: appAction(queryClient),
    },
  ]);

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
