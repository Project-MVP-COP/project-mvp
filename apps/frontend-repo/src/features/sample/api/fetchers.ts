import { api } from "@/shared/api/axios";
import { SampleListSchema } from "@/features/sample/model/schemas";
import type { Sample } from "@/features/sample/model/types";

export const fetchSamples = async (): Promise<Sample[]> => {
  const { data } = await api.get("/api/sample");
  return SampleListSchema.parse(data);
};
