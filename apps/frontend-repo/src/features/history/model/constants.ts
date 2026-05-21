import type { FilterState } from './types';

export const CATEGORIES = [
  '식음료', '쇼핑', '교통', '의료/건강', '문화/여가',
  '편의점', '주유', '통신', '교육', '기타',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  '식음료':    '#f97316',
  '쇼핑':      '#8b5cf6',
  '교통':      '#3b82f6',
  '의료/건강': '#ef4444',
  '문화/여가': '#ec4899',
  '편의점':    '#10b981',
  '주유':      '#6b7280',
  '통신':      '#06b6d4',
  '교육':      '#f59e0b',
  '기타':      '#64748b',
};

export const CARDS = ['신한카드', '국민카드', '삼성카드', '현대카드', '우리카드'] as const;

export const PAGE_SIZE = 10;

export const DEFAULT_FILTERS: FilterState = {
  dateStart: '',
  dateEnd: '',
  category: '',
  amountMin: '',
  amountMax: '',
  card: '',
  status: '',
  search: '',
};
