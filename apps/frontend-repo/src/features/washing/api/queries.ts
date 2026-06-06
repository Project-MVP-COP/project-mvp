import { queryOptions } from "@tanstack/react-query";
import { fetchWashingOverview } from "@/features/washing/api/fetchers";

export const washingKeys = {
  all: ["washing"] as const,
  overview: () => [...washingKeys.all, "overview"] as const,
};

export const washingQueries = {
  overview: () =>
    queryOptions({
      queryKey: washingKeys.overview(),
      queryFn: () => fetchWashingOverview(),
    }),
};
