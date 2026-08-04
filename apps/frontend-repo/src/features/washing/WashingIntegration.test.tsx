import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { theme } from "../../app/theme";
import { resetLedgerTransactions, resetWashingTransactions } from "../../mocks/db";
import { action } from "./routes/action";
import { loader } from "./routes/loader";
import { WashingPage } from "./routes/WashingPage";

describe("Washing feature integration flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    resetLedgerTransactions();
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

  it("renders both washing sections", async () => {
    renderFeature();

    await screen.findByText("미분류 데이터 일괄 세척 필터", {}, { timeout: 3000 });
    expect(screen.getByText("Bulk Wash")).toBeInTheDocument();
    expect(screen.getByText("매핑 적용 규칙/태그")).toBeInTheDocument();
  });

  it("keeps bulk wash waiting items aligned with source-data unclassified rows", async () => {
    renderFeature();

    await screen.findByText("매핑 적용 규칙/태그", {}, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText("세척 상태"), {
      target: { value: "unclassified" },
    });

    const tables = document.querySelectorAll("table");
    const bulkWashTable = tables[0];
    const sourceTable = tables[1];
    expect(bulkWashTable).toBeDefined();
    expect(sourceTable).toBeDefined();
    if (!bulkWashTable || !sourceTable) throw new Error("Expected both washing tables");

    const bulkRows = bulkWashTable.querySelectorAll("tbody tr");
    const unclassifiedSourceRows = sourceTable.querySelectorAll("tbody tr");

    expect(bulkRows.length).toBe(unclassifiedSourceRows.length);
  });

  it("does not expose the mock import button", async () => {
    renderFeature();

    await screen.findByText("매핑 적용 규칙/태그", {}, { timeout: 3000 });
    expect(screen.queryByRole("button", { name: "Mock 데이터 추가 적재" })).not.toBeInTheDocument();
  });

  it("opens a detail modal for a single unclassified item and saves its category", async () => {
    renderFeature();

    await screen.findByText("미분류 데이터 일괄 세척 필터", {}, { timeout: 3000 });

    const bulkWashTable = document.querySelectorAll("table")[0];
    expect(bulkWashTable).toBeDefined();
    if (!bulkWashTable) throw new Error("Expected bulk wash table");

    const initialRows = bulkWashTable.querySelectorAll("tbody tr");
    expect(initialRows.length).toBeGreaterThan(0);

    const firstRow = initialRows[0];
    if (!firstRow) throw new Error("Expected first bulk wash row");

    fireEvent.click(firstRow);

    const dialog = await screen.findByRole("dialog");
    const modalCategorySelect = within(dialog).getByRole("combobox");
    fireEvent.change(modalCategorySelect, { target: { value: "1:식음료" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(within(dialog).queryByRole("button", { name: "저장" })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const updatedRows = document.querySelectorAll("table")[0]?.querySelectorAll("tbody tr");
      expect(updatedRows?.length).toBe(initialRows.length - 1);
    });

    fireEvent.change(screen.getByLabelText("세척 상태"), {
      target: { value: "unclassified" },
    });

    const sourceTable = document.querySelectorAll("table")[1];
    const remainingSourceRows = sourceTable?.querySelectorAll("tbody tr");
    const remainingBulkRows = document.querySelectorAll("table")[0]?.querySelectorAll("tbody tr");

    expect(remainingSourceRows?.length).toBe(remainingBulkRows?.length);
  });

  it("saves both category and mapping rule tag from the source data table", async () => {
    renderFeature();

    await screen.findByText("매핑 적용 규칙/태그", {}, { timeout: 3000 });

    const sourceTable = document.querySelectorAll("table")[1];
    expect(sourceTable).toBeDefined();
    if (!sourceTable) throw new Error("Expected source data table");

    const firstDataRow = sourceTable.querySelector<HTMLElement>("tbody tr");
    expect(firstDataRow).not.toBeNull();
    if (!firstDataRow) throw new Error("Expected source data row");

    const categorySelect = within(firstDataRow).getByRole("combobox");
    const selectableOptions = Array.from(categorySelect.querySelectorAll("option")).filter(
      (option) => option.value !== "",
    );
    expect(selectableOptions.length).toBeGreaterThan(0);
    fireEvent.change(categorySelect, { target: { value: selectableOptions[0]?.value } });

    const memoInput = within(firstDataRow).getByRole("textbox");
    expect(memoInput).toHaveAttribute("readonly");
    fireEvent.focus(memoInput);
    fireEvent.change(memoInput, { target: { value: "rule-tag-test" } });

    fireEvent.click(within(firstDataRow).getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(within(firstDataRow).getByDisplayValue("rule-tag-test")).toBeInTheDocument();
    });
  });
});
