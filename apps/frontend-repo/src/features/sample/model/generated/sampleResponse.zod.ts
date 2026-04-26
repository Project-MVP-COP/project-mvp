/**
 * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
 * 
 * Source : AgileMVP API v0.0.1
 * Generated: 2026-04-26T02:10:46.239Z
 * 
 * Regenerate: pnpm generate:api
 *             (백엔드 서버 기동 필요: localhost:8080)
 */
import { z as zod } from 'zod';

export const SampleResponse = zod.object({
  "id": zod.number().optional(),
  "message": zod.string().optional(),
  "status": zod.enum(['ACTIVE', 'INACTIVE', 'ERROR']).optional(),
  "urgent": zod.boolean().optional(),
  "updatedAt": zod.string().optional()
})

export type SampleResponse = zod.input<typeof SampleResponse>;
export type SampleResponseOutput = zod.output<typeof SampleResponse>;
