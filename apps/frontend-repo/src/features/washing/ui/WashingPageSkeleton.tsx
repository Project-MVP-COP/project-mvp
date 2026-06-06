import { Container, Skeleton, Stack } from "@mantine/core";

export function WashingPageSkeleton() {
  return (
    <Container size="xl">
      <Stack gap="xl">
        <Skeleton h={360} radius="lg" />
        <Skeleton h={520} radius="lg" />
      </Stack>
    </Container>
  );
}
