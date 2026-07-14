import { api } from "@/shared/api/axios";
import { RuleDryRunResultSchema } from "@/features/rule-engine-builder/model/schemas";
import type {
  RuleCreateRequest,
  RuleDryRunRequest,
  RuleDryRunResult,
} from "@/features/rule-engine-builder/model/types";

interface CategoryMutationRequest {
  name: string;
  color: string;
}

export const dryRunRule = async (
  payload: RuleDryRunRequest,
): Promise<RuleDryRunResult> => {
  const { data } = await api.post("/api/rules/dry-run", payload);
  return RuleDryRunResultSchema.parse(data);
};

export const createRule = async (
  payload: RuleCreateRequest,
): Promise<void> => {
  await api.post("/api/rules", payload);
};

export const deleteRule = async (id: number) => {
  await api.delete(`/api/rules/${id}`);
};

export const createCategory = async (
  payload: CategoryMutationRequest,
): Promise<void> => {
  await api.post("/api/categories", payload);
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};
