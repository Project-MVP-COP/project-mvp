# 🧭 아키텍처 회고록 (Architecture Retrospective)

> **문서 목적**: 본 문서는 Project-MVP(MOTIFIN) 프로젝트를 초기 보일러플레이트 설계부터 최종 완성(Core Cycle vNext)까지 완주한 후, 초기 아키텍처 의사결정(ADR)들이 실제로 어떻게 작동했는지, 어떤 나비효과(스노우볼링)를 낳았는지 학습 목적으로 복기한 회고록입니다.

---

## 1. 한눈에 보는 아키텍처 성적표: 초기 설계 vs 완료 시점

프로젝트 초기에는 `sample`과 `auth` 중심의 **교과서적인 독립 CRUD 보일러플레이트**로 출발했으나, 완료 시점에는 **"이용내역 정리(Washing/Rule) ➔ 서버 근거 기반 AI 소비 분석(Analysis) ➔ 목표 수립 및 추적(GoalCycle)"**이 유기적으로 맞물리는 복합 도메인 애플리케이션으로 진화했습니다.

| 구분 | 유지/변화율 | 핵심 요약 |
| :--- | :---: | :--- |
| **지켜진 원칙** | **약 85%** | 폴더/패키지 물리적 구조, ESLint 의존성 단방향 가드레일, RFC 9457 전역 에러 처리, Zod 런타임 파싱, Flyway 마이그레이션(`V1`~`V9`), MSW 통합 테스트 문화 |
| **변형·우회된 원칙** | **약 30~40%** | 교차 도메인 여정(Core Cycle) 구현 과정에서 `app/`과 `shared/model/`의 역할 변형, Orval 타입 자동 생성 중단, Router Action에서 TanStack Query로의 중심 이동, Lombok Builder에서 Java `record`로의 전환 |

---

## 2. 아키텍처 의사결정이 굴린 3가지 '스노우볼링(나비효과)'

### ❄️ 스노우볼 1: `entities` 계층 제거(`ADR-F01`) + 피처 간 참조 금지(`ADR-F02`)의 풍선효과

* **초기 결정**: FSD(Feature-Sliced Design)를 `app`, `shared`, `features` 3계층으로 단순화하고, `features/A`가 `features/B`를 직접 참조하지 못하도록 `eslint-plugin-boundaries`로 차단했습니다.
* **굴러간 스노우볼**:
  1. 제품 후반부의 핵심 가치가 **"목표(`goals`) 화면에서 업데이트를 누르면 이용내역(`washing`) 화면으로 이동해 정리 상태를 점검하고 다시 목표로 복귀하는 여정"**이 되면서 피처 간 데이터·상태 공유가 필수적이 되었습니다.
  2. 피처끼리 직접 import할 수 없고 중간 `entities` 계층도 없다 보니 두 곳에서 풍선효과가 발생했습니다.
     * **`app/` 계층의 비대화**: `src/app/WashingEntry.tsx`, `src/app/RuleEngineBuilderPage.tsx` 등 최상위 진입점 컴포넌트들이 단순 레이아웃 조립을 넘어 `washing` 쿼리와 `goals` 쿼리를 동시에 호출하고 리비전(revision)을 비교하는 **교차 도메인 비즈니스 컨트롤러** 역할을 떠안게 되었습니다.
     * **`shared/model/`의 사실상 `entities`화**: 원래 도메인 지식이 없어야 할 `shared/model/`에 `transaction.ts`, `analytics.ts`, `analysisEligibility.ts`, `goalReturnPath.ts` 등이 자리 잡으며 **이름만 `shared`인 공유 도메인 모델 계층(`entities`)이 자연 발생**했습니다.
* **배운 점**: 도메인 간 파이프라인 연결이 강한 제품에서는 `entities`(공유 도메인 모델) 계층을 아예 제거하면 결국 `shared`와 `app`이 그 부담을 대신 지게 됩니다.

### ❄️ 스노우볼 2: 백엔드의 "수정 대신 옆에 새로 짓기(v1 ➔ vNext 공존)"

