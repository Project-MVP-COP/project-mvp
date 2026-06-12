import {
  Badge,
  Box,
  Button,
  Group,
  NativeSelect,
  Pagination,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowsSort, IconSortAscending, IconSortDescending, IconDatabaseImport, IconFileSpreadsheet, IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation, useSubmit } from "react-router";
import { toast } from "@/shared/ui/toast";
import type { ActionResult } from "@/features/washing/model/types";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { washingQueries } from "@/features/washing/api/queries";
import { ExcelUploadModal } from "@/features/washing/ui/ExcelUploadModal";
import {
  DEFAULT_WASHING_FILTERS,
  formatAmount,
} from "@/features/washing/model/core";
import type {
  CategoryDto,
  TransactionDto,
  WashingFilters,
} from "@/features/washing/model/types";

const categorySelectData = (categories: CategoryDto[]) => [
  { value: "all", label: "전체 카테고리" },
  { value: "unclassified", label: "미분류" },
  ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
];

const isTransactionClassified = (tx: TransactionDto) =>
  tx.categoryId != null || !!tx.categoryName;

const buildCategoryValue = (tx: TransactionDto, categories: CategoryDto[]) => {
  if (tx.categoryId != null) return `${tx.categoryId}:${tx.categoryName ?? ""}`;
  if (!tx.categoryName) return "";
  const matched = categories.find((c) => c.name === tx.categoryName);
  return matched ? `${matched.id}:${matched.name}` : `0:${tx.categoryName}`;
};

const buildCategoryOptions = (tx: TransactionDto, categories: CategoryDto[]) => {
  const opts = [
    { value: "", label: "미분류" },
    ...categories.map((cat) => ({ value: `${cat.id}:${cat.name}`, label: cat.name })),
  ];
  if (tx.categoryName && tx.categoryId == null && !categories.some((c) => c.name === tx.categoryName)) {
    opts.push({ value: `0:${tx.categoryName}`, label: tx.categoryName });
  }
  return opts;
};

const getStatusBadge = (tx: TransactionDto) => {
  if (!isTransactionClassified(tx)) {
    return (
      <Badge color="red" variant="light">
        세척 대기
      </Badge>
    );
  }
  return (
    <Badge color="yellow" variant="light">
      수동 분류
    </Badge>
  );
};

const filterLedgerTransactions = (
  transactions: TransactionDto[],
  filters: WashingFilters,
) =>
  transactions.filter((tx) => {
    const keyword = filters.merchantKeyword.trim().toLowerCase();
    const matchesMerchant =
      keyword === "" ||
      tx.merchant.toLowerCase().includes(keyword) ||
      (tx.memo ?? "").toLowerCase().includes(keyword);

    const classified = isTransactionClassified(tx);
    const matchesCategory =
      filters.category === "all" ||
      (filters.category === "unclassified"
        ? !classified
        : tx.categoryName === filters.category);

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "classified" && classified) ||
      (filters.status === "unclassified" && !classified);

    return matchesMerchant && matchesCategory && matchesStatus;
  });

type SortField = "transactionDate" | "amount";
type SortDir = "asc" | "desc";

