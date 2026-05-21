import { Suspense } from 'react';
import { HistoryPageContent } from '../ui/HistoryPageContent';
import { HistoryPageSkeleton } from '../ui/HistoryPageSkeleton';

export function HistoryPage() {
  return (
    <Suspense fallback={<HistoryPageSkeleton />}>
      <HistoryPageContent />
    </Suspense>
  );
}
