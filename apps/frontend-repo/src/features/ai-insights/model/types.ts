import { z } from "zod";
import {
  CategoryDtoSchema,
  InsightCardSchema,
  InsightPeriodSchema,
  InsightRequestSchema,
  InsightResponseSchema,
  InsightTransactionSchema,
  MonthlyGoalSchema,
  TransactionDtoSchema,
} from "@/features/ai-insights/model/schemas";

export type InsightPeriod = z.infer<typeof InsightPeriodSchema>;
export type InsightTransaction = z.infer<typeof InsightTransactionSchema>;
export type InsightRequest = z.infer<typeof InsightRequestSchema>;
export type InsightResponse = z.infer<typeof InsightResponseSchema>;
export type InsightCard = z.infer<typeof InsightCardSchema>;
export type TransactionDto = z.infer<typeof TransactionDtoSchema>;
export type CategoryDto = z.infer<typeof CategoryDtoSchema>;

export interface InsightFilters {
  period: InsightPeriod;
  categoryId: number | null;
}

export type MonthlyGoal = z.infer<typeof MonthlyGoalSchema>;

export type MonthlyGoalUpsertRequest = Pick<
  MonthlyGoal,
  "title" | "targetCategory" | "reductionRatio" | "baselineAmount" | "monthlySave"
>;

export interface MonthlyGoalDraft extends MonthlyGoalUpsertRequest {
  id: string;
  month: string;
  targetAmount: number;
  status: "active";
}
