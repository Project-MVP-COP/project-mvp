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
