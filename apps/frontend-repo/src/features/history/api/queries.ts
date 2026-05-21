import { queryOptions } from '@tanstack/react-query';
import { fetchTransactions, searchTransactions } from './fetchers';
import type { SearchParams } from '../model/types';

export const historyKeys = {
  all: ['history'] as const,
  transactions: () => [...historyKeys.all, 'transactions'] as const,
  searches: () => [...historyKeys.all, 'search'] as const,
  search: (params: SearchParams) => [...historyKeys.searches(), params] as const,
};

export const historyQueries = {
  transactions: () =>
    queryOptions({
      queryKey: historyKeys.transactions(),
      queryFn: fetchTransactions,
    }),

  search: (params: SearchParams) =>
    queryOptions({
      queryKey: historyKeys.search(params),
      queryFn: () => searchTransactions(params),
    }),
};
