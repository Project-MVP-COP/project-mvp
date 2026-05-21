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
      styles={{
        content: {
          backgroundColor: 'var(--card)',
          color: 'var(--text)',
        },
        header: {
          backgroundColor: 'var(--card)',
          color: 'var(--text)',
        },
      }}
    >
      {transaction && (
        <Stack gap="md">
          <Box
            p="xl"
            ta="center"
            style={{
              backgroundColor: 'var(--bg)',
              border: '2px solid var(--kb-yellow)',
              borderRadius: 20,
            }}
          >
            <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
              결제 금액
            </Text>
            <Text size="32px" fw={900} style={{ color: 'var(--text)' }}>
              {fmt(transaction.amount)}원
            </Text>
          </Box>

          <Divider color="var(--border)" />

          <Grid gap="md">
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                날짜
              </Text>
              <Text fw={500}>{transaction.transactionDate}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                상태
              </Text>
              <Badge
                radius="xl"
                variant="light"
                style={{
                  backgroundColor: transaction.status === '승인' ? 'rgba(255, 204, 0, 0.18)' : 'var(--bg)',
                  border: `1px solid ${transaction.status === '승인' ? 'var(--kb-yellow)' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
              >
                {transaction.status}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                가맹점명
              </Text>
              <Text fw={700}>{transaction.merchant}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                카테고리
              </Text>
              <Badge
                radius="xl"
                style={{
                  backgroundColor: CATEGORY_COLORS[transaction.categoryName] ?? 'var(--text)',
                  color: '#fff',
                }}
              >
                {transaction.categoryName}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                카드
              </Text>
              <Text fw={500}>{transaction.cardName}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                할부
              </Text>
              <Text fw={500}>{transaction.installment === 1 ? '일시불' : `${transaction.installment}개월`}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" tt="uppercase" fw={700} mb={4} style={{ color: 'var(--text)', opacity: 0.65 }}>
                거래 ID
              </Text>
              <Text fw={500} style={{ color: 'var(--text)', opacity: 0.7 }}>
                #{transaction.id}
              </Text>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </Modal>
  );
}
