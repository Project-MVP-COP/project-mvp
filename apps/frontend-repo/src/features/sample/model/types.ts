import { z } from "zod";
import { SampleSchema } from "./schemas";
import type { 
  SampleCreateRequest as CreateSampleRequest,
  SampleUpdateRequest as UpdateSampleRequest,
  SamplePatchRequest as PatchSampleRequest 
} from "./generated";

export type Sample = z.infer<typeof SampleSchema>;

export type { CreateSampleRequest, UpdateSampleRequest, PatchSampleRequest };
