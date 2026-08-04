import { api } from "@/shared/api/axios";
import {
  BulkAddResponseSchema,
  CategoryDtoListSchema,
  TransactionDtoListSchema,
} from "@/features/washing/model/schemas";
import type {
  BulkAddResponse,
  BulkWashRequest,
  TransactionDto,
} from "@/features/washing/model/types";

export const applyBulkWash = async (payload: BulkWashRequest) => {
  const { data: categoriesData } = await api.get("/api/categories");
  const categories = CategoryDtoListSchema.parse(categoriesData);
  const matchedCategory = categories.find((category) => category.name === payload.category);

  if (!matchedCategory) {
    throw new Error(`Unknown category: ${payload.category}`);
  }

  const results = await Promise.all(
    payload.ids.map((id) =>
      api.patch(`/api/transactions/${id}/category`, {
        categoryId: matchedCategory.id,
      }),
    ),
  );

  return results.map((result) => result.data);
};

export const importMockTransactions = async () => {
  const { data } = await api.post("/api/transactions/import-mock");
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
