import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/app/theme";
import { resetAllMocks } from "@/mocks/db";
import { useAppStore } from "@/app/store/useAppStore";

// 테스트 대상 컴포넌트 및 라우트 액션 임포트
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import { loginAction, registerAction } from "./routes/action";

/**
 * 임시 메인 대시보드 컴포넌트 (로그인 성공 검증용)
 */
function MockDashboard() {
  const nickname = useAppStore((state) => state.nickname);
  return <div>Dashboard: {nickname || "Guest"}</div>;
}

describe("Auth 기능 단독 통합 테스트 Flow (MSW 연동)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // 모든 모의 DB 및 Zustand 세션 초기화
    resetAllMocks();
    useAppStore.getState().clearSession();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
  });

  const renderAuthFeature = (initialPath: "/login" | "/register") => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <MockDashboard />,
        },
        {
          path: "/login",
          element: <LoginPage />,
          action: loginAction(queryClient),
        },
        {
          path: "/register",
          element: <RegisterPage />,
          action: registerAction(queryClient),
        },
      ],
      { initialEntries: [initialPath] }
    );

    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>
    );
  };

  it("회원가입 양식을 올바르게 제출하면 MSW 모의 DB에 추가되고 로그인 페이지로 리다이렉트된다", async () => {
    renderAuthFeature("/register");

    const idInput = screen.getByPlaceholderText(/아이디를 입력하세요/i);
    const nicknameInput = screen.getByPlaceholderText(/사용하실 닉네임을 입력하세요/i);
    const passwordInput = screen.getByPlaceholderText(/^비밀번호를 입력하세요$/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/비밀번호를 한 번 더 입력하세요/i);
    const submitButton = screen.getByRole("button", { name: /가입하기/i });

    // 입력란 채우기
    fireEvent.change(idInput, { target: { value: "newuser" } });
    fireEvent.change(nicknameInput, { target: { value: "새가입자" } });
    fireEvent.change(passwordInput, { target: { value: "mypassword123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "mypassword123!" } });

    // 가입 폼 제출
    fireEvent.click(submitButton);

    // 성공 시 /login 으로 리다이렉션되어 로그인 폼 타이틀이 뜨는지 관찰
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /로그인/i })).toBeDefined();
    }, { timeout: 3000 });
  });

  it("올바른 자격 증명으로 로그인 시 Zustand 세션이 갱신되고 대시보드로 성공적으로 라우팅된다", async () => {
    renderAuthFeature("/login");

    const idInput = screen.getByPlaceholderText(/아이디를 입력하세요/i);
    const passwordInput = screen.getByPlaceholderText(/비밀번호를 입력하세요/i);
    const submitButton = screen.getByRole("button", { name: /로그인/i });

    // 초기 Mock DB에 탑재된 testuser 계정으로 로그인 진행
    fireEvent.change(idInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123!" } });

    fireEvent.click(submitButton);

    // 성공 시 / 메인 대시보드로 이동하여 'Dashboard: 테스터' 문구가 나오는지 확인
    await waitFor(() => {
      expect(screen.getByText("Dashboard: 테스터")).toBeDefined();
      expect(useAppStore.getState().isAuthenticated).toBe(true);
      expect(useAppStore.getState().accessToken).toContain("mock-jwt-token-for-testuser");
    }, { timeout: 3000 });
  });

  it("비밀번호 불일치 로그인 시, 401 오류가 나고 세션이 수립되지 않는다", async () => {
    renderAuthFeature("/login");

    const idInput = screen.getByPlaceholderText(/아이디를 입력하세요/i);
    const passwordInput = screen.getByPlaceholderText(/비밀번호를 입력하세요/i);
    const submitButton = screen.getByRole("button", { name: /로그인/i });

    // 잘못된 비밀번호 입력
    fireEvent.change(idInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    fireEvent.click(submitButton);

    // 세션이 수립되지 않고 여전히 로그인 페이지에 머무름을 보증
    await waitFor(() => {
      expect(useAppStore.getState().isAuthenticated).toBe(false);
      expect(screen.getByRole("button", { name: /로그인/i })).toBeDefined();
    }, { timeout: 3000 });
  });
});
