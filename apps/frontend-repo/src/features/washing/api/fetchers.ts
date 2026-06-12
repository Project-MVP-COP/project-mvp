import { api } from "@/shared/api/axios";
import {
  CategoryDtoListSchema,
  TransactionDtoListSchema,
  TransactionDtoSchema,
  WashingOverviewSchema,
} from "@/features/washing/model/schemas";
import type {
  CategoryDto,
  TransactionDto,
  WashingOverview,
} from "@/features/washing/model/types";

export const fetchWashingOverview = async (): Promise<WashingOverview> => {
  const { data } = await api.get("/api/washing/overview");
  return WashingOverviewSchema.parse(data);
};

export const fetchTransactions = async (): Promise<TransactionDto[]> => {
  const { data } = await api.get("/api/transactions");
  return TransactionDtoListSchema.parse(data);
};

export const fetchTransactionById = async (id: number): Promise<TransactionDto> => {
  const { data } = await api.get(`/api/transactions/${id}`);
  return TransactionDtoSchema.parse(data);
};

export const fetchCategories = async (): Promise<CategoryDto[]> => {
  const { data } = await api.get("/api/categories");
  return CategoryDtoListSchema.parse(data);
};
