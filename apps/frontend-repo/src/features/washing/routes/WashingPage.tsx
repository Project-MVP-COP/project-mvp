import { Suspense } from "react";
import { WashingPageContent } from "@/features/washing/ui/WashingPageContent";
import { WashingPageSkeleton } from "@/features/washing/ui/WashingPageSkeleton";

export function WashingPage() {
  return (
    <Suspense fallback={<WashingPageSkeleton />}>
      <WashingPageContent />
    </Suspense>
  );
}
