import { Container, Stack } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { washingQueries } from "@/features/washing/api/queries";
import { BulkWashPanel } from "@/features/washing/ui/BulkWashPanel";
import { SourceDataManagementPanel } from "@/features/washing/ui/SourceDataManagementPanel";

export function WashingPageContent() {
  const { data: overview } = useSuspenseQuery(washingQueries.overview());

  return (
    <Container size="xl">
      <Stack gap="xl">
        <BulkWashPanel overview={overview} />
        <SourceDataManagementPanel />
      </Stack>
    </Container>
  );
}
