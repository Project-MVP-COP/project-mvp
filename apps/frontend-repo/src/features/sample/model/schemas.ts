import { z } from "zod";
import { SampleResponse as SampleSchema } from "./generated/sampleResponse.zod";

/**
 * API 응답 데이터의 타입 안정성을 위한 스키마
 * ADR-F08: 자동 생성된 스키마를 기반으로 하며, 필요 시 여기서 확장합니다.
 */
export { SampleSchema };

export const SampleListSchema = z.array(SampleSchema);
