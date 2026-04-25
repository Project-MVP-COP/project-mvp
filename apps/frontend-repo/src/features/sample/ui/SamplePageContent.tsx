import { useSuspenseQuery } from "@tanstack/react-query";
import { Container } from "@mantine/core";
import { sampleQueries } from "@/features/sample/api/queries";
import { SampleList } from "@/features/sample/ui/SampleList";

/**
 * SamplePageContent
 * Main data-driven content for the Sample Page.
 * Uses useSuspenseQuery to ensure data is available before rendering.
 */
export function SamplePageContent() {
  const { data: samples } = useSuspenseQuery(sampleQueries.list());

  return (
    <Container size="lg">
      <SampleList samples={samples} />
    </Container>
  );
}
