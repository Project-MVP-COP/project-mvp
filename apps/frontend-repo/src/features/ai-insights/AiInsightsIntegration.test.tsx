import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { theme } from "@/app/theme";
import { resetAllMocks } from "@/mocks/db";
import { AiInsightsPage } from "@/features/ai-insights/routes/AiInsightsPage";
import { loader } from "@/features/ai-insights/routes/loader";

describe("AI insights integration flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    window.localStorage.clear();
    resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
  });

  const renderFeature = () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <AiInsightsPage />,
          loader: loader(queryClient),
        },
      ],
      { initialEntries: ["/"] },
    );

    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>,
    );
  };

  it("renders request controls and an empty result state before generation", async () => {
    renderFeature();

    await screen.findByText("AI 소비 인사이트", {}, { timeout: 3000 });

    expect(screen.getByLabelText("기간 조건")).toBeInTheDocument();
    expect(screen.getByLabelText("카테고리 조건")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "인사이트 생성" }),
    ).toBeInTheDocument();
    expect(screen.getByText("인사이트가 아직 없습니다")).toBeInTheDocument();
  });

  it("shows unclassified warning and prompt preview from current transactions", async () => {
    renderFeature();

    await screen.findByText("미분류 데이터 잔여", {}, { timeout: 3000 });
    fireEvent.click(screen.getByRole("button", { name: "프롬프트 보기" }));

    expect(screen.getByText("전송 프롬프트 미리보기")).toBeInTheDocument();
    expect(screen.getByText(/미분류 거래:/)).toBeInTheDocument();
  });

  it("generates insight results, supports re-request, and marks stale results when filters change", async () => {
    renderFeature();

    await screen.findByText("AI 소비 인사이트", {}, { timeout: 3000 });

    fireEvent.click(screen.getByRole("button", { name: "인사이트 생성" }));

    await screen.findByText("AI 인사이트", {}, { timeout: 3000 });
    expect(screen.getByText("가장 큰 지출 영역")).toBeInTheDocument();
    expect(screen.getByText("반복 소비 패턴")).toBeInTheDocument();
    expect(screen.getByText("소비 점검 포인트")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("기간 조건"), {
      target: { value: "LAST_1_MONTH" },
    });

    expect(
      await screen.findByText(/거래 데이터나 조회 조건이 변경되었습니다/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "인사이트 생성" }));
    await waitFor(() => {
      expect(
        screen.queryByText(/거래 데이터나 조회 조건이 변경되었습니다/),
      ).not.toBeInTheDocument();
    });
  });

  it("renders goal management, trajectory, and lets user choose this month's goal", async () => {
    renderFeature();

    await screen.findByText("AI 소비 인사이트", {}, { timeout: 3000 });
    fireEvent.click(screen.getByRole("button", { name: "인사이트 생성" }));

    await screen.findByText("목표 관리 & 총 절감", {}, { timeout: 3000 });
    expect(screen.getByText("절감·자산 추이")).toBeInTheDocument();
    expect(screen.getByText("이번 달 AI 추천 목표")).toBeInTheDocument();

    const chooseButtons = screen.getAllByRole("button", { name: "목표 선택" });
    fireEvent.click(chooseButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("선택된 목표")).toBeInTheDocument();
    });
  });
});
