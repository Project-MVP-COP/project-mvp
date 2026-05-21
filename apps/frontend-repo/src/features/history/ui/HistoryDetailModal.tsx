import { Modal, Stack, Badge, Grid, Divider, Box, Text } from '@mantine/core';
import type { TransactionDto } from '../model/types';
import { CATEGORY_COLORS } from '../model/constants';

function fmt(n: number) {
  return n.toLocaleString('ko-KR');
}

interface Props {
  opened: boolean;
  onClose: () => void;
  transaction: TransactionDto | null;
}

export function HistoryDetailModal({ opened, onClose, transaction }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="거래 상세 정보"
      centered
      radius="xl"
    >
      {transaction && (
        <Stack gap="md">
          <Box
            p="lg"
            ta="center"
            style={{
              background: 'rgba(255,204,0,0.08)',
              border: '1px solid rgba(255,204,0,0.3)',
              borderRadius: 12,
            }}
          >
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>결제 금액</Text>
            <Text size="xl" fw={900} style={{ color: '#FFCC00' }}>
              {fmt(transaction.amount)}원
            </Text>
          </Box>

          <Divider />

          <Grid gutter="md">
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>날짜</Text>
              <Text fw={500}>{transaction.transactionDate}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>상태</Text>
              <Badge color={transaction.status === '승인' ? 'green' : 'red'} variant="light">
                {transaction.status}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>가맹점명</Text>
              <Text fw={600}>{transaction.merchant}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>카테고리</Text>
              <Badge
                style={{
                  backgroundColor: CATEGORY_COLORS[transaction.categoryName] ?? '#64748b',
                  color: '#fff',
                }}
              >
                {transaction.categoryName}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>카드</Text>
              <Text fw={500}>{transaction.cardName}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>할부</Text>
              <Text fw={500}>
                {transaction.installment === 1 ? '일시불' : `${transaction.installment}개월`}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>거래 ID</Text>
              <Text fw={500} c="dimmed">#{transaction.id}</Text>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </Modal>
  );
}
