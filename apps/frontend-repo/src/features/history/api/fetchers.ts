import { api } from '@/shared/api/axios';
import type {
  TransactionDto,
  TransactionPageResult,
  SearchParams,
  UpdateTransactionPayload,
} from '../model/types';

export const fetchTransactions = async (): Promise<TransactionDto[]> => {
  const { data } = await api.get<TransactionDto[]>('/api/transactions');
  return data;
};

export const searchTransactions = async (params: SearchParams): Promise<TransactionPageResult> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await api.get<TransactionPageResult>('/api/transactions/search', {
    params: cleanParams,
  });
  return data;
};

export const uploadExcel = async (file: File): Promise<TransactionDto[]> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<TransactionDto[]>('/api/excel/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const bulkSaveTransactions = async (rows: TransactionDto[]): Promise<TransactionDto[]> => {
  const { data } = await api.post<TransactionDto[]>('/api/transactions/bulk', rows);
  return data;
};

export const updateTransaction = async ({
  id,
  payload,
}: {
  id: number;
  payload: UpdateTransactionPayload;
}): Promise<TransactionDto> => {
  const { data } = await api.put<TransactionDto>(`/api/transactions/${id}`, payload);
  return data;
};
