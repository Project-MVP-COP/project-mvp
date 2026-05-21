import type { QueryClient } from '@tanstack/react-query';
import { historyQueries } from '../api/queries';

export const loader = (queryClient: QueryClient) => async () => {
  queryClient.prefetchQuery(
    historyQueries.search({ sortField: 'date', sortOrder: 'desc', page: 0, size: 10 }),
  );
  return null;
};
