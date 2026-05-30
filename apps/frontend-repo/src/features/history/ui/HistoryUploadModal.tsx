import { useRef, useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Button,
  Text,
  Box,
  Card,
  Table,
  Badge,
  ScrollArea,
} from '@mantine/core';
import { toast } from '@/shared/ui/toast';
import { useUploadExcel, useBulkSave } from '../api/mutations';
import type { TransactionDto } from '../model/types';
import { CATEGORY_COLORS } from '../model/constants';

function fmt(n: number) {
  return n.toLocaleString('ko-KR');
}

interface Props {
  opened: boolean;
  onClose: () => void;
}

const previewCardStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 20,
} as const;

export function HistoryUploadModal({ opened, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<TransactionDto[]>([]);

  const uploadMutation = useUploadExcel();
  const bulkMutation = useBulkSave();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('엑셀 파일(.xlsx, .xls)만 선택할 수 있습니다.', { title: '업로드 실패', autoClose: 3000 });
      return;
    }

    setFileName(file.name);
    setParsedRows([]);

    uploadMutation.mutate(file, {
      onSuccess: rows => {
        if (rows.length === 0) {
          toast.info('미리보기할 데이터가 없습니다.', { title: '파싱 완료', autoClose: 3000 });
        } else {
          setParsedRows(rows);
          toast.info(`${rows.length}건을 불러왔습니다.`, { title: '파싱 완료', autoClose: 3000 });
        }
      },
      onError: () => {
        toast.error('서버에서 엑셀 파일을 읽는 중 오류가 발생했습니다.', { title: '파싱 오류', autoClose: 3000 });
      },
    });
  };

  const handleSave = () => {
    if (parsedRows.length === 0) return;
    bulkMutation.mutate(parsedRows, {
      onSuccess: added => {
        const skipped = parsedRows.length - added.length;
        toast.success(`${added.length}건 저장${skipped > 0 ? `, ${skipped}건 중복 제외` : ''}`, { title: '저장 완료', autoClose: 3000 });
        handleClose();
      },
      onError: () => {
        toast.error('서버 저장 중 오류가 발생했습니다.', { title: '저장 오류', autoClose: 3000 });
      },
    });
  };

  const handleClose = () => {
    setParsedRows([]);
    setFileName('');
    uploadMutation.reset();
    bulkMutation.reset();
    onClose();
  };

  const isLoading = uploadMutation.isPending || bulkMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="엑셀 업로드"
      size="xl"
      centered
      radius="xl"
      styles={{
        content: {
          backgroundColor: 'var(--card)',
          color: 'var(--text)',
        },
        header: {
          backgroundColor: 'var(--card)',
          color: 'var(--text)',
        },
      }}
    >
      <Stack gap="md">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Group justify="space-between" align="center">
          <Text size="sm" style={{ color: 'var(--text)', opacity: 0.72 }}>
            선택한 파일: <strong>{fileName || '없음'}</strong>
          </Text>
          <Button
            variant="outline"
            size="sm"
            radius="xl"
            loading={uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            파일 선택
          </Button>
        </Group>

        <Text size="sm" style={{ color: 'var(--text)', opacity: 0.72 }}>
          카드사 엑셀 파일을 업로드하면 서버에서 거래 내역을 파싱하고, 저장 전에 미리보기를
          확인할 수 있습니다.
        </Text>

        {uploadMutation.isError && (
          <Box
            p="sm"
            style={{
              backgroundColor: 'var(--bg)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <Text size="sm" style={{ color: 'var(--text)' }}>
              서버에서 업로드 파일을 분석하는 중 오류가 발생했습니다.
            </Text>
          </Box>
        )}

        {parsedRows.length > 0 ? (
          <>
            <Text size="sm" fw={700} style={{ color: 'var(--text)' }}>
              미리보기 ({parsedRows.length}건)
            </Text>
            <ScrollArea h={300} type="hover">
              <Table
                highlightOnHover
                styles={{
                  table: { color: 'var(--text)' },
                  th: {
                    backgroundColor: 'var(--bg)',
                    borderBottom: '1px solid var(--border)',
                  },
                  td: {
                    borderBottom: '1px solid var(--border)',
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>날짜</Table.Th>
                    <Table.Th>가맹점명</Table.Th>
                    <Table.Th>카테고리</Table.Th>
                    <Table.Th ta="right">금액</Table.Th>
                    <Table.Th>카드명</Table.Th>
                    <Table.Th>할부</Table.Th>
                    <Table.Th>상태</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {parsedRows.map((row, i) => (
                    <Table.Tr key={`${i}-${row.transactionDate}-${row.merchant}`}>
                      <Table.Td>{row.transactionDate}</Table.Td>
                      <Table.Td>{row.merchant}</Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          radius="xl"
                          style={{
                            backgroundColor: CATEGORY_COLORS[row.categoryName] ?? 'var(--text)',
                            color: '#fff',
                          }}
                        >
                          {row.categoryName}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right">{fmt(row.amount)}원</Table.Td>
                      <Table.Td>{row.cardName}</Table.Td>
                      <Table.Td>{row.installment === 1 ? '일시불' : `${row.installment}개월`}</Table.Td>
                      <Table.Td>
                        <Badge
                          radius="xl"
                          variant="light"
                          size="sm"
                          style={{
                            backgroundColor: row.status === '승인' ? 'rgba(255, 204, 0, 0.18)' : 'var(--bg)',
                            border: `1px solid ${row.status === '승인' ? 'var(--kb-yellow)' : 'var(--border)'}`,
                            color: 'var(--text)',
                          }}
                        >
                          {row.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Group justify="flex-end">
              <Button
                variant="outline"
                radius="xl"
                onClick={handleClose}
                disabled={isLoading}
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                취소
              </Button>
              <Button
                radius="xl"
                fw={800}
                loading={bulkMutation.isPending}
                onClick={handleSave}
                style={{
                  backgroundColor: 'var(--kb-yellow)',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(255, 204, 0, 0.4)',
                }}
              >
                {parsedRows.length}건 저장
              </Button>
            </Group>
          </>
        ) : (
          <Card p="lg" style={previewCardStyle}>
            <Text size="sm" style={{ color: 'var(--text)', opacity: 0.72 }}>
              파일을 선택하면 파싱 결과가 이 영역에 표시됩니다.
            </Text>
          </Card>
        )}
      </Stack>
    </Modal>
  );
}
