/**
 * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
 *
 * Source : AgileMVP API v0.0.1
 * Generated: 2026-04-26T02:10:46.239Z
 *
 * Regenerate: pnpm generate:api
 *             (백엔드 서버 기동 필요: localhost:8080)
 */
import * as zod from 'zod';

export const GetByIdParams = zod.object({
  "id": zod.number()
})


export const UpdateParams = zod.object({
  "id": zod.number()
})




export const UpdateBody = zod.object({
  "message": zod.string().min(1)
})


export const _DeleteParams = zod.object({
  "id": zod.number()
})


export const PatchParams = zod.object({
  "id": zod.number()
})

export const PatchBody = zod.object({
  "message": zod.string().optional(),
  "status": zod.string().optional()
})





export const CreateBody = zod.object({
  "message": zod.string().min(1)
})
