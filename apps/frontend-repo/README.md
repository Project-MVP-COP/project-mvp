# Agile MVP Frontend Project

본 프로젝트는 React 19 기반의 프론트엔드 애플리케이션으로, 백엔드 API와의 연동 및 로컬 모킹(MSW) 환경을 제공하여 독립적인 UI 컴포넌트 개발을 돕는 레퍼런스 프로젝트입니다.

## 🛠️ 기술 스택
- **언어**: TypeScript
- **프레임워크**: React 19
- **라우팅**: React Router v7
- **상태 관리 및 데이터 패칭**: TanStack React Query v5
- **빌드 툴**: Vite 6
- **API 모킹**: MSW(Mock Service Worker) v2

## 📦 주요 프로젝트 의존성 (Dependencies)
`package.json`에 명시된 주요 라이브러리 및 의존성은 다음과 같습니다.

- **React / React DOM**: 애플리케이션 UI 구축을 위한 핵심 라이브러리
- **React Router** (`react-router`): 데이터 라우팅 및 Data Mode(Loader/Action)를 활용한 라우팅 체계 구성
- **TanStack React Query** (`@tanstack/react-query`): 서버 상태 관리, 캐싱, 동기화 및 에러 핸들링
- **MSW** (`msw`): Service Worker를 이용해 네트워크 레벨에서 API 요청을 가로채고 모의 응답을 제공하여 백엔드 없이 개발/테스트 수행
- **Vite** (`vite`): 빠른 HMR(Hot Module Replacement) 기능 및 빌드 구성을 제공하는 프론트엔드 툴

## 🚀 실행 및 빌드 방법

### 1. 의존성 설치
프로젝트 루트에서 Pnpm을 사용하여 패키지 의존성을 설치합니다.
```bash
pnpm install
```

### 2. 애플리케이션 실행 (개발 모드)
다음 명령어를 통해 개발 서버를 기동합니다.
```bash
pnpm run dev
# 또는
npm run dev
```

### 3. 애플리케이션 빌드
운영 환경으로 배포하기 위한 애플리케이션을 빌드합니다.
```bash
pnpm run build
```

---

## 📂 프로젝트 구조 (Project Structure)

```text
.
├── public/                 # 정적 리소스 및 MSW Service Worker 스크립트 (mockServiceWorker.js)
├── src/
│   ├── mocks/              # MSW 모킹 핸들러 설정
│   │   ├── browser.ts      # 브라우저 환경 워커 설정
│   │   └── handlers.ts     # Sample CRUD API의 Mock 핸들러 로직 (상태 관리 포함)
│   ├── App.tsx             # 샘플 CRUD 애플리케이션 및 화면 구성
│   └── main.tsx            # React 앱 진입점, MSW 초기화 및 React Router 인덱스 설정
├── index.html              # HTML 템플릿 파일
├── package.json            # 패키지 매니저 메타데이터 및 의존성
├── tsconfig.json           # 통합 타입스크립트 환경 설정
└── vite.config.ts          # Vite 환경 및 플러그인 로더 설정
```

---

## 📘 핵심 기술 아키텍처 및 특징

본 프로젝트는 최신 React 웹 기술 표준을 채택하여 단순하고 직관적인 개발 구조를 제공합니다.

### 1. React Router 7 Data Mode 활용
- 전통적인 방식에서 벗어나, `createBrowserRouter`와 **Data Mode (Loader & Action)** 를 도입했습니다.
- `loader`: 컴포넌트 렌더링 전 사전 필요한 데이터를 미리 Fetch 해옵니다.
- `action`: Form 제출처럼 데이터를 서버에 반영하는(Create, Update, Delete) 책임을 위임받아 수행합니다.

### 2. React Query 통합 (Server State)
- 비동기 로직 및 상태 캐싱에 React Query 구조를 도입했습니다.
- `useQuery`를 통해 컴포넌트는 항상 최신화된 서버 데이터만을 바라보게 설계되어 있습니다.
- `loader`는 React Query의 `ensureQueryData`를 통해 캐싱을 활용해 요청 지연 시간을 줄입니다.
- `action`은 작업 수행 후 `invalidateQueries`를 통해 React Query의 캐시를 무효화시켜, 화면이 즉시 최신화되도록 유도합니다.

### 3. MSW (Mock Service Worker) 주도 개발
- 백엔드 코드(`backend-repo`)가 완성되지 않은 시점이라 하더라도 MSW의 HTTP 요청 핸들러 기반하에 독립적인 UI 개발이 가능합니다.
- 단순한 JSON 정적 반환뿐 아니라 메모리에 상태(배열 객체)를 유지하여 실제 DB와 상호작용하듯 CRUD Mock API 테스트를 제공합니다. (`src/mocks/handlers.ts`)

---

## 👩‍💻 개발자 가이드 (단위 업무 개발 시)

1. **API Mocking이 필요한 경우**: `src/mocks/handlers.ts` 내부에 백엔드의 응답 스펙과 동일한 핸들러를 정의합니다.
2. **화면 렌더링(Read)**: `loader` 내부에서 API 호출 후 데이터를 Query 캐싱하며 해당 화면(예: `App.tsx`)에서 `useQuery()`로 렌더링합니다.
3. **사용자 액션(Create/Update/Delete)**: UI 요소에서 제공되는 `Form` 인터페이스를 통해 이벤트를 발생시킵니다. 그러면 `action` 이벤트를 가로채어 API를 호출하고 로직을 처리한 뒤 내부 캐시를 무효화해주어 컴포넌트 변경을 트리거하게 됩니다.
