import { z } from "zod";

export const WashingTransactionSchema = z.object({
  id: z.number(),
  occurredAt: z.string(),
  merchantName: z.string(),
  description: z.string(),
  cardLabel: z.string(),
  amount: z.number(),
  category: z.string().nullable(),
  isClassified: z.boolean(),
  matchedRuleLabel: z.string().nullable(),
  tag: z.string(),
  source: z.enum(["CARD", "BANK", "CASH"]),
});

export const WashingOverviewSchema = z.object({
  categories: z.array(z.string()),
  transactions: z.array(WashingTransactionSchema),
  lastImportedAt: z.string(),
});

export const TransactionDtoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  transactionDate: z.string(),
  merchant: z.string(),
  categoryId: z.number().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  amount: z.number(),
  cardName: z.string(),
  installment: z.number(),
  status: z.string(),
  memo: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  isClassified: z.boolean().nullable().optional(),
});

export const TransactionDtoListSchema = z.array(TransactionDtoSchema);

export const CategoryDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  displayOrder: z.number(),
  isDefault: z.boolean(),
});

export const CategoryDtoListSchema = z.array(CategoryDtoSchema);

export const BulkAddResponseSchema = z.object({
  added: TransactionDtoListSchema,
  skippedCount: z.number(),
});
