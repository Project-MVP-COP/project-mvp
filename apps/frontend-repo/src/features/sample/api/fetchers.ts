import { api } from "../../../shared/api/axios";
import { SampleListSchema } from "../model/schemas";
import type { Sample } from "../model/types";

export const fetchSamples = async (): Promise<Sample[]> => {
  const { data } = await api.get("/api/sample");
  return SampleListSchema.parse(data);
};
