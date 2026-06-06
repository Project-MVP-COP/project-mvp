import { z } from "zod";
import {
  WashingOverviewSchema,
  WashingTransactionSchema,
} from "@/features/washing/model/schemas";

export type WashingTransaction = z.infer<typeof WashingTransactionSchema>;
export type WashingOverview = z.infer<typeof WashingOverviewSchema>;

export interface BulkWashRequest {
  ids: number[];
  category: string;
}

export interface UpdateTransactionCategoryRequest {
  category: string | null;
}

export interface WashingFilters {
  merchantKeyword: string;
  category: string;
  status: "all" | "classified" | "unclassified";
}
