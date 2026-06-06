import { api } from "@/shared/api/axios";
import { WashingOverviewSchema } from "@/features/washing/model/schemas";
import type { WashingOverview } from "@/features/washing/model/types";

export const fetchWashingOverview = async (): Promise<WashingOverview> => {
  const { data } = await api.get("/api/washing/overview");
  return WashingOverviewSchema.parse(data);
};
