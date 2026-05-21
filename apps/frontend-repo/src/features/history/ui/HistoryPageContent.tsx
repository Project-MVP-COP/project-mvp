import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import {
  Stack, Group, Text, Select, Button, Box, Title, Chip, LoadingOverlay,
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

export function HistoryPageContent() {
  // 필터 draft 상태 (입력 중인 값)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  // 실제 API 호출에 사용되는 적용된 필터
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0); // 0-based (API 스펙)

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

  // ① 필터 적용 클릭 → API 재조회
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

  // ② 정렬 변경 → 즉시 API 재조회
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

  // Mantine Pagination은 1-based이므로 +1/-1 변환
  const handlePageChange = (p: number) => setPage(p - 1);

  return (
    <Stack gap="md">
      {/* 페이지 헤더 */}
      <Box>
        <Title order={2}>
          내역 <span style={{ color: '#FFCC00' }}>관리</span>
        </Title>
        <Text size="sm" c="dimmed" mt={4}>카드 이용내역을 조회하고 분석합니다</Text>
      </Box>

      {/* 툴바 */}
      <Group gap="sm">
        {/* ③ 엑셀 업로드 버튼 → 업로드 모달 오픈 */}
        <Button
          size="sm"
          leftSection={<IconUpload size={14} />}
          style={{ backgroundColor: '#58a6ff', color: '#fff' }}
          onClick={openUpload}
        >
          엑셀 업로드
        </Button>
      </Group>

      {/* 필터 바 */}
      <HistoryFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onApply={handleApply}
      />

      {/* 정렬 + 요약 */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="xs" align="center">
          <Text size="sm" fw={600} c="dimmed">정렬</Text>
          {/* ② 정렬 셀렉트박스 변경 시 즉시 조회 */}
          <Select
            size="sm"
            style={{ width: 150 }}
            value={`${sortField}_${sortOrder}`}
            onChange={handleSortChange}
            data={[
              { value: 'date_desc', label: '최신순' },
              { value: 'date_asc', label: '오래된순' },
              { value: 'amount_desc', label: '높은 금액순' },
              { value: 'amount_asc', label: '낮은 금액순' },
              { value: 'merchant_asc', label: '가맹점명 순' },
            ]}
          />
        </Group>

        <Group gap="xs">
          <Chip size="sm" checked={false} onChange={() => {}}>총 {totalCount}건</Chip>
          <Chip size="sm" checked={false} onChange={() => {}}>합계 {fmt(totalAmount)}원</Chip>
          <Chip size="sm" color="green" checked={false} onChange={() => {}}>승인 {approvedCount}건</Chip>
          <Chip size="sm" color="red" checked={false} onChange={() => {}}>취소 {cancelledCount}건</Chip>
        </Group>
      </Group>

      {/* 테이블 (재조회 중 이전 데이터 유지 + overlay) */}
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

      {/* 상세 모달 */}
      <HistoryDetailModal
        opened={detailOpened}
        onClose={closeDetail}
        transaction={selectedTxn}
      />

      {/* ① 엑셀 업로드 모달 */}
      <HistoryUploadModal opened={uploadOpened} onClose={closeUpload} />
    </Stack>
  );
}
