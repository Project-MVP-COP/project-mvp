import type { QueryClient } from "@tanstack/react-query";
import { washingQueries } from "@/features/washing/api/queries";

export const loader = (queryClient: QueryClient) => async () => {
  queryClient.prefetchQuery(washingQueries.overview());
  return null;
};
