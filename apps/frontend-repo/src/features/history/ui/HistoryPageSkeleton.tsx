import { Stack, Card, Skeleton, Group, Box } from '@mantine/core';

const skeletonCardStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
} as const;

export function HistoryPageSkeleton() {
  return (
    <Box style={{ backgroundColor: 'var(--bg)', minHeight: '100%', padding: '40px 0' }}>
      <Stack gap={20} maw={600} mx="auto">
        <Card p="xl" style={skeletonCardStyle}>
          <Stack gap={8}>
            <Skeleton height={12} width={120} />
            <Skeleton height={32} width={220} />
            <Skeleton height={16} width={320} />
          </Stack>
        </Card>

        <Card p="xl" style={skeletonCardStyle}>
          <Skeleton height={12} width={90} mb="lg" />
          <Group gap="md" mb="sm">
            {[220, 140, 180].map((w, i) => (
              <Skeleton key={i} height={42} width={w} radius="xl" />
            ))}
          </Group>
          <Group gap="md">
            {[140, 240, 200].map((w, i) => (
              <Skeleton key={i} height={42} width={w} radius="xl" />
            ))}
          </Group>
        </Card>

        <Card p="lg" style={skeletonCardStyle}>
          <Group justify="space-between">
            <Skeleton height={40} width={180} radius="xl" />
            <Group gap="xs">
              {[80, 120, 90].map((w, i) => (
                <Skeleton key={i} height={28} width={w} radius="xl" />
              ))}
            </Group>
          </Group>
        </Card>

        <Card p={0} style={skeletonCardStyle}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <Group gap="lg">
              {[70, 110, 90, 80, 80, 50, 60].map((w, i) => (
                <Skeleton key={i} height={14} width={w} />
              ))}
            </Group>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <Group gap="lg">
                {[70, 100, 70, 70, 70, 50, 55].map((w, j) => (
                  <Skeleton key={j} height={16} width={w} />
                ))}
              </Group>
            </div>
          ))}
        </Card>
      </Stack>
    </Box>
  );
}
