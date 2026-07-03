import { api } from "@/shared/api/axios";
import { BulkAddResponseSchema, TransactionDtoListSchema } from "@/features/washing/model/schemas";
import type {
  BulkAddResponse,
  BulkWashRequest,
  TransactionDto,
} from "@/features/washing/model/types";

export const applyBulkWash = async (payload: BulkWashRequest) => {
  const { data } = await api.post("/api/washing/bulk-classify", payload);
  return data;
};

export const importMockTransactions = async () => {
  const { data } = await api.post("/api/washing/import-mock");
  return data;
};

export const updateTransaction = async (id: number, payload: TransactionDto) => {
  const { data } = await api.put(`/api/transactions/${id}`, payload);
  return data;
};

export const uploadExcel = async (file: File): Promise<TransactionDto[]> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/excel/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return TransactionDtoListSchema.parse(data);
};

export const deleteTransaction = async (id: number) => {
  await api.delete(`/api/transactions/${id}`);
};

export const bulkAddTransactions = async (
  items: TransactionDto[],
): Promise<BulkAddResponse> => {
  const { data } = await api.post("/api/transactions/bulk", items);
  return BulkAddResponseSchema.parse(data);
};
