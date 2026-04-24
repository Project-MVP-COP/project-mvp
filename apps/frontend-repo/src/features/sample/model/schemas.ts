import { z } from "zod";

/**
 * SampleSchema is used primarily to parse API responses and ensure type safety.
 * Business logic validation (e.g., regex, range checks) should be delegated to the Backend.
 */
export const SampleSchema = z.object({
  id: z.number(),
  message: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "ERROR"]),
  urgent: z.boolean(),
  updatedAt: z.string(),
});

export const SampleListSchema = z.array(SampleSchema);
