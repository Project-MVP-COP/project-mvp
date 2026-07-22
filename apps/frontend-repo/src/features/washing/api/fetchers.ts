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
  const [transactions, categories] = await Promise.all([
    fetchTransactions(),
    fetchCategories(),
  ]);

  return WashingOverviewSchema.parse({
    categories: categories.map((category) => category.name),
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      occurredAt: transaction.transactionDate,
      merchantName: transaction.merchant,
      description: transaction.memo ?? "",
      cardLabel: transaction.cardName,
      amount: transaction.amount,
      category: transaction.categoryName ?? null,
      isClassified:
        transaction.isClassified ?? transaction.categoryId != null,
      matchedRuleLabel: transaction.tag ?? null,
      tag: transaction.tag ?? "",
      source: "CARD",
    })),
    lastImportedAt: "-",
  });
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
