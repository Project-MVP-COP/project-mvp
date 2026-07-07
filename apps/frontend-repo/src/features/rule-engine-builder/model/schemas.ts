import { z } from "zod";

export const MatchedTransactionSchema = z.object({
  id: z.number(),
  transactionDate: z.string(),
  merchant: z.string(),
  amount: z.number(),
  currentCategoryId: z.number().nullable(),
  currentCategory: z.string().nullable(),
  newlyClassified: z.boolean(),
  override: z.boolean(),
});

export const RuleEngineRuleSchema = z.object({
  id: z.number(),
  keyword: z.string(),
  categoryId: z.number(),
  categoryName: z.string(),
  tag: z.string().nullable(),
  appliedCount: z.number(),
});

export const RulePatternSuggestionSchema = z.object({
  keyword: z.string(),
  occurrences: z.number(),
  totalAmount: z.number(),
  exampleMerchant: z.string(),
  recommendedCategoryId: z.number(),
  recommendedCategoryName: z.string(),
});

export const RuleDryRunResultSchema = z.object({
  matchCount: z.number(),
  newlyClassifiedCount: z.number(),
  overrideCount: z.number(),
  hasOverrideRisk: z.boolean(),
  transactions: z.array(MatchedTransactionSchema),
});

export const RuleEngineRuleListSchema = z.array(RuleEngineRuleSchema);
export const RulePatternSuggestionListSchema = z.array(
  RulePatternSuggestionSchema,
);
