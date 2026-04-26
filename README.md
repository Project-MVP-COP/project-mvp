# Agile MVP Project

모던 웹 기술(React/Spring Boot)을 적용한 Agile MVP 프로젝트입니다. 이 저장소(Repository)는 Monorepo 형태로 구성되어 있으며, 프론트엔드와 백엔드 서브젝트를 나누어 관리하고 있습니다.

## 📂 프로젝트 진입점

각 워크스페이스의 문서(README) 및 상세 아키텍처 설명은 아래 링크를 통해 확인하실 수 있습니다.

### 1. [Frontend Repository (React)](./apps/frontend-repo/README.md)
React 19 기반의 프론트엔드 웹 애플리케이션입니다. 
- **주요 스펙**: TypeScript, React 19, React Router v7, React Query v5, Vite, MSW
- 클라이언트 컴포넌트 관점에서의 API 통신, 로컬 CRUD Mocking, 데이터 통합(Loader/Action) 핸들링에 대한 샘플 코드가 작성되어 있습니다.

### 2. [Backend Repository (Spring Boot)](./apps/backend-repo/README.md)
Spring Boot 4 기반의 RESTful API 시스템입니다.
- **주요 스펙**: Java 25, Spring Boot 4, MyBatis, H2 Database, Gradle
- RFC 9457의 글로벌 에러 처리 표준, API 맵핑 및 Swagger 구성 등 개발 모범 사례(Boilerplate) 코드가 3계층 아키텍쳐 단위로 작성되어 있습니다.

---

## 🚀 워크스페이스 실행 가이드

각 워크스페이스 폴더로 이동하여 독립적인 실행 스크립트로 동작을 확인할 수 있습니다.

### 프론트엔드 (Frontend Repo) 구동
```bash
cd apps/frontend-repo
pnpm install
pnpm dev
```
- 기본 실행: `http://localhost:5173`
- 의존성 설치 이후 `pnpm dev` 시 MSW 모의 서버를 통한 로컬 환경으로 기동됩니다.

### 백엔드 (Backend Repo) 구동
```bash
cd apps/backend-repo
./gradlew bootRun
```
- 기본 실행: `http://localhost:8080`
- 구동 후 API 문서화 사이트인 [Swagger UI (http://localhost:8080/swagger-ui.html)](http://localhost:8080/swagger-ui.html)를 통해 상세 스펙을 확인할 수 있습니다.

---

## 📘 Architecture Decision Records (ADRs) - Project-MVP-COP

본 문서는 Project-MVP-COP(Agile MVP) 프로젝트의 주요 아키텍처 결정 사항을 기록합니다. 각 ADR은 **맥락(Context)**, **결정(Decision)**, **결과(Consequences)**, **재검토 시점(When to Revisit)**을 포함하며, 신규 팀원 온보딩 및 향후 기술 부채 상환 시점의 지표로 활용됩니다.

### 🌐 1. 공통 (Common) 아키텍처 결정 사항

#### ADR-C01: 리소스 수정 규약 – PUT(전체 교체) 우선 전략
- **Context**: REST API에서 리소스 업데이트는 PUT(전체)과 PATCH(부분)로 나뉩니다. 프론트엔드(React)의 도메인 모델은 불변성(Immutability)을 띠고 있어 폼 제출 시 항상 전체 데이터를 쥐고 있습니다. PATCH를 위해 변경된 필드만 추려내거나 백엔드에서 암묵적 기본값을 주입하는 것은 상태 동기화의 복잡도를 높입니다.
- **Decision**: 리소스 수정 시 FE는 항상 전체 DTO를 전송하고, BE는 이를 받아 PUT(전체 교체) 방식으로 덮어쓰는 것을 기본(Default) 컨벤션으로 합의합니다. PATCH는 상태 토글(status) 등 극히 제한적인 단일 필드 변경에만 예외적으로 허용합니다.
- **Consequences**: FE/BE 간 데이터 정합성 충돌을 예방하고 FE 상태 관리 복잡성을 대폭 낮춥니다. 단, 페이로드 크기가 미세하게 증가합니다.
- **When to Revisit**: 여러 사용자의 동시 편집 충돌 병합(CRDT)이 필요해지거나 트래픽 병목이 발생할 때.

#### ADR-C02: 유효성 검증(Validation)의 단일 진실 공급원 (SSOT)
- **Context**: FE와 BE 양쪽에서 동일한 비즈니스 룰을 이중으로 검증하면 스펙 변경 시 유지보수 피로도가 급증합니다.
- **Decision**: 프론트엔드(Zod)는 '데이터 파싱 및 런타임 타입 보장(Parse, don't validate)'에만 집중합니다. 복잡한 비즈니스 유효성 검증은 **백엔드(@Valid 및 비즈니스 로직)**에 전적으로 위임하며, 검증 실패 시 RFC 9457(application/problem+json) 표준 규격으로 상세 필드 에러를 반환합니다.
- **Consequences**: 검증 룰이 BE에 중앙화되어 유지보수가 용이해지며, FE는 BE가 주는 에러 메시지를 렌더링하기만 하면 됩니다.

#### ADR-C03: Feature Toggle 기반 무중단 통합 (애자일 병합 전략)
- **Context**: 8인 체제에서 긴 브랜치 작업은 심각한 병합 충돌을 낳습니다. 미완성 기능이라도 Main 브랜치에 자주 병합해야 합니다.
- **Decision**: 백엔드는 @FeatureToggle 어노테이션을 통해 환경 변수로 API 접근을 제어하며 비활성 시 404 Not Found를 반환합니다. 프론트엔드는 이 404 응답을 ErrorBoundary에서 캐치하여 우아하게 Fallback UI("준비 중인 기능입니다")를 렌더링합니다.
- **Consequences**: 인프라 없이 코드 레벨에서 미완성 기능을 숨길 수 있어 앱 크래시를 방지하고 빠른 통합이 가능합니다.

---

### 🖥️ 2. 백엔드 (BE) 아키텍처 결정 사항
*백엔드 전용 아키텍처 결정 사항은 아래 문서에서 상세히 확인할 수 있습니다.*
- **[Backend ADRs 상세 보기](./apps/backend-repo/README.md#-architecture-decision-records-adrs)**
  - ADR-B01: 데이터 접근 기술 (MyBatis)
  - ADR-B02: 패키지 구조 (도메인 내 3계층 분리)
  - ADR-B03: 도메인 모델 생성 방식 및 테스팅 전략
  - ADR-B04: 로깅 및 트레이싱 표준화 (Trace ID)

---

### ⚛️ 3. 프론트엔드 (FE) 아키텍처 결정 사항
*프론트엔드 전용 아키텍처 결정 사항은 아래 문서에서 상세히 확인할 수 있습니다.*
- **[Frontend ADRs 상세 보기](./apps/frontend-repo/README.md#-architecture-decision-records-adrs---project-mvp-cop)**
  - ADR-F01: FSD 실용적 단순화 및 경계 통제
  - ADR-F02: 의도적 코드 중복 허용 (AHA)
  - ADR-F03: Router Data Mode 및 로직 분리
  - ADR-F04: 전역 에러 처리의 의존성 역전 (IoC)
  - ADR-F05: 외부 UI 라이브러리(Mantine) 격리
  - ADR-F06: 정적 자산 및 패스 알리아스 최적화
  - ADR-F07: 데이터 패칭 및 상태 관리 체계 분리
  - ADR-F08: MSW + Zod 기반 API 계약 동기화
