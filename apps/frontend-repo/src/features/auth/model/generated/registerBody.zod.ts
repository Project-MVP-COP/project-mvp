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

export const registerBodyLoginIdMin = 2;
export const registerBodyLoginIdMax = 50;

export const registerBodyNicknameMax = 50;



export const RegisterBody = zod.object({
  "loginId": zod.string().min(registerBodyLoginIdMin).max(registerBodyLoginIdMax),
  "nickname": zod.string().min(1).max(registerBodyNicknameMax),
  "password": zod.string().min(1)
})

export type RegisterBody = zod.input<typeof RegisterBody>;
export type RegisterBodyOutput = zod.output<typeof RegisterBody>;
