import { z } from "zod";
import {
  CategoryDtoSchema,
  InsightCardSchema,
  InsightPeriodSchema,
  InsightRequestSchema,
  InsightResponseSchema,
  InsightTransactionSchema,
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

export interface MonthlyGoal {
  id: string;
  month: string;
  title: string;
  targetCategory: string;
  reductionRatio: number;
  baselineAmount: number;
  targetAmount: number;
  monthlySave: number;
  status: "active" | "completed" | "stopped";
  savedAtLabel: string;
  actualSaved: number | null;
}
