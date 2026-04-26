/**
 * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
 *
 * Source : AgileMVP API v0.0.1
 * Generated: 2026-04-26T02:09:17.954Z
 *
 * Regenerate: pnpm generate:api
 *             (백엔드 서버 기동 필요: localhost:8080)
 */
import type { SampleResponseStatus } from './sampleResponseStatus';

export interface SampleResponse {
  id?: number;
  message?: string;
  status?: SampleResponseStatus;
  urgent?: boolean;
  updatedAt?: string;
}
