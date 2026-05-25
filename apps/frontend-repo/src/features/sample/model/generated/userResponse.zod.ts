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

export const UserResponse = zod.object({
  "id": zod.number().optional(),
  "loginId": zod.string().optional(),
  "nickname": zod.string().optional(),
  "status": zod.enum(['active', 'suspended', 'deleted']).optional(),
  "lastLoginAt": zod.string().optional(),
  "createdAt": zod.string().optional()
})

export type UserResponse = zod.input<typeof UserResponse>;
export type UserResponseOutput = zod.output<typeof UserResponse>;