* **초기 결정**: 백엔드를 도메인별 3계층(`controller`, `service`, `repository`)으로 분리(`ADR-B02`)하고, 잦은 Main 병합으로 회귀(Regression)를 막기로 했습니다.
* **굴러간 스노우볼**:
  * 초기 도메인(`washing`, `insight`, `monthlygoal`, `chart`) 구축 이후 제품이 MOTIFIN vNext로 고도화될 때, 기존 패키지와 테스트를 깨뜨리지 않기 위해 **새 도메인 패키지를 옆에 신설**하는 방식으로 진화했습니다.
    * `insight` (`/api/insights`) ➔ `analysis` (`/api/v2/analyses`)
    * `monthlygoal` ➔ `goalcycle`
    * 초기 거래 처리 ➔ `transaction` (`TransactionFoundation` 도입)
  * **결과**: 기존 기능을 깨지 않고 안전하게 배포하는 데는 성공했으나, 완료 시점의 백엔드에는 **구버전과 신버전 도메인이 총 12개 패키지로 공존**하게 되었고, `GoalCycle`이 `analysis` 패키지의 `AnalyticsSnapshot`을 직접 참조하는 등 도메인 간 의존성이 생겨났습니다.

### ❄️ 스노우볼 3: "검증의 단일 진실 공급원(BE SSOT) + Parse, don't validate"(`ADR-C02`)의 진화

* **초기 결정**: 원래는 폼 입력 검증을 백엔드에 집중하고 프론트엔드는 Zod로 응답 파싱만 하자는 기본적인 규칙이었습니다.
* **굴러간 스노우볼**:
  * 이 철학이 후반부 **소비 내역 정규화(`TransactionFoundation`)와 AI 분석(`analysis`)**으로 확장되면서 가장 긍정적인 시너지를 냈습니다.
  * 프론트엔드는 거래의 분석 적격 여부를 임의로 추론하지 않고 서버가 내려준 `foundation.spendingEligible`만 신뢰하도록 설계되었습니다.
  * 나아가 AWS Bedrock(LLM) 연동 시에도 **AI의 출력조차 신뢰하지 않고**, LLM이 생성한 문장에 집계 근거 밖의 숫자(`LITERAL_NUMBER`)가 포함되면 백엔드가 이를 검증해 거부하거나 1회 자동 교정(Retry)을 수행하고, 프론트엔드는 다시 Zod 스키마로 엄격히 파싱하는 **이중 방어 아키텍처**로 발전했습니다.

---

## 3. 성공한 결정 (Keep) vs 실패·도태된 결정 (Drop / Revise)

### 👍 성공한 아키텍처 결정 (Keep)

1. **ESLint Boundaries를 통한 물리적 가드레일 (`ADR-F01`)**
   * `eslint.config.js`를 통해 `model` 세그먼트의 순수성(`ui`, `api`, `routes` 참조 금지)을 시스템적으로 강제한 덕분에, 프로젝트 막바지 급박한 UI/인터랙션 폴리싱 와중에도 도메인 계산 로직과 뷰 코드가 뒤섞이지 않았습니다.
2. **RFC 9457 `ProblemDetail` + 전역 에러 처리 IoC (`ADR-C02`, `ADR-F04`)**
   * 백엔드 `GlobalExceptionHandler`와 프론트엔드 `axios.ts` ➔ `queryClient.ts`로 이어지는 에러 파이프라인은 초기에 한 번 구축한 뒤 프로젝트가 끝날 때까지 수정 없이 모든 도메인 에러와 AI 타임아웃(`INS001~003`)까지 일관되게 처리했습니다.
3. **MSW 기반 Mock-First 및 통합 테스트 전략**
   * 백엔드 서버나 AWS Bedrock 연결 없이도 `CoreCycleIntegration.test.tsx`, `AiInsightsIntegration.test.tsx` 등을 통해 전체 사용자 여정을 검증할 수 있었던 것이 후반부 리팩토링과 UI 상태 전환(Reveal 효과 등)의 안정성을 지킨 일등 공신이었습니다.

