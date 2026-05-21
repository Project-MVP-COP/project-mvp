import { Stack, Card, Skeleton, Group } from '@mantine/core';

export function HistoryPageSkeleton() {
  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Skeleton height={32} width={200} />
        <Skeleton height={16} width={280} />
      </Stack>

      <Group gap="sm">
        <Skeleton height={36} width={160} radius="xl" />
        <Skeleton height={36} width={120} radius="xl" />
      </Group>

      <Card withBorder radius="xl" p="lg">
        <Skeleton height={14} width={60} mb="md" />
        <Group gap="md" mb="sm">
          {[200, 140, 180, 140].map((w, i) => (
            <Skeleton key={i} height={36} width={w} />
          ))}
        </Group>
        <Group gap="md">
          {[140, 220, 200].map((w, i) => (
            <Skeleton key={i} height={36} width={w} />
          ))}
        </Group>
      </Card>

      <Group justify="space-between">
        <Skeleton height={32} width={180} />
        <Group gap="xs">
          {[80, 110, 80, 80].map((w, i) => (
            <Skeleton key={i} height={24} width={w} radius="xl" />
          ))}
        </Group>
      </Group>

      <Card withBorder radius="xl" p={0}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Group gap="lg">
            {[70, 110, 80, 80, 80, 50, 60].map((w, i) => (
              <Skeleton key={i} height={14} width={w} />
            ))}
          </Group>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
            <Group gap="lg">
              {[70, 100, 70, 70, 70, 50, 55].map((w, j) => (
                <Skeleton key={j} height={16} width={w} />
              ))}
            </Group>
          </div>
        ))}
      </Card>
    </Stack>
  );
}
