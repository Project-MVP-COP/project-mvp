import { createBrowserRouter } from "react-router";
import { SamplePage } from "../features/sample/routes/SamplePage";
import { loader as sampleLoader } from "../features/sample/routes/loader";
import { action as sampleAction } from "../features/sample/routes/action";
import { queryClient } from "./queryClient";
import { ErrorBoundary } from "../shared/ui/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SamplePage />,
    loader: sampleLoader(queryClient),
    action: sampleAction(queryClient),
    errorElement: <ErrorBoundary />,
  },
]);
