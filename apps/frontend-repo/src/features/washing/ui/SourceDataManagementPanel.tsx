import {
  Badge,
  Button,
  Group,
  NativeSelect,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconDatabaseImport, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Form, useNavigation, useSubmit } from "react-router";
import {
  DEFAULT_WASHING_FILTERS,
  filterTransactions,
  formatAmount,
} from "@/features/washing/model/core";
import type {
  WashingOverview,
  WashingTransaction,
} from "@/features/washing/model/types";

interface SourceDataManagementPanelProps {
  overview: WashingOverview;
}

const categorySelectData = (categories: string[]) => [
  { value: "all", label: "전체 카테고리" },
  { value: "unclassified", label: "미분류" },
  ...categories.map((category) => ({ value: category, label: category })),
];

const getStatusBadge = (transaction: WashingTransaction) => {
  if (!transaction.isClassified) {
    return (
      <Badge color="red" variant="light">
        세척 대기
      </Badge>
    );
  }

  if (transaction.matchedRuleLabel) {
    return (
      <Badge color="green" variant="light">
        규칙 매핑 완료
      </Badge>
    );
  }

  return (
    <Badge color="yellow" variant="light">
      수동 분류
    </Badge>
  );
};

export function SourceDataManagementPanel({
  overview,
}: SourceDataManagementPanelProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [filters, setFilters] = useState(DEFAULT_WASHING_FILTERS);
  const filteredTransactions = filterTransactions(overview.transactions, filters);
  const isSubmitting = navigation.state === "submitting";

  const resetFilters = () => {
    setFilters(DEFAULT_WASHING_FILTERS);
  };

  const triggerImportMock = () => {
    const formData = new FormData();
    formData.append("intent", "import_mock");
    submit(formData, { method: "post" });
  };

  return (
    <Paper withBorder p="xl" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6}>
            <Title order={3}>전체 가계부 원천 데이터 관리</Title>
            <Text size="sm" c="dimmed">
              원천 데이터 필터링과 개별 분류 수정 흐름을 이 영역에 모아서,
              추후 백엔드 API가 붙어도 화면 구조를 유지할 수 있게 구성했습니다.
            </Text>
          </Stack>
          <Button
            variant="light"
            color="teal"
            leftSection={<IconDatabaseImport size={16} />}
            onClick={triggerImportMock}
            loading={isSubmitting}
          >
            Mock 데이터 추가 적재
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <TextInput
            label="가맹점 검색"
            placeholder="가맹점 또는 설명 검색"
            leftSection={<IconSearch size={14} />}
            value={filters.merchantKeyword}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                merchantKeyword: event.currentTarget.value,
              }))
            }
          />
          <NativeSelect
            label="카테고리 필터"
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.currentTarget.value,
              }))
            }
            data={categorySelectData(overview.categories)}
          />
          <NativeSelect
            label="세척 상태"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.currentTarget.value as
                  | "all"
                  | "classified"
                  | "unclassified",
              }))
            }
            data={[
              { value: "all", label: "전체 상태" },
              { value: "classified", label: "세척 완료" },
              { value: "unclassified", label: "세척 대기" },
            ]}
          />
        </SimpleGrid>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            총 {filteredTransactions.length}건 표시 중
          </Text>
          <Button variant="light" color="gray" onClick={resetFilters}>
            필터 초기화
          </Button>
        </Group>

        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>일자</Table.Th>
                <Table.Th>가맹점</Table.Th>
                <Table.Th>카드</Table.Th>
                <Table.Th ta="right">금액</Table.Th>
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
                filteredTransactions.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>{transaction.occurredAt}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{transaction.merchantName}</Text>
                        <Text size="xs" c="dimmed">
                          {transaction.description}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{transaction.cardLabel}</Table.Td>
                    <Table.Td ta="right" fw={700}>
                      {formatAmount(transaction.amount)}원
                    </Table.Td>
                    <Table.Td>{getStatusBadge(transaction)}</Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Text size="sm">
                          {transaction.matchedRuleLabel ?? "수동 분류 필요"}
                        </Text>
                        <Badge color="gray" variant="light" w="fit-content">
                          {transaction.tag}
                        </Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Form method="post">
                        <input type="hidden" name="intent" value="update_category" />
                        <input type="hidden" name="id" value={transaction.id} />
                        <Group align="flex-end" wrap="nowrap">
                          <NativeSelect
                            name="category"
                            defaultValue={transaction.category ?? ""}
                            data={[
                              { value: "", label: "미분류" },
                              ...overview.categories.map((category) => ({
                                value: category,
                                label: category,
                              })),
                            ]}
                          />
                          <Button type="submit" size="xs" loading={isSubmitting}>
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
      </Stack>
    </Paper>
  );
}
