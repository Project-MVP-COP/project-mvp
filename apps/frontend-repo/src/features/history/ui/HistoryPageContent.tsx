import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import {
  Stack,
  Group,
  Text,
  Select,
  Button,
  Box,
  Title,
  Chip,
  LoadingOverlay,
  Card,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

import { historyQueries } from '../api/queries';
import type { FilterState, SearchParams, SortField, SortOrder, TransactionDto } from '../model/types';
import { DEFAULT_FILTERS, PAGE_SIZE } from '../model/constants';
import { HistoryFilterBar } from './HistoryFilterBar';
import { HistoryTable } from './HistoryTable';
import { HistoryDetailModal } from './HistoryDetailModal';
import { HistoryUploadModal } from './HistoryUploadModal';

function fmt(n: number) {
  return n.toLocaleString('ko-KR');
}

function buildSearchParams(
  filters: FilterState,
  sortField: SortField,
  sortOrder: SortOrder,
  page: number,
): SearchParams {
  return {
    ...(filters.dateStart && { dateStart: filters.dateStart }),
    ...(filters.dateEnd && { dateEnd: filters.dateEnd }),
    ...(filters.category && { categoryName: filters.category }),
    ...(filters.amountMin && { amountMin: Number(filters.amountMin) }),
    ...(filters.amountMax && { amountMax: Number(filters.amountMax) }),
    ...(filters.card && { cardName: filters.card }),
    ...(filters.status && { status: filters.status }),
    ...(filters.search && { search: filters.search }),
    sortField,
    sortOrder,
    page,
    size: PAGE_SIZE,
  };
}

const cardStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
} as const;

const summaryChipStyle = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
} as const;

export function HistoryPageContent() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);

  const [selectedTxn, setSelectedTxn] = useState<TransactionDto | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [uploadOpened, { open: openUpload, close: closeUpload }] = useDisclosure(false);

  const searchParams = buildSearchParams(appliedFilters, sortField, sortOrder, page);

  const { data: pageResult, isFetching, isLoading } = useQuery({
    ...historyQueries.search(searchParams),
    placeholderData: keepPreviousData,
  });

  const transactions = pageResult?.data ?? [];
  const totalCount = pageResult?.totalCount ?? 0;
  const approvedCount = pageResult?.approvedCount ?? 0;
  const cancelledCount = pageResult?.cancelledCount ?? 0;
  const totalAmount = pageResult?.totalAmount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setAppliedFilters(filters);
    setPage(0);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSortField('date');
    setSortOrder('desc');
    setPage(0);
  };

  const handleSortChange = (val: string | null) => {
    if (!val) return;
    const [field, order] = val.split('_') as [SortField, SortOrder];
    setSortField(field);
    setSortOrder(order);
    setPage(0);
  };

  const handleRowClick = (txn: TransactionDto) => {
    setSelectedTxn(txn);
    openDetail();
  };

  const handlePageChange = (p: number) => setPage(p - 1);

  const handleSavedTransaction = (updated: TransactionDto) => {
    setSelectedTxn(updated);
    closeDetail();
  };

  return (
    <Box
      style={{
        backgroundColor: 'var(--bg)',
        minHeight: '100%',
        padding: '40px 0',
        transition: '0.25s ease-in-out',
      }}
    >
      <Stack gap={20} mx="auto" w="100%" maw={1200} px={{ base: 'md', md: 'lg', xl: 0 }}>
        <Card p="xl" style={cardStyle}>
          <Group justify="space-between" align="center" wrap="wrap" gap="lg">
            <Stack gap={0} justify="center">
              <Title order={2} style={{ color: 'var(--text)', lineHeight: 1.15 }}>
                카드 이용내역 관리
              </Title>
            </Stack>

            <Button
              size="md"
              radius="xl"
              leftSection={<IconUpload size={16} />}
              onClick={openUpload}
              style={{
                backgroundColor: 'var(--kb-yellow)',
                color: '#000',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(255, 204, 0, 0.4)',
              }}
            >
              엑셀 업로드
            </Button>
          </Group>
        </Card>

        <HistoryFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          onApply={handleApply}
        />

        <Card p="lg" style={cardStyle}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="xs" align="center">
              <Text size="sm" fw={700} style={{ color: 'var(--text)', opacity: 0.7 }}>
                정렬
              </Text>
              <Select
                size="sm"
                radius="xl"
                w={170}
                value={`${sortField}_${sortOrder}`}
                onChange={handleSortChange}
                data={[
                  { value: 'date_desc', label: '최신순' },
                  { value: 'date_asc', label: '오래된순' },
                  { value: 'amount_desc', label: '금액 높은순' },
                  { value: 'amount_asc', label: '금액 낮은순' },
                  { value: 'merchant_asc', label: '가맹점명 순' },
                ]}
                styles={{
                  input: {
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  },
                }}
              />
            </Group>

            <Group gap="xs">
              <Chip checked={false} onChange={() => { }} style={summaryChipStyle}>
                총 {totalCount}건
              </Chip>
              <Chip checked={false} onChange={() => { }} style={summaryChipStyle}>
                승인 합계 {fmt(totalAmount)}원
              </Chip>
              <Chip checked={false} onChange={() => { }} style={summaryChipStyle}>
                승인 {approvedCount}건
              </Chip>
              <Chip checked={false} onChange={() => { }} style={summaryChipStyle}>
                취소 {cancelledCount}건
              </Chip>
            </Group>
          </Group>
        </Card>

        <Box pos="relative">
          <LoadingOverlay
            visible={isFetching && !isLoading}
            zIndex={10}
            overlayProps={{ radius: 'xl', blur: 1, opacity: 0.3 }}
            loaderProps={{ color: 'brandYellow', size: 'sm' }}
          />
          <HistoryTable
            data={transactions}
            page={page + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            isLoading={isLoading}
          />
        </Box>

        <HistoryDetailModal
          opened={detailOpened}
          onClose={closeDetail}
          transaction={selectedTxn}
          onSaved={handleSavedTransaction}
        />

        <HistoryUploadModal opened={uploadOpened} onClose={closeUpload} />
      </Stack>
    </Box>
  );
}
