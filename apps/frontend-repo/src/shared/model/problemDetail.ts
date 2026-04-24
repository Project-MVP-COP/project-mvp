import { z } from "zod";

export const ProblemDetailSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  instance: z.string(),
  traceId: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;
