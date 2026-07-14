import { z } from "zod";
import {
  RuleDryRunResultSchema,
  RuleEngineRuleSchema,
  MatchedTransactionSchema,
  RulePatternSuggestionSchema,
} from "@/features/rule-engine-builder/model/schemas";

export type MatchedTransaction = z.infer<typeof MatchedTransactionSchema>;
export type RuleEngineRule = z.infer<typeof RuleEngineRuleSchema>;
export type RulePatternSuggestion = z.infer<
  typeof RulePatternSuggestionSchema
>;
export type RuleDryRunResult = z.infer<typeof RuleDryRunResultSchema>;

export interface RuleCreateRequest {
  keyword: string;
  categoryId: number;
  tag?: string;
}

export interface RuleDryRunRequest {
  keyword: string;
  categoryId: number;
}