### 👎 실패했거나 도중에 버려진 결정 (Drop / Revise)

1. **Orval 기반 OpenAPI 타입 자동 동기화 (`ADR-F08`) ➔ 사문화**
   * **현상**: `orval.config.ts`에는 초기 `sample-api`와 `auth-api`만 남아 있고, 실제 핵심 피처(`washing`, `ai-insights`, `goals`, `rule-engine-builder`)는 모두 개발자가 수동으로 Zod 스키마를 작성했습니다.
   * **원인**: `pnpm generate:api`를 실행하려면 **"로컬에서 백엔드 서버(`localhost:8080`)를 먼저 띄워야 한다"**는 전제 조건이 있었는데, 이는 **Mock-First 프론트엔드 선행 개발** 및 병렬 작업 흐름과 정면으로 충돌했습니다.
2. **React Router Data Mode (`loader`/`action`) 중심 설계 (`ADR-F03`) ➔ 반쪽짜리 활용**
   * **현상**: 초기 `sample`, `auth`, `washing`까지만 Router `action`을 사용했고, 후반부 피처(`goals`, `ai-insights`, `rule-engine-builder`)는 상태 변경과 비동기 제어를 모두 **TanStack Query(`useQuery` / `useMutation`)**로 처리했습니다.
   * **원인**: 페이지 전환 없이 한 화면 안에서 규칙을 미리보기(Dry-run)하거나 AI 분석 애니메이션을 제어하는 리치한 SPA 환경에서는 Router `action`보다 TanStack Query의 `useMutation`이 훨씬 직관적이었습니다. **SPA에서 Router Data Mode와 TanStack Query를 동시에 쓰면 역할이 겹쳐 결국 TanStack Query로 수렴**함을 확인했습니다.
3. **Lombok `@Builder(PRIVATE)` + `create()` 강제 (`ADR-B03`) ➔ Java `record`로 자연 대체**
   * **현상**: 초기 도메인(`Sample`, `User`, `Category`, `Rule`)까지는 클래스 + `@Builder(access = AccessLevel.PRIVATE)`를 지켰으나, 후반부 핵심 도메인(`GoalCycle`, `Analysis`)에서는 도메인 모델 자체를 **Java 25 `record`**로 작성했습니다.
   * **원인**: 불변성(Immutability) 유지를 위해서는 Lombok 어노테이션 조합보다 순수 `record`가 훨씬 간결하고 MyBatis 생성자 매핑과도 잘 맞았기 때문입니다.

---

## 4. 초기에 추가했으면 좋았을 ADR (Missing ADRs)

1. **`ADR-C04`: 도메인 간 계층 위계(DAG) 및 공유 도메인 모델(`entities`) 규약**
   * 프론트엔드에는 공유 도메인 모델을 담을 얇은 `entities` 계층을 허용하고, 백엔드에는 `GoalCycle -> Analysis -> Transaction -> Category`로 흐르는 도메인 간 단방향 의존성 그래프(DAG)를 명시했어야 했습니다.
2. **`ADR-C05`: 비결정론적 AI(LLM) 응답의 신뢰 경계(Trust Boundary) 규약**
   * *"수치 계산과 집계는 100% 서버 코드(`AnalyticsSnapshot`)가 수행하고, AI는 확정된 근거(`evidenceIds`)의 해석만 생성한다"*는 원칙과 응답 검증·재시도(Self-Correction)·폴백 계약을 AI 도입 전에 먼저 정의했어야 했습니다.
3. **`ADR-C06`: 도메인 모델 진화 시 구버전 폐기(Sunset) 정책**
   * v1 도메인(`insight`, `monthlygoal`)을 vNext 도메인(`analysis`, `goalcycle`)으로 대체할 때 구버전 패키지와 엔드포인트를 언제 제거할지 기준을 정해두었어야 코드베이스의 인지 부하를 줄일 수 있었습니다.

---

## 5. 중간에 나타났던 변경 신호(Smells)와 향후 포착 전략

