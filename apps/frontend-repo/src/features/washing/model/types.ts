import { z } from "zod";
import {
  BulkAddResponseSchema,
  CategoryDtoSchema,
  TransactionDtoSchema,
  WashingOverviewSchema,
  WashingTransactionSchema,
} from "@/features/washing/model/schemas";

export type WashingTransaction = z.infer<typeof WashingTransactionSchema>;
export type WashingOverview = z.infer<typeof WashingOverviewSchema>;
export type TransactionDto = z.infer<typeof TransactionDtoSchema>;
export type CategoryDto = z.infer<typeof CategoryDtoSchema>;
export type BulkAddResponse = z.infer<typeof BulkAddResponseSchema>;

export interface BulkWashRequest {
  ids: number[];
  category: string;
}

export interface WashingFilters {
  merchantKeyword: string;
  category: string;
  status: "all" | "classified" | "unclassified";
}

export type ActionResult =
  | { intent: "bulk_wash"; count: number; error?: never }
  | { intent: "update_category"; error?: never }
  | { intent: "import_mock"; error?: never }
  | { intent: string; error: true };
