import { api } from "@/shared/api/axios";
import {
  CategoryDtoListSchema,
  InsightResponseSchema,
  TransactionDtoListSchema,
} from "@/features/ai-insights/model/schemas";
import type {
  CategoryDto,
  InsightRequest,
  InsightResponse,
  TransactionDto,
} from "@/features/ai-insights/model/types";

export const fetchInsightTransactions = async (): Promise<TransactionDto[]> => {
  const { data } = await api.get("/api/transactions");
  return TransactionDtoListSchema.parse(data);
};

export const fetchInsightCategories = async (): Promise<CategoryDto[]> => {
  const { data } = await api.get("/api/categories");
  return CategoryDtoListSchema.parse(data);
};

export const generateInsight = async (
  payload: InsightRequest,
): Promise<InsightResponse> => {
  const { data } = await api.post("/api/insights", payload);
  return InsightResponseSchema.parse(data);
};
