# Frontend Agent Instructions

> 이 프로젝트의 프론트엔드 코드를 생성·수정할 때 반드시 준수해야 할 규칙입니다.
> 상세 UI 가이드: `docs/MANTINE_UI_GUIDE.md` | 아키텍처 상세: `README.md`

## Tech Stack

React 19 · TypeScript 6 · Mantine 9 · React Router 7 (Data Mode) · TanStack Query 5 · Zustand 5 · Zod 4 · react-hook-form 7 · Axios · Vite 8 · Vitest · MSW 2 · Orval 8

Brand color: `brandYellow` (#FFBC00) · Sub: `brandGray` (#4B433E) · Font: Pretendard

---

## CRITICAL RULES (위반 시 빌드 실패)

### 1. NEVER create CSS files or use inline styles

```tsx
// ❌ FORBIDDEN
<Box style={{ marginTop: "20px", width: "300px" }} />
<Box className="custom-class" />
// 새로운 .css, .module.css, .scss 파일 생성 금지

// ✅ REQUIRED — Mantine Style Props만 사용
<Box mt="lg" w={300} />
```

**유일한 예외**: `borderLeft` 등 Mantine Style Props에 없는 CSS 속성만 `style={{}}` 허용.

### 2. NEVER import across features

```tsx
// ❌ FORBIDDEN — ESLint boundaries가 차단
import { Something } from "@/features/auth/...";  // feature/sample 에서 호출 시

// ✅ OK
import { api } from "@/shared/api/axios";
import { toast } from "@/shared/ui/toast";
```

**의존 규칙**:
- `features → shared` ✅
- `features → features` ❌
- `shared → features` ❌
- `shared → app` ❌
- `app → shared, features` ✅

### 3. NEVER import axios directly

```tsx
// ❌ FORBIDDEN — ESLint no-restricted-imports가 차단
import axios from "axios";

// ✅ REQUIRED
import { api } from "@/shared/api/axios";
```

### 4. NEVER import notifications directly

```tsx
// ❌ FORBIDDEN
import { notifications } from "@mantine/notifications";

// ✅ REQUIRED — 격리된 래퍼 사용
import { toast } from "@/shared/ui/toast";
toast.success("저장 완료");
toast.error("오류 발생");
toast.info("알림");
toast.warning("경고");
```

### 5. NEVER edit files in `generated/` directories

`**/model/generated/` 디렉토리는 Orval이 자동 생성합니다. 수동 편집 금지.

### 6. Layout MUST use only Stack, Group, SimpleGrid

```tsx
// ❌ FORBIDDEN — CSS flex/grid/float 직접 사용
<div style={{ display: "flex" }}>

// ✅ 수직 배치
<Stack gap="md">{children}</Stack>

// ✅ 수평 배치
<Group justify="space-between" align="center">{children}</Group>

// ✅ 반응형 그리드
<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">{children}</SimpleGrid>
```

---

## Style Props Quick Reference

| Prop | CSS | 예시 |
|:-----|:----|:-----|
| `m`/`mt`/`mb`/`mx`/`my` | margin | `mt="md"`, `mb="xs"` |
| `p`/`pt`/`pb`/`px`/`py` | padding | `p="xl"`, `py="lg"` |
| `w`/`h`/`maw`/`mih` | width/height | `w={200}`, `w="100%"` |
| `fw` | font-weight | `fw={700}` |
| `fz` | font-size | `fz="sm"`, `fz={14}` |
| `c` | color | `c="dimmed"`, `c="red"` |
| `bg` | background | `bg="var(--mantine-color-body)"` |
| `ta` | text-align | `ta="center"` |
| `td` | text-decoration | `td="line-through"` |

**크기 키워드**: `xs` → `sm` → `md` → `lg` → `xl`

---

## Component Mapping

| 용도 | Mantine Component |
|:-----|:------------------|
| 페이지 래퍼 | `<Container size="xl">` |
| 카드/패널 | `<Paper withBorder p="xl" radius="md" shadow="sm">` |
| 제목 | `<Title order={1~6}>` |
| 텍스트 | `<Text>` |
| 텍스트 입력 | `<TextInput>` |
| 비밀번호 | `<PasswordInput>` |
| 숫자 입력 | `<NumberInput>` |
| 드롭다운 | `<Select>` |
| 버튼 | `<Button>` (기본 color="brandYellow") |
| 테이블 | `<Table highlightOnHover>` |
| 상태 칩 | `<Badge variant="light">` |
| 구분선 | `<Divider>` |
| 스켈레톤 | `<Skeleton>` |

**Button variants**: `filled`(기본) · `light`(부드럽게) · `outline`(테두리) · `transparent`(텍스트만)
**색상 용도**: `green`(성공/승인) · `red`(오류/삭제/취소) · `blue`(안내) · `orange`(경고) · `gray`(보조)

---

## State Management Rules

| 상태 유형 | MUST use |
|:----------|:---------|
| 서버 데이터 (API 응답) | TanStack Query (`useSuspenseQuery`) |
| 전역 앱 상태 (theme, auth) | Zustand (`useAppStore`) |
| 컴포넌트 로컬 상태 | `useState` / `useReducer` |
| URL 연동 상태 | React Router |

---

## Architecture: FSD 3-Layer

```
src/
├── app/                         # 전역 설정 (theme, router, store, providers)
├── shared/                      # 공용 인프라 (api, model, ui)
│   ├── api/axios.ts             #   Axios 인스턴스 (토큰 주입 + RFC 9457 에러)
│   ├── model/problemDetail.ts   #   RFC 9457 에러 Zod 스키마
│   └── ui/                      #   AppHeader, ErrorBoundary, NotFoundPage, toast/
├── features/{featureName}/      # 도메인 기능 모듈
│   ├── model/                   #   types.ts, schemas.ts, core.ts, generated/
│   ├── api/                     #   fetchers.ts, mutations.ts, queries.ts
│   ├── ui/                      #   컴포넌트들 (PageContent, PageSkeleton, List 등)
│   └── routes/                  #   Page.tsx, loader.ts, action.ts
└── mocks/                       # MSW (browser.ts, server.ts, db.ts, handlers.ts)
```

**Feature 내부 의존 방향**: `model` ← `api` ← `ui` ← `routes` (역방향 금지)

---

## New Feature Boilerplate

새 Feature를 추가할 때 `features/sample/`을 복제 기반으로 사용합니다. 아래 7개 파일을 생성하세요.

### model/types.ts

```tsx
import { z } from "zod";
import { {Name}Schema } from "./schemas";
import type { {Name}CreateRequest, {Name}UpdateRequest } from "./generated";

export type {Name} = z.infer<typeof {Name}Schema>;
export type { {Name}CreateRequest, {Name}UpdateRequest };
```

### model/schemas.ts

```tsx
import { z } from "zod";
import { {Name}Response as {Name}Schema } from "./generated/{name}Response.zod";

export { {Name}Schema };
export const {Name}ListSchema = z.array({Name}Schema);
```

### model/core.ts

```tsx
// FormData → Command 파싱 (순수 함수, React 의존 없음)
export type {Name}Command =
  | { type: "create"; payload: {Name}CreateRequest }
  | { type: "delete"; id: number }
  | { type: "unknown" };

export const parse{Name}Command = (formData: FormData): {Name}Command => {
  const intent = formData.get("intent");
  switch (intent) {
    case "create":
      return { type: "create", payload: { message: String(formData.get("message") || "") } };
    case "delete":
      return { type: "delete", id: Number(formData.get("id")) };
    default:
      return { type: "unknown" };
  }
};
```

### api/fetchers.ts

```tsx
import { api } from "@/shared/api/axios";
import { {Name}ListSchema } from "@/features/{name}/model/schemas";
import type { {Name} } from "@/features/{name}/model/types";

export const fetch{Name}s = async (): Promise<{Name}[]> => {
  const { data } = await api.get("/api/{name}");
  return {Name}ListSchema.parse(data);  // Zod 런타임 검증 필수
};
```

### api/mutations.ts

```tsx
import { api } from "@/shared/api/axios";
import type { {Name}CreateRequest } from "@/features/{name}/model/types";

export const create{Name} = async (payload: {Name}CreateRequest) => {
  const { data } = await api.post("/api/{name}", payload);
  return data;
};
export const delete{Name} = async (id: number) => {
  const { data } = await api.delete(`/api/{name}/${id}`);
  return data;
};
```

### api/queries.ts

```tsx
import { queryOptions } from "@tanstack/react-query";
import { fetch{Name}s } from "./fetchers";

export const {name}Keys = {
  all: ["{name}"] as const,
  lists: () => [...{name}Keys.all, "list"] as const,
  list: () => [...{name}Keys.lists()] as const,
  details: () => [...{name}Keys.all, "detail"] as const,
  detail: (id: number) => [...{name}Keys.details(), id] as const,
};

export const {name}Queries = {
  list: () => queryOptions({
    queryKey: {name}Keys.list(),
    queryFn: () => fetch{Name}s(),
  }),
};
```

### routes/Page + loader + action

```tsx
// routes/{Name}Page.tsx
import { Suspense } from "react";
import { {Name}PageSkeleton } from "../ui/{Name}PageSkeleton";
import { {Name}PageContent } from "../ui/{Name}PageContent";

export function {Name}Page() {
  return (
    <Suspense fallback={<{Name}PageSkeleton />}>
      <{Name}PageContent />
    </Suspense>
  );
}

// routes/loader.ts
import type { QueryClient } from "@tanstack/react-query";
import { {name}Queries } from "@/features/{name}/api/queries";

export const loader = (queryClient: QueryClient) => async () => {
  queryClient.prefetchQuery({name}Queries.list());
  return null;
};

// routes/action.ts
import type { QueryClient } from "@tanstack/react-query";
import { {name}Keys } from "@/features/{name}/api/queries";
import { create{Name}, delete{Name} } from "@/features/{name}/api/mutations";
import { parse{Name}Command } from "@/features/{name}/model/core";

export const action = (queryClient: QueryClient) => async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const command = parse{Name}Command(formData);
  try {
    switch (command.type) {
      case "create": await create{Name}(command.payload); break;
      case "delete": await delete{Name}(command.id); break;
    }
  } catch (error) { console.error("Action error:", error); throw error; }
  await queryClient.invalidateQueries({ queryKey: {name}Keys.all });
  return null;
};
```

### Router 등록 (`src/app/router.tsx`)

```tsx
{
  path: "{name}",
  element: <{Name}Page />,
  loader: {name}Loader(queryClient),
  action: {name}Action(queryClient),
},
```

---

## UI Patterns

### 페이지 헤더

```tsx
<Group justify="space-between" align="flex-end">
  <Stack gap={4}>
    <Title order={2}>
      제목 <Text component="span" c="brandYellow" inherit fw={900}>강조</Text>
    </Title>
    <Text size="sm" c="dimmed">부제목 설명</Text>
  </Stack>
  <Group gap="xs">
    <Button variant="light" color="gray" radius="xl">보조</Button>
    <Button radius="xl">주요</Button>
  </Group>
</Group>
```

### 필터 패널

```tsx
<Paper withBorder p="lg" radius="md" shadow="sm" bg="var(--mantine-color-body)">
  <Stack gap="md">
    <Text size="xs" fw={700} c="dimmed">조회 필터</Text>
    <Divider />
    <Group align="flex-end" grow>
      <TextInput label="시작일" type="date" />
      <Select label="카테고리" placeholder="전체" data={[...]} />
    </Group>
    <Group justify="flex-end" mt="xs">
      <Button variant="light" color="gray" size="xs" radius="xl">초기화</Button>
      <Button size="xs" radius="xl">적용</Button>
    </Group>
  </Stack>
</Paper>
```

### 데이터 테이블

```tsx
<Paper withBorder radius="md" shadow="sm" overflow="hidden">
  <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
    <Table.Thead bg="var(--mantine-color-gray-0)">
      <Table.Tr>
        <Table.Th>이름</Table.Th>
        <Table.Th ta="right">금액</Table.Th>
        <Table.Th ta="center">상태</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {items.map((item) => (
        <Table.Tr key={item.id}>
          <Table.Td><Text fw={700}>{item.name}</Text></Table.Td>
          <Table.Td ta="right">{item.amount.toLocaleString()}원</Table.Td>
          <Table.Td ta="center">
            <Badge color={item.active ? "green" : "red"} variant="light">
              {item.active ? "승인" : "취소"}
            </Badge>
          </Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
</Paper>
```

### 통계 카드

```tsx
<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
  <Paper withBorder p="xl" radius="md" shadow="sm">
    <Text size="xs" c="dimmed" fw={500}>라벨</Text>
    <Text size="xl" fw={700} mt="xs">1,245,600원</Text>
  </Paper>
</SimpleGrid>
```

### 확인 모달

```tsx
import { modals } from "@mantine/modals";

modals.openConfirmModal({
  title: "삭제 확인",
  children: <Text size="sm">정말 삭제하시겠습니까?</Text>,
  labels: { confirm: "삭제", cancel: "취소" },
  confirmProps: { color: "red" },
  onConfirm: () => toast.success("삭제 완료"),
});
```

---

## Form Patterns

### Simple: React Router Form + hidden intent

```tsx
<Form method="post">
  <input type="hidden" name="intent" value="create" />
  <TextInput name="message" label="메시지" required />
  <Button type="submit" loading={navigation.state === "submitting"}>생성</Button>
</Form>
```

### Complex: react-hook-form + Zod validation

```tsx
const form = useForm({ resolver: zodResolver(FormSchema) });
const submit = useSubmit();

const onSubmit = form.handleSubmit((values) => {
  const formData = new FormData();
  formData.append("intent", "create");
  Object.entries(values).forEach(([k, v]) => formData.append(k, String(v)));
  submit(formData, { method: "post" });
});
```

---

## Test Pattern

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/app/theme";
import { resetAllMocks } from "@/mocks/db";

describe("{Name} 통합 테스트", () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
  });

  const renderFeature = () => {
    const router = createMemoryRouter([{
      path: "/", element: <{Name}Page />,
      loader: loader(queryClient), action: action(queryClient),
    }], { initialEntries: ["/"] });
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>
    );
  };
});
```

---

## Key File Paths

| 파일 | 역할 |
|:-----|:-----|
| `src/app/theme.ts` | 브랜드 컬러, 폰트, 컴포넌트 기본값 |
| `src/app/router.tsx` | 라우트 정의 + 인증 가드 |
| `src/app/AppProvider.tsx` | 전역 Provider 조합 |
| `src/app/Layout.tsx` | AppShell + Header + Outlet |
| `src/app/queryClient.ts` | Query 클라이언트 + 전역 에러 핸들링 |
| `src/app/store/useAppStore.ts` | Zustand (colorScheme, auth session) |
| `src/shared/api/axios.ts` | Axios (토큰 주입, RFC 9457 에러) |
| `src/shared/ui/toast/index.ts` | 격리된 Toast 함수 |
| `eslint.config.js` | FSD 경계 규칙 + import 제한 |
| `orval.config.ts` | OpenAPI → Zod 코드 생성 설정 |

## Commands

```
pnpm dev              # 개발 서버 (Vite + MSW)
pnpm build            # 타입 검사 + 프로덕션 빌드
pnpm test             # Vitest 단발 실행
pnpm lint             # ESLint (boundaries 포함)
pnpm generate:api     # Orval → Zod 스키마 생성
```
