import { api } from "@/shared/api/axios";
import type {
  BulkWashRequest,
  UpdateTransactionCategoryRequest,
} from "@/features/washing/model/types";

export const applyBulkWash = async (payload: BulkWashRequest) => {
  const { data } = await api.post("/api/washing/bulk-classify", payload);
  return data;
};

export const updateTransactionCategory = async (
  id: number,
  payload: UpdateTransactionCategoryRequest,
) => {
  const { data } = await api.patch(`/api/washing/transactions/${id}/category`, payload);
  return data;
};

export const importMockTransactions = async () => {
  const { data } = await api.post("/api/washing/import-mock");
  return data;
};
