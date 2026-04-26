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



export const SampleCreateRequest = zod.object({
  "message": zod.string().min(1)
})

export type SampleCreateRequest = zod.input<typeof SampleCreateRequest>;
export type SampleCreateRequestOutput = zod.output<typeof SampleCreateRequest>;
