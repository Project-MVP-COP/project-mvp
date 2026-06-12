import { queryOptions } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchTransactions,
  fetchWashingOverview,
} from "@/features/washing/api/fetchers";

export const washingKeys = {
  all: ["washing"] as const,
  overview: () => [...washingKeys.all, "overview"] as const,
  transactions: () => [...washingKeys.all, "transactions"] as const,
  categories: () => [...washingKeys.all, "categories"] as const,
};

export const washingQueries = {
  overview: () =>
    queryOptions({
      queryKey: washingKeys.overview(),
      queryFn: () => fetchWashingOverview(),
    }),
  transactions: () =>
    queryOptions({
      queryKey: washingKeys.transactions(),
      queryFn: fetchTransactions,
    }),
  categories: () =>
    queryOptions({
      queryKey: washingKeys.categories(),
      queryFn: fetchCategories,
    }),
};
