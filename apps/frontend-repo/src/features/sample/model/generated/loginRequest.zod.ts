/**
 * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
 * 
 * Source : AgileMVP API v0.0.1
 * Generated: 2026-05-25T04:41:55.774Z
 * 
 * Regenerate: pnpm generate:api
 *             (백엔드 서버 기동 필요: localhost:8080)
 */
import { z as zod } from 'zod';




export const LoginRequest = zod.object({
  "loginId": zod.string().min(1),
  "password": zod.string().min(1)
})

export type LoginRequest = zod.input<typeof LoginRequest>;
export type LoginRequestOutput = zod.output<typeof LoginRequest>;
