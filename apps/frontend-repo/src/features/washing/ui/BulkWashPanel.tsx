import {
  Badge,
  Button,
  Checkbox,
  Group,
  NativeSelect,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconSparkles, IconWashDryclean } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigation, useSubmit } from "react-router";
import {
  formatAmount,
  getUnclassifiedTransactions,
} from "@/features/washing/model/core";
import type { WashingOverview } from "@/features/washing/model/types";

interface BulkWashPanelProps {
  overview: WashingOverview;
}

export function BulkWashPanel({ overview }: BulkWashPanelProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const unclassifiedTransactions = getUnclassifiedTransactions(
    overview.transactions,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    overview.categories[0] ?? "",
  );
  const validSelectedIds = selectedIds.filter((id) =>
    unclassifiedTransactions.some((transaction) => transaction.id === id),
  );
  const selectedCount = validSelectedIds.length;
  const isSubmitting = navigation.state === "submitting";

  const toggleAll = (checked: boolean) => {
    setSelectedIds(
      checked ? unclassifiedTransactions.map((transaction) => transaction.id) : [],
    );
  };

  const toggleSingle = (id: number, checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((currentId) => currentId !== id),
    );
  };

  const handleBulkWash = () => {
    if (validSelectedIds.length === 0 || selectedCategory === "") {
      return;
    }

    const formData = new FormData();
    formData.append("intent", "bulk_wash");
    formData.append("ids", validSelectedIds.join(","));
    formData.append("category", selectedCategory);
    submit(formData, { method: "post" });
  };

  return (
    <Paper withBorder p="xl" radius="lg" bg="rgba(255, 188, 0, 0.06)">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6}>
            <Group gap="sm">
              <ThemeIcon variant="light" color="yellow" size="lg">
                <IconSparkles size={18} />
              </ThemeIcon>
              <Title order={3}>미분류 데이터 일괄 세척 필터</Title>
              <Badge color="red" variant="light">
                Bulk Wash
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              자동 분류 규칙에 걸리지 않은 내역만 모아서 한 번에 카테고리를
              지정할 수 있도록 분리했습니다.
            </Text>
          </Stack>
          <Badge color="red" variant="filled" size="lg">
            미세척 {unclassifiedTransactions.length}건
          </Badge>
        </Group>

        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={48} ta="center">
                  <Checkbox
                    checked={
                      unclassifiedTransactions.length > 0 &&
                      selectedCount === unclassifiedTransactions.length
                    }
                    indeterminate={
                      selectedCount > 0 &&
                      selectedCount < unclassifiedTransactions.length
                    }
                    onChange={(event) => toggleAll(event.currentTarget.checked)}
                    aria-label="전체 선택"
                  />
                </Table.Th>
                <Table.Th>이용 일자</Table.Th>
                <Table.Th>가맹점</Table.Th>
                <Table.Th>카드</Table.Th>
                <Table.Th ta="right">금액</Table.Th>
                <Table.Th>기존 태그</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {unclassifiedTransactions.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="xl">
                      현재 미분류 내역이 없습니다.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                unclassifiedTransactions.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td ta="center">
                      <Checkbox
                        checked={validSelectedIds.includes(transaction.id)}
                        onChange={(event) =>
                          toggleSingle(
                            transaction.id,
                            event.currentTarget.checked,
                          )
                        }
                        aria-label={`${transaction.merchantName} 선택`}
                      />
                    </Table.Td>
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
                    <Table.Td>
                      <Badge color="gray" variant="light">
                        {transaction.tag}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Group justify="space-between" align="flex-end">
          <Text size="sm" c="dimmed">
            선택된 항목{" "}
            <Text component="span" inherit fw={700} c="brandYellow">
              {selectedCount}건
            </Text>
          </Text>
          <Group align="flex-end">
            <NativeSelect
              label="일괄 적용 카테고리"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.currentTarget.value)}
              data={overview.categories}
            />
            <Button
              leftSection={<IconWashDryclean size={16} />}
              onClick={handleBulkWash}
              disabled={selectedCount === 0 || selectedCategory === ""}
              loading={isSubmitting}
            >
              일괄 세척 적용
            </Button>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
