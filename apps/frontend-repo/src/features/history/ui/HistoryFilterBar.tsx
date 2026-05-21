import { Card, Grid, Group, Select, TextInput, Button, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { FilterState } from '../model/types';
import { CATEGORIES, CARDS } from '../model/constants';

interface Props {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export function HistoryFilterBar({ filters, onChange, onReset, onApply }: Props) {
  const categoryData = [
    { value: '', label: '전체' },
    ...CATEGORIES.map(c => ({ value: c, label: c })),
  ];
  const cardData = [
    { value: '', label: '전체' },
    ...CARDS.map(c => ({ value: c, label: c })),
  ];
  const statusData = [
    { value: '', label: '전체' },
    { value: '승인', label: '승인' },
    { value: '취소', label: '취소' },
  ];

  return (
    <Card withBorder radius="xl" p="lg" mb={0}>
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="md">🔍 필터</Text>

      <Grid mb="sm">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>기간</Text>
          <Group gap="xs">
            <TextInput
              type="date"
              value={filters.dateStart}
              onChange={e => onChange('dateStart', e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
            />
            <Text size="sm" c="dimmed">~</Text>
            <TextInput
              type="date"
              value={filters.dateEnd}
              onChange={e => onChange('dateEnd', e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
            />
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            label="카테고리"
            data={categoryData}
            value={filters.category}
            onChange={val => onChange('category', val ?? '')}
            size="sm"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>금액</Text>
          <Group gap="xs">
            <TextInput
              type="number"
              placeholder="최소"
              value={filters.amountMin}
              onChange={e => onChange('amountMin', e.currentTarget.value)}
              style={{ width: 90 }}
              size="sm"
            />
            <Text size="sm" c="dimmed">~</Text>
            <TextInput
              type="number"
              placeholder="최대"
              value={filters.amountMax}
              onChange={e => onChange('amountMax', e.currentTarget.value)}
              style={{ width: 90 }}
              size="sm"
            />
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            label="카드"
            data={cardData}
            value={filters.card}
            onChange={val => onChange('card', val ?? '')}
            size="sm"
          />
        </Grid.Col>
      </Grid>

      <Grid align="flex-end">
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            label="상태"
            data={statusData}
            value={filters.status}
            onChange={val => onChange('status', val ?? '')}
            size="sm"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <TextInput
            label="가맹점 검색"
            leftSection={<IconSearch size={14} />}
            placeholder="가맹점명 검색…"
            value={filters.search}
            onChange={e => onChange('search', e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && onApply()}
            size="sm"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group gap="xs" justify="flex-end">
            <Button variant="default" size="sm" onClick={onReset}>
              초기화
            </Button>
            <Button
              size="sm"
              fw={700}
              style={{ backgroundColor: '#FFCC00', color: '#000' }}
              onClick={onApply}
            >
              적용
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
