import { Card, Grid, Group, Select, TextInput, Button, Text, Stack, Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { FilterState } from '../model/types';
import { CATEGORIES, CARDS } from '../model/constants';

interface Props {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

const cardStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
} as const;

const inputStyles = {
  input: {
    backgroundColor: 'var(--bg)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  },
} as const;

const fieldLabelStyle = {
  color: 'var(--text)',
  opacity: 0.7,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  lineHeight: 1.2,
  minHeight: 14,
} as const;

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
    <Card p="xl" style={cardStyle}>
      <Stack gap="lg">
        <Text
          size="xs"
          fw={800}
          tt="uppercase"
          style={{ color: 'var(--text)', opacity: 0.6, letterSpacing: '0.12em' }}
        >
          Search Filter
        </Text>

        <Grid align="flex-start" gap="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Stack gap={6}>
              <Text style={fieldLabelStyle}>기간</Text>
              <Group gap="xs" wrap="nowrap" align="center">
                <Box style={{ flex: 1 }}>
                  <TextInput
                    type="date"
                    value={filters.dateStart}
                    onChange={e => onChange('dateStart', e.currentTarget.value)}
                    radius="xl"
                    size="md"
                    styles={inputStyles}
                  />
                </Box>
                <Text size="sm" style={{ color: 'var(--text)', opacity: 0.5, flex: '0 0 auto' }}>
                  ~
                </Text>
                <Box style={{ flex: 1 }}>
                  <TextInput
                    type="date"
                    value={filters.dateEnd}
                    onChange={e => onChange('dateEnd', e.currentTarget.value)}
                    radius="xl"
                    size="md"
                    styles={inputStyles}
                  />
                </Box>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap={6}>
              <Text style={fieldLabelStyle}>카테고리</Text>
              <Select
                data={categoryData}
                value={filters.category}
                onChange={val => onChange('category', val ?? '')}
                radius="xl"
                size="md"
                styles={inputStyles}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap={6}>
              <Text style={fieldLabelStyle}>금액</Text>
              <Group gap="xs" wrap="nowrap" align="center">
                <Box style={{ flex: 1 }}>
                  <TextInput
                    type="number"
                    placeholder="최소"
                    value={filters.amountMin}
                    onChange={e => onChange('amountMin', e.currentTarget.value)}
                    radius="xl"
                    size="md"
                    styles={inputStyles}
                  />
                </Box>
                <Text size="sm" style={{ color: 'var(--text)', opacity: 0.5, flex: '0 0 auto' }}>
                  ~
                </Text>
                <Box style={{ flex: 1 }}>
                  <TextInput
                    type="number"
                    placeholder="최대"
                    value={filters.amountMax}
                    onChange={e => onChange('amountMax', e.currentTarget.value)}
                    radius="xl"
                    size="md"
                    styles={inputStyles}
                  />
                </Box>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap={6}>
              <Text style={fieldLabelStyle}>카드</Text>
              <Select
                data={cardData}
                value={filters.card}
                onChange={val => onChange('card', val ?? '')}
                radius="xl"
                size="md"
                styles={inputStyles}
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Grid align="flex-end" gap="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap={6}>
              <Text style={fieldLabelStyle}>상태</Text>
              <Select
                data={statusData}
                value={filters.status}
                onChange={val => onChange('status', val ?? '')}
                radius="xl"
                size="md"
                styles={inputStyles}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Stack gap={6}>
              <Text style={fieldLabelStyle}>가맹점 검색</Text>
              <TextInput
                leftSection={<IconSearch size={16} color="var(--kb-yellow)" />}
                placeholder="가맹점명으로 검색"
                value={filters.search}
                onChange={e => onChange('search', e.currentTarget.value)}
                onKeyDown={e => e.key === 'Enter' && onApply()}
                radius="xl"
                size="md"
                styles={inputStyles}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group gap="xs" justify="flex-end">
              <Button
                variant="outline"
                size="md"
                radius="xl"
                onClick={onReset}
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              >
                초기화
              </Button>
              <Button
                size="md"
                radius="xl"
                fw={800}
                onClick={onApply}
                style={{
                  backgroundColor: 'var(--kb-yellow)',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(255, 204, 0, 0.4)',
                }}
              >
                적용
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
