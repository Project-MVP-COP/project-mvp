import {
  Table, Badge, Text, Group, Center, Stack, Pagination, Card,
} from '@mantine/core';
import type { TransactionDto } from '../model/types';
import { CATEGORY_COLORS } from '../model/constants';

function fmt(n: number) {
  return n.toLocaleString('ko-KR');
}

interface Props {
  data: TransactionDto[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (txn: TransactionDto) => void;
  isLoading?: boolean;
}

export function HistoryTable({ data, page, totalPages, onPageChange, onRowClick, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card withBorder radius="xl" p={0}>
        <Center p="xl">
          <Stack align="center" gap="sm">
            <Text c="dimmed" size="sm">불러오는 중...</Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card withBorder radius="xl" p={0}>
        <Center p="xl">
          <Stack align="center" gap="sm">
            <Text size="xl">🔍</Text>
            <Text c="dimmed">조회된 내역이 없습니다</Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Card withBorder radius="xl" p={0}>
      <div style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>날짜</Table.Th>
              <Table.Th>가맹점명</Table.Th>
              <Table.Th>카테고리</Table.Th>
              <Table.Th ta="right">금액</Table.Th>
              <Table.Th>카드</Table.Th>
              <Table.Th>할부</Table.Th>
              <Table.Th>상태</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map(txn => (
              <Table.Tr
                key={txn.id}
                style={{
                  cursor: 'pointer',
                  opacity: txn.status === '취소' ? 0.6 : 1,
                  textDecoration: txn.status === '취소' ? 'line-through' : 'none',
                  color: txn.status === '취소' ? 'var(--mantine-color-red-6)' : 'inherit',
                }}
                onClick={() => onRowClick(txn)}
              >
                <Table.Td>{txn.transactionDate}</Table.Td>
                <Table.Td>
                  <Text fw={600} size="sm" style={{ textDecoration: 'inherit', color: 'inherit' }}>
                    {txn.merchant}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    style={{
                      backgroundColor: CATEGORY_COLORS[txn.categoryName] ?? '#64748b',
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                    size="sm"
                  >
                    {txn.categoryName}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fw={700} size="sm" style={{ textDecoration: 'inherit', color: 'inherit' }}>
                    {fmt(txn.amount)}원
                  </Text>
                </Table.Td>
                <Table.Td>{txn.cardName}</Table.Td>
                <Table.Td>
                  {txn.installment === 1 ? '일시불' : `${txn.installment}개월`}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={txn.status === '승인' ? 'green' : 'red'}
                    variant="light"
                    size="sm"
                    style={{ textDecoration: 'none' }}
                  >
                    {txn.status}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Group justify="center" p="md">
          <Pagination
            total={totalPages}
            value={page}
            onChange={onPageChange}
            color="brandYellow"
            size="sm"
          />
        </Group>
      )}
    </Card>
  );
}
