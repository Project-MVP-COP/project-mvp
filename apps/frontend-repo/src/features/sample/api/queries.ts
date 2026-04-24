import { queryOptions } from "@tanstack/react-query";
import { fetchSamples } from "./fetchers";

export const sampleKeys = {
  all: ["sample"] as const,
  lists: () => [...sampleKeys.all, "list"] as const,
  list: () => [...sampleKeys.lists()] as const,
  details: () => [...sampleKeys.all, "detail"] as const,
  detail: (id: number) => [...sampleKeys.details(), id] as const,
};

export const sampleQueries = {
  list: () => 
    queryOptions({
      queryKey: sampleKeys.list(),
      queryFn: () => fetchSamples(),
    }),
};
