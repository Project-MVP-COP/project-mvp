import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SamplePage } from "./routes/SamplePage";
import { action } from "./routes/action";
import { loader } from "./routes/loader";
import { resetSamples } from "../../mocks/db";

/**
 * [핵심 통합 테스트]
 * 
 * 흐름: Component (UI) -> Action (Router) -> API (MSW) -> Component (Result)
 * 
 * 이 테스트는 사용자의 실제 유스케이스를 시뮬레이션하며, 
 * UI 조작이 데이터 계층(MSW)까지 전달되고 다시 UI에 반영되는 전체 파이프라인을 검증합니다.
 */
describe("Sample Feature Integration Flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // MSW 가상 DB 상태 초기화
    resetSamples();

    // 각 테스트마다 독립된 QueryClient를 생성하여 캐시 오염을 방지합니다.
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity, // 테스트 중 불필요한 자동 재요청 방지
        },
      },
    });
  });

  const renderFeature = () => {
    // React Router Data Mode 설정
    const router = createMemoryRouter([
      {
        path: "/",
        element: <SamplePage />,
        loader: loader(queryClient),
        action: action(queryClient),
      },
    ], { initialEntries: ["/"] });

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };

  it("초기 렌더링 시 MSW로부터 데이터를 조회하여 표시한다", async () => {
    renderFeature();

    // 초기 데이터 로드 대기
    await screen.findByDisplayValue("Hello World", {}, { timeout: 3000 });
    
    expect(screen.getByDisplayValue("Hello World")).toBeDefined();
    expect(screen.getByDisplayValue("System Down ASAP!")).toBeDefined();
  });

  it("새로운 샘플을 생성하면 API 호출 후 목록이 자동으로 갱신된다 (Full Flow)", async () => {
    renderFeature();

    // 1. 초기 상태 대기
    await screen.findByDisplayValue("Hello World", {}, { timeout: 3000 });

    // 2. 입력창에 텍스트 입력 및 생성 버튼 클릭
    const input = screen.getByPlaceholderText(/Enter sample message/i);
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "New Integrated Test Sample" } });
    
    // 3. 폼 제출 (Component -> Action -> API 요청 발생)
    fireEvent.submit(form);

    // 4. 기대 결과: 목록에 새로운 데이터가 반영되어야 함
    await waitFor(() => {
      expect(screen.getByDisplayValue("New Integrated Test Sample")).toBeDefined();
    }, { timeout: 5000 });
  });

  it("기존 샘플을 수정하면 UI에 즉시 반영된다", async () => {
    renderFeature();

    await screen.findByDisplayValue("Hello World", {}, { timeout: 3000 });

    const updateInput = screen.getByDisplayValue("Hello World");
    const updateButton = screen.getAllByRole("button", { name: /Update Msg/i })[0];
    const form = updateButton.closest("form")!;

    // 입력 내용 수정 후 제출
    fireEvent.change(updateInput, { target: { value: "Modified Message Content" } });
    fireEvent.submit(form);

    // 변경된 내용이 반영되었는지 확인
    await waitFor(() => {
      expect(screen.getByDisplayValue("Modified Message Content")).toBeDefined();
    }, { timeout: 5000 });
  });

  it("샘플 삭제 시 목록에서 제거된다", async () => {
    renderFeature();

    await screen.findByDisplayValue("Hello World", {}, { timeout: 3000 });

    const deleteButton = screen.getAllByRole("button", { name: "Delete" })[0];
    const deleteForm = deleteButton.closest("form")!;
    
    fireEvent.submit(deleteForm);

    // 목록에서 사라졌는지 확인
    await waitFor(() => {
      expect(screen.queryByDisplayValue("Hello World")).toBeNull();
    }, { timeout: 5000 });
  });
});
