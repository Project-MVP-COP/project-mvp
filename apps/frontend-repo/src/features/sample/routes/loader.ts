import type { QueryClient } from "@tanstack/react-query";
import { sampleQueries } from "../api/queries";

export const loader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(sampleQueries.list());
  return null;
};
