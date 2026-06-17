import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { theme } from "@/app/theme";
import { resetWashingTransactions } from "@/mocks/db";
import { action } from "@/features/washing/routes/action";
import { loader } from "@/features/washing/routes/loader";
import { WashingPage } from "@/features/washing/routes/WashingPage";

describe("Washing feature integration flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    resetWashingTransactions();
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
          element: <WashingPage />,
          loader: loader(queryClient),
          action: action(queryClient),
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

  it("renders both separated washing sections", async () => {
    renderFeature();

    await screen.findByText("미분류 데이터 일괄 세척 필터", {}, { timeout: 3000 });
    expect(screen.getByText("전체 가계부 원천 데이터 관리")).toBeInTheDocument();
    expect(screen.getByText("미세척 3건")).toBeInTheDocument();
  });

  it("imports additional mock source data through the route action", async () => {
    renderFeature();

    await screen.findByText("전체 원천 건수", {}, { timeout: 3000 });
    expect(screen.getByText("7건")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Mock 데이터 추가 적재" }),
    );

    await waitFor(() => {
      expect(screen.getByText("9건")).toBeInTheDocument();
    });
  });
});
