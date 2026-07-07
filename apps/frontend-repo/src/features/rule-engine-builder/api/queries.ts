import { queryOptions } from "@tanstack/react-query";
import {
  fetchRulePatternSuggestions,
  fetchRules,
} from "@/features/rule-engine-builder/api/fetchers";

export const ruleEngineKeys = {
  all: ["rule-engine-builder"] as const,
  rules: () => [...ruleEngineKeys.all, "rules"] as const,
  patterns: () => [...ruleEngineKeys.all, "patterns"] as const,
};

export const ruleEngineQueries = {
  rules: () =>
    queryOptions({
      queryKey: ruleEngineKeys.rules(),
      queryFn: fetchRules,
    }),
  patterns: () =>
    queryOptions({
      queryKey: ruleEngineKeys.patterns(),
      queryFn: fetchRulePatternSuggestions,
    }),
};
