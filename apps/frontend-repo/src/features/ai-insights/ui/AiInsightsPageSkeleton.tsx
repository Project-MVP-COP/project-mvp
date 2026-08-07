import { Container, Paper, SimpleGrid, Skeleton, Stack } from "@mantine/core";

export function AiInsightsPageSkeleton() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Skeleton height={28} width="42%" />
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Skeleton height={42} />
              <Skeleton height={42} />
              <Skeleton height={42} />
            </SimpleGrid>
          </Stack>
        </Paper>
        <Skeleton height={280} radius="md" />
      </Stack>
    </Container>
  );
}
