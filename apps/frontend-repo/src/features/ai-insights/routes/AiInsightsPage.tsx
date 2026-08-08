import { Suspense } from "react";
import { AiInsightsPageContent } from "@/features/ai-insights/ui/AiInsightsPageContent";
import { AiInsightsPageSkeleton } from "@/features/ai-insights/ui/AiInsightsPageSkeleton";

export function AiInsightsPage() {
  return (
    <Suspense fallback={<AiInsightsPageSkeleton />}>
      <AiInsightsPageContent />
    </Suspense>
  );
}
