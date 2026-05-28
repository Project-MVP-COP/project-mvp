/**
 * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
 * 
 * Source : AgileMVP API v0.0.1
 * Generated: 2026-05-25T04:41:55.834Z
 * 
 * Regenerate: pnpm generate:api
 *             (백엔드 서버 기동 필요: localhost:8080)
 */
import { z as zod } from 'zod';

export const registerRequestLoginIdMin = 2;
export const registerRequestLoginIdMax = 50;

export const registerRequestNicknameMax = 50;



export const RegisterRequest = zod.object({
  "loginId": zod.string().min(registerRequestLoginIdMin).max(registerRequestLoginIdMax),
  "nickname": zod.string().min(1).max(registerRequestNicknameMax),
  "password": zod.string().min(1)
})

export type RegisterRequest = zod.input<typeof RegisterRequest>;
export type RegisterRequestOutput = zod.output<typeof RegisterRequest>;
