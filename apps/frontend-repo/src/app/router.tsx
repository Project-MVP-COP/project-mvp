import { SamplePage } from "@/features/sample/routes/SamplePage";
import { action as sampleAction } from "@/features/sample/routes/action";
import { loader as sampleLoader } from "@/features/sample/routes/loader";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { NotFoundPage } from "@/shared/ui/NotFoundPage";
import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { queryClient } from "./queryClient";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "sample",
        element: <SamplePage />,
        loader: sampleLoader(queryClient),
        action: sampleAction(queryClient),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