export function SourceDataManagementPanel() {
  const [{ data: transactions }, { data: categories }] = useSuspenseQueries({
    queries: [washingQueries.transactions(), washingQueries.categories()],
  });
  const submit = useSubmit();
  const navigation = useNavigation();
  const [filters, setFilters] = useState(DEFAULT_WASHING_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>("transactionDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [excelModalOpened, { open: openExcelModal, close: closeExcelModal }] = useDisclosure(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const PAGE_SIZE = 10;
  const filteredTransactions = filterLedgerTransactions(transactions, filters);
  const sortedTransactions = sortField
    ? [...filteredTransactions].sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortField === "transactionDate") return a.transactionDate.localeCompare(b.transactionDate) * mul;
        return (a.amount - b.amount) * mul;
      })
    : filteredTransactions;
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / PAGE_SIZE));
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateFilters = (updater: (prev: typeof filters) => typeof filters) => {
    setFilters(updater);
    setCurrentPage(1);
  };

  const isImportMockSubmitting =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "import_mock";

  const isCategoryUpdateSubmitting = (txId: number) =>
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "update_category" &&
    navigation.formData?.get("id") === String(txId);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_WASHING_FILTERS);
    setCurrentPage(1);
    setSortField("transactionDate");
    setSortDir("desc");
  }, []);

  const actionData = useActionData<ActionResult>();
  const seenAction = useRef<unknown>(null);

  useEffect(() => {
    if (!actionData || actionData === seenAction.current) return;
    seenAction.current = actionData;

    if (actionData.intent === "import_mock") {
      if (actionData.error) {
        toast.error("Mock 데이터 추가에 실패했습니다.");
      } else {
        toast.success("Mock 데이터가 추가됐습니다.");
        resetFilters();
      }
    }

    if (actionData.intent === "update_category") {
      if (actionData.error) {
        toast.error("카테고리 저장에 실패했습니다.");
      } else {
        toast.success("카테고리가 저장됐습니다.");
      }
    }
  }, [actionData, resetFilters]);

  const triggerImportMock = () => {
    const formData = new FormData();
    formData.append("intent", "import_mock");
    submit(formData, { method: "post" });
  };

  return (
    <>
      <ExcelUploadModal opened={excelModalOpened} onClose={closeExcelModal} onSuccess={resetFilters} />
      <Paper withBorder p="xl" radius="lg">
        <Stack gap="lg">
          <Stack gap={4}>
            <Group justify="space-between" wrap="nowrap">
              <Title order={3}>전체 가계부 원천 데이터 관리</Title>
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconDatabaseImport size={16} />}
                  onClick={triggerImportMock}
                  loading={isImportMockSubmitting}
                >
                  Mock 데이터 추가 적재
                </Button>
                <Button
                  variant="light"
                  color="green"
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={openExcelModal}
                >
                  엑셀 업로드
                </Button>
              </Group>
            </Group>
            <Text size="sm" c="dimmed">
              원천 데이터 필터링과 개별 분류 수정 흐름을 이 영역에 모아서,
              추후 백엔드 API가 붙어도 화면 구조를 유지할 수 있게 구성했습니다.
            </Text>
          </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <TextInput
            label="가맹점 검색"
            placeholder="가맹점 또는 설명 검색"
            leftSection={<IconSearch size={14} />}
            value={filters.merchantKeyword}
            onChange={(event) => {
              const value = event.currentTarget.value;
              updateFilters((current) => ({ ...current, merchantKeyword: value }));
            }}
          />
          <NativeSelect
            label="카테고리 필터"
            value={filters.category}
            onChange={(event) => {
              const value = event.currentTarget.value;
              updateFilters((current) => ({ ...current, category: value }));
            }}
            data={categorySelectData(categories)}
          />
          <NativeSelect
            label="세척 상태"
            value={filters.status}
            onChange={(event) => {
              const value = event.currentTarget.value as "all" | "classified" | "unclassified";
              updateFilters((current) => ({ ...current, status: value }));
            }}
            data={[
              { value: "all", label: "전체 상태" },
              { value: "classified", label: "세척 완료" },
              { value: "unclassified", label: "세척 대기" },
            ]}
          />
        </SimpleGrid>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {sortedTransactions.length === 0
              ? "총 0건"
              : `총 ${sortedTransactions.length}건 중 ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, sortedTransactions.length)}건 표시`}
          </Text>
          <Button variant="light" color="gray" onClick={resetFilters}>
            필터 초기화
          </Button>
        </Group>

        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("transactionDate")}>
                  <Box component="span" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    일자
                    {sortField === "transactionDate" ? (
                      sortDir === "asc" ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
                    ) : (
                      <IconArrowsSort size={14} color="var(--mantine-color-dimmed)" />
                    )}
                  </Box>
                </Table.Th>
                <Table.Th>가맹점</Table.Th>
                <Table.Th>카드</Table.Th>
                <Table.Th ta="right" style={{ cursor: "pointer" }} onClick={() => handleSort("amount")}>
                  <Box component="span" w="100%" style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    {sortField === "amount" ? (
                      sortDir === "asc" ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
                    ) : (
                      <IconArrowsSort size={14} color="var(--mantine-color-dimmed)" />
                    )}
                    금액
                  </Box>
                </Table.Th>
                <Table.Th>상태</Table.Th>
                <Table.Th>규칙 / 태그</Table.Th>
                <Table.Th>카테고리 변경</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTransactions.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text ta="center" c="dimmed" py="xl">
                      조건에 맞는 원천 데이터가 없습니다.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <Table.Tr key={tx.id}>
                    <Table.Td>{tx.transactionDate}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{tx.merchant}</Text>
                        <Text size="xs" c="dimmed">
                          {tx.memo ?? ""}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{tx.cardName}</Table.Td>
                    <Table.Td ta="right" fw={700}>
                      {formatAmount(tx.amount)}원
                    </Table.Td>
                    <Table.Td>{getStatusBadge(tx)}</Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Text size="sm">수동 분류 필요</Text>
                        <Badge color="gray" variant="light" w="fit-content">
                          {tx.status}
                        </Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Form method="post">
                        <input type="hidden" name="intent" value="update_category" />
                        <input type="hidden" name="id" value={tx.id} />
                        <Group align="flex-end" wrap="nowrap">
                          <NativeSelect
                            key={`${tx.id}-${tx.categoryId ?? ""}-${tx.categoryName ?? ""}`}
                            name="category"
                            defaultValue={buildCategoryValue(tx, categories)}
                            data={buildCategoryOptions(tx, categories)}
                          />
                          <Button type="submit" size="xs" loading={isCategoryUpdateSubmitting(tx.id)}>
                            저장
                          </Button>
                        </Group>
                      </Form>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </Paper>
    </>
  );
}
