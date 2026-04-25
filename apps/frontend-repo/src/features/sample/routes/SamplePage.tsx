import { Suspense } from "react";
import { SamplePageSkeleton } from "../ui/SamplePageSkeleton";
import { SamplePageContent } from "../ui/SamplePageContent";

/**
 * SamplePage
 * Route component that orchestrates Suspense and data loading.
 * Each sub-component is separated into its own file to optimize Vite's HMR.
 */
export function SamplePage() {
  return (
    <Suspense fallback={<SamplePageSkeleton />}>
      <SamplePageContent />
    </Suspense>
  );
}
