import { useEffect, useState } from 'react';
import { Badge, Box, Button, Divider, Drawer, Grid, Group, Stack, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useUpdateTransaction } from '../api/mutations';
import { CATEGORY_COLORS } from '../model/constants';
import type { TransactionDto } from '../model/types';

function fmt(n: number) {
  return n.toLocaleString('ko-KR');
}

interface Props {
  opened: boolean;
  onClose: () => void;
  transaction: TransactionDto | null;
  onSaved: (transaction: TransactionDto) => void;
}

const inputStyles = {
  input: {
    backgroundColor: 'var(--bg)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  },
  label: {
    color: 'var(--text)',
    fontWeight: 700,
    marginBottom: 6,
  },
} as const;

export function HistoryDetailModal({ opened, onClose, transaction, onSaved }: Props) {
  const updateTransactionMutation = useUpdateTransaction();
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (!transaction) return;
    setMemo(transaction.memo ?? '');
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction) return;

    try {
      const updated = await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        payload: {
          merchant: transaction.merchant,
          categoryName: transaction.categoryName,
          amount: transaction.amount,
          cardName: transaction.cardName,
          installment: transaction.installment,
          status: transaction.status,
          memo: memo.trim() || null,
        },
      });

      notifications.show({
        color: 'teal',
        title: '저장 완료',
        message: '메모가 저장되었습니다.',
      });

      onSaved(updated);
    } catch {
      notifications.show({
        color: 'red',
        title: '저장 실패',
        message: '메모를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="거래 상세 정보"
      position="right"
      size="md"
      padding="lg"
      styles={{
        content: {
          backgroundColor: 'var(--card)',
          color: 'var(--text)',
        },
        header: {
          backgroundColor: 'var(--card)',
          color: 'var(--text)',
        },
        body: {
          paddingBottom: 24,
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

          <Divider color="var(--border)" />

          <Textarea
            label="메모"
            value={memo}
            onChange={event => setMemo(event.currentTarget.value)}
            minRows={4}
            autosize
            placeholder="거래에 대한 메모를 입력하세요."
            styles={inputStyles}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              radius="xl"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              닫기
            </Button>
            <Button
              radius="xl"
              onClick={handleSave}
              loading={updateTransactionMutation.isPending}
              style={{
                backgroundColor: 'var(--kb-yellow)',
                color: '#000',
                fontWeight: 800,
              }}
            >
              저장
            </Button>
          </Group>
        </Stack>
      )}
    </Drawer>
  );
}
