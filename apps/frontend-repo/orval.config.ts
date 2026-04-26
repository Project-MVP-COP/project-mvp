import { defineConfig } from 'orval';

/**
 * Orval 코드 생성 설정 파일
 *
 * 실행 방법: pnpm generate:api
 *
 * 전제 조건: 백엔드 서버가 localhost:8080에서 실행 중이어야 합니다.
 *   cd apps/backend-repo && ./gradlew bootRun
 *
 * ADR-F08: OpenAPI 명세를 단일 진실 공급원(SSOT)으로 삼아
 * 백엔드 DTO 변경 사항을 프론트엔드 타입에 자동 반영합니다.
 */
export default defineConfig({
  /**
   * 'sample-api': 생성 타겟 그룹명.
   */
  'sample-api': {
    input: {
      target: 'http://localhost:8080/api-docs',
    },
    output: {
      /**
       * client: 'zod' → Request Body/Path Param Zod 검증 스키마를 생성합니다.
       */
      client: 'zod',
      /**
       * mode: 'single' → 모든 스키마를 단일 파일로 생성합니다.
       */
      mode: 'single',
      /**
       * target : Request 검증용 Zod 스키마 생성 위치
       * schemas: 컴포넌트 모델(DTO)을 Zod 스키마로 생성하도록 설정
       *
       * ⚠️ generated/ 디렉터리의 파일은 직접 수정하지 마세요.
       */
      target: 'src/features/sample/model/generated/schemas.ts',
      schemas: {
        path: 'src/features/sample/model/generated',
        type: 'zod',
      },
      override: {
        header: (info) =>
          [
            `/**`,
            ` * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY`,
            ` * `,
            ` * Source : ${info.title ?? 'OpenAPI'} v${info.version ?? 'unknown'}`,
            ` * Generated: ${new Date().toISOString()}`,
            ` * `,
            ` * Regenerate: pnpm generate:api`,
            ` *             (백엔드 서버 기동 필요: localhost:8080)`,
            ` */`,
            ``,
          ].join('\n'),
      },
    },
  },
});
