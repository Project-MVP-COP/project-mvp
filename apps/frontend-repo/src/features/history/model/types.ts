export interface TransactionDto {
  id: number;
  userId?: number;
  transactionDate: string;
  merchant: string;
  categoryId?: number;
  categoryName: string;
  amount: number;
  cardName: string;
  installment: number;
  status: '승인' | '취소';
  memo?: string | null;
}

export type TransactionStatus = '승인' | '취소';

export interface UpdateTransactionPayload {
  merchant: string;
  categoryName: string;
  amount: number;
  cardName: string;
  installment: number;
  status: TransactionStatus;
  memo?: string | null;
}

export interface TransactionPageResult {
  totalCount: number;
  approvedCount: number;
  cancelledCount: number;
  totalAmount: number;
  hasMore: boolean;
  data: TransactionDto[];
}

export interface FilterState {
  dateStart: string;
  dateEnd: string;
  category: string;
  amountMin: string;
  amountMax: string;
  card: string;
  status: string;
  search: string;
}

export type SortField = 'date' | 'amount' | 'merchant';
export type SortOrder = 'asc' | 'desc';

export interface SearchParams {
  dateStart?: string;
  dateEnd?: string;
  categoryName?: string;
  amountMin?: number;
  amountMax?: number;
  cardName?: string;
  status?: string;
  search?: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  size?: number;
}
