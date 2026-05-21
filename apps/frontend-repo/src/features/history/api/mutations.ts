import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadExcel, bulkSaveTransactions } from './fetchers';
import { historyKeys } from './queries';

export const useUploadExcel = () =>
  useMutation({ mutationFn: uploadExcel });

export const useBulkSave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkSaveTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.searches() });
    },
  });
};
