import { Container } from "@mantine/core";
import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { Suspense } from "react";
import { RuleEngineBuilderPanel } from "@/features/rule-engine-builder/ui/RuleEngineBuilderPanel";
import { washingKeys, washingQueries } from "@/features/washing/api/queries";
import { WashingPageSkeleton } from "@/features/washing/ui/WashingPageSkeleton";

function RuleEngineBuilderContent() {
  const queryClient = useQueryClient();
  const [{ data: transactions }, { data: categories }] = useSuspenseQueries({
    queries: [washingQueries.transactions(), washingQueries.categories()],
  });

  return (
    <Container size="xl">
      <RuleEngineBuilderPanel
        categories={categories}
        transactions={transactions}
        onRuleApplied={() => {
          queryClient.invalidateQueries({ queryKey: washingKeys.all });
        }}
        onCategoriesChanged={() => {
          queryClient.invalidateQueries({ queryKey: washingKeys.all });
        }}
      />
    </Container>
  );
}

export function RuleEngineBuilderPage() {
  return (
    <Suspense fallback={<WashingPageSkeleton />}>
      <RuleEngineBuilderContent />
    </Suspense>
  );
}