### 🚨 코드베이스에 나타났던 4가지 아키텍처 변경 신호

1. **`shared/model/`에 비즈니스 용어가 등장한 순간**: `problemDetail.ts`만 있던 곳에 `transaction.ts`, `analytics.ts`, `goalReturnPath.ts`가 추가됨 ➔ *"공유 도메인(`entities`) 계층이 필요하다"*는 신호.
2. **`app/` 폴더에 `*Entry.tsx`가 생기며 무거워진 순간**: `WashingEntry.tsx`에 교차 도메인 비교용 `useEffect`가 들어감 ➔ *"피처 간 참조 금지 규칙을 피하려고 비즈니스 로직이 `app/`으로 탈출하고 있다"*는 신호.
3. **3번째 피처(`washing`)에서 `orval.config.ts`가 멈춘 순간**: 아무도 `pnpm generate:api`를 실행하지 않고 수동 `schemas.ts`를 만듦 ➔ *"자동화 도구가 개발 워크플로우와 충돌해 버려지고 있다"*는 신호.
4. **`router.tsx`에 `loader: protectedLoader(async () => null)`이 등장한 순간**: 라우터 로더가 데이터 패칭을 포기하고 가드 역할만 수행함 ➔ *"Router Data Mode가 현재 UI 패턴과 맞지 않는다"*는 신호.

### 🤔 왜 제때 포착하지 못했는가?

* **"린트 통과 = 아키텍처 준수"라는 착시**: `eslint-plugin-boundaries`가 `features/A -> features/B`만 감시했기 때문에, 코드를 우회로인 `shared/`나 `app/`으로 옮기면 린트 에러는 0건이 되어 구조 왜곡을 정상으로 착각했습니다. (특히 AI 에이전트는 린트 에러를 피하기 위해 가장 빠른 우회로인 `shared`와 `app`을 적극적으로 활용합니다.)
* **현실성 없는 `When to Revisit` 조건**: ADR의 재검토 시점이 *"트래픽 병목이 발생할 때"*, *"CRDT가 필요할 때"*처럼 토이 프로젝트에서는 오지 않을 미래 조건으로 적혀 있어 중간 점검 트리거가 되지 못했습니다.
* **티켓 단위의 국소 최적화**: 개별 기능 티켓을 완수하는 데 집중하느라 전체 폴더 트리를 조망하는 줌아웃(Zoom-out) 타이밍이 없었습니다.

### 🎯 다음 프로젝트를 위한 3가지 실전 포착 장치

1. **우회로 폴더(`shared`, `app`)에 카나리아 트리거(Canary Trigger) 걸기**
   * 피처 격리의 풍선효과는 반드시 `shared/`와 `app/`에서 터집니다. *"새로운 파일이 `shared/model/`이나 `app/`에 추가될 때는 아키텍처 변경 신호로 간주한다"*는 규칙을 세우고, `AGENTS.md`에도 **"피처 간 공유를 위해 `shared`나 `app`에 도메인 코드를 올리기 전 반드시 아키텍처 변경(예: `entities` 도입)을 먼저 제안하라"**고 명시합니다.
2. **ADR의 `When to Revisit`를 '도메인 개수/개발 이벤트' 기준으로 작성하기**
   * 추상적인 비기능 요건 대신 *"3번째 도메인 API 연동 직후에도 수동 작성이 빠르면 Orval을 폐기한다"*, *"2개 이상의 피처가 같은 서버 데이터를 참조하는 첫 화면이 나오면 `entities` 계층을 도입한다"*처럼 반드시 마주칠 이벤트로 재검토 조건을 걸어둡니다.
3. **마일스톤 통합 시점의 '5분 파일 트리(Tree) 스캔'**
   * 기능 2~3개를 묶어 `main`에 병합하기 직전, 코드 세부 구현 대신 `ls src/shared/model src/app src/features`와 `orval.config.ts`만 5분간 대조해 보아도 도구의 사문화나 우회로 비대화를 즉시 포착할 수 있습니다.
