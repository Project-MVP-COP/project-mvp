import type { QueryClient } from "@tanstack/react-query";
import { sampleQueries } from "@/features/sample/api/queries";

export const loader = (queryClient: QueryClient) => async () => {
  // We don't await here to allow the shell to render immediately.
  // prefetchQuery will start the fetch in the background.
  queryClient.prefetchQuery(sampleQueries.list());
  return null;
};
