import {
  Table,
  Badge,
  Text,
  Group,
  Center,
  Stack,
  Pagination,
  Card,
  Box,
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

const tableCardStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
} as const;

export function HistoryTable({ data, page, totalPages, onPageChange, onRowClick, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card p={0} style={tableCardStyle}>
        <Center p="xl">
          <Stack align="center" gap="sm">
            <Text size="sm" style={{ color: 'var(--text)', opacity: 0.7 }}>
              내역을 불러오는 중입니다.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card p={0} style={tableCardStyle}>
        <Center p="xl">
          <Stack align="center" gap="sm">
            <Text size="xl">비어 있음</Text>
            <Text style={{ color: 'var(--text)', opacity: 0.7 }}>
              조건에 맞는 이용내역이 없습니다.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Card p={0} style={tableCardStyle}>
      <Box style={{ overflowX: 'auto' }}>
        <Table
          highlightOnHover
          styles={{
            table: {
              color: 'var(--text)',
            },
            th: {
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              borderBottom: '1px solid var(--border)',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            },
            td: {
              borderBottom: '1px solid var(--border)',
            },
            tr: {
              transition: '0.25s ease-in-out',
            },
          }}
        >
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
                  color: 'var(--text)',
                }}
                onClick={() => onRowClick(txn)}
              >
                <Table.Td>{txn.transactionDate}</Table.Td>
                <Table.Td>
                  <Text fw={700} size="sm" style={{ textDecoration: 'inherit', color: 'inherit' }}>
                    {txn.merchant}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    size="sm"
                    radius="xl"
                    style={{
                      backgroundColor: CATEGORY_COLORS[txn.categoryName] ?? 'var(--text)',
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    {txn.categoryName}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fw={800} size="sm" style={{ textDecoration: 'inherit', color: 'inherit' }}>
                    {fmt(txn.amount)}원
                  </Text>
                </Table.Td>
                <Table.Td>{txn.cardName}</Table.Td>
                <Table.Td>{txn.installment === 1 ? '일시불' : `${txn.installment}개월`}</Table.Td>
                <Table.Td>
                  <Badge
                    radius="xl"
                    variant="light"
                    size="sm"
                    style={{
                      backgroundColor: txn.status === '승인' ? 'rgba(255, 204, 0, 0.18)' : 'var(--bg)',
                      border: `1px solid ${txn.status === '승인' ? 'var(--kb-yellow)' : 'var(--border)'}`,
                      color: 'var(--text)',
                      textDecoration: 'none',
                    }}
                  >
                    {txn.status}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {totalPages > 1 && (
        <Group justify="center" p="md">
          <Pagination
            total={totalPages}
            value={page}
            onChange={onPageChange}
            color="brandYellow"
            radius="xl"
            size="sm"
          />
        </Group>
      )}
    </Card>
  );
}
