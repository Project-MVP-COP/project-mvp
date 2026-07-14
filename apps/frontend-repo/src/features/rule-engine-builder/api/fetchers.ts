import { api } from "@/shared/api/axios";
import {
  RuleEngineRuleListSchema,
  RulePatternSuggestionListSchema,
} from "@/features/rule-engine-builder/model/schemas";
import type {
  RuleEngineRule,
  RulePatternSuggestion,
} from "@/features/rule-engine-builder/model/types";

export const fetchRules = async (): Promise<RuleEngineRule[]> => {
  const { data } = await api.get("/api/rules");
  return RuleEngineRuleListSchema.parse(data);
};

export const fetchRulePatternSuggestions = async (): Promise<
  RulePatternSuggestion[]
> => {
  const { data } = await api.get("/api/rules/patterns");
  return RulePatternSuggestionListSchema.parse(data);
};
