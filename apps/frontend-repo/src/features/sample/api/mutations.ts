import { api } from "@/shared/api/axios";
import type { CreateSampleRequest, UpdateSampleRequest, PatchSampleRequest } from "@/features/sample/model/types";

export const createSample = async (payload: CreateSampleRequest) => {
  const { data } = await api.post("/api/sample", payload);
  return data;
};

/**
 * Standard update method (PUT).
 * Use this as the default for form submissions where the full object is available.
 */
export const updateSample = async (id: number, payload: UpdateSampleRequest) => {
  const { data } = await api.put(`/api/sample/${id}`, payload);
  return data;
};

/**
 * Partial update method (PATCH).
 * Use this for atomic UI actions (e.g., status toggles) or performance-critical updates.
 */
export const patchSample = async (id: number, payload: PatchSampleRequest) => {
  const { data } = await api.patch(`/api/sample/${id}`, payload);
  return data;
};

export const deleteSample = async (id: number) => {
  const { data } = await api.delete(`/api/sample/${id}`);
  return data;
};
