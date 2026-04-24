import { z } from "zod";
import { SampleSchema } from "./schemas";

export type Sample = z.infer<typeof SampleSchema>;

export interface CreateSampleRequest {
  message: string;
}

export interface UpdateSampleRequest {
  message: string;
  status: string;
  urgent: boolean;
}

export interface PatchSampleRequest {
  status?: string;
  message?: string;
  urgent?: boolean;
}
