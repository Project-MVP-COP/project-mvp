import { useRef, useState } from 'react';
import {
  Modal, Stack, Group, Button, Text, Box, Card,
  Table, Badge, ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
      notifications.show({ title: '❌', message: '엑셀 파일(.xlsx, .xls)만 선택할 수 있습니다.', color: 'red', autoClose: 3000 });
      return;
    }

    setFileName(file.name);
    setParsedRows([]);

    uploadMutation.mutate(file, {
      onSuccess: (rows) => {
        if (rows.length === 0) {
          notifications.show({ title: '💡', message: '엑셀 데이터가 없습니다.', color: 'blue', autoClose: 3000 });
        } else {
          setParsedRows(rows);
          notifications.show({ title: '💡', message: `${rows.length}건 파싱 완료`, color: 'blue', autoClose: 3000 });
        }
      },
      onError: () => {
        notifications.show({ title: '❌', message: '서버에서 엑셀 파싱 중 오류가 발생했습니다.', color: 'red', autoClose: 3000 });
      },
    });
  };

  const handleSave = () => {
    if (parsedRows.length === 0) return;
    bulkMutation.mutate(parsedRows, {
      onSuccess: (added) => {
        const skipped = parsedRows.length - added.length;
        notifications.show({
          title: '✅',
          message: `${added.length}건 추가${skipped > 0 ? `, ${skipped}건 중복 건너뜀` : ''}`,
          color: 'green',
          autoClose: 3000,
        });
        handleClose();
      },
      onError: () => {
        notifications.show({ title: '❌', message: '서버 저장 중 오류가 발생했습니다.', color: 'red', autoClose: 3000 });
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
    <Modal opened={opened} onClose={handleClose} title="엑셀 업로드" size="xl" centered radius="xl">
      <Stack gap="md">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            선택된 파일: <strong>{fileName || '없음'}</strong>
          </Text>
          <Button
            variant="outline"
            size="sm"
            loading={uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            파일 선택
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          신한카드·KB국민카드 실제 내보내기 파일(.xls)을 그대로 업로드하면 카드사가 자동
          감지됩니다. 카테고리는 가맹점명 키워드로 자동 분류됩니다.
        </Text>

        {uploadMutation.isError && (
          <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-red-0)', borderRadius: 8, border: '1px solid var(--mantine-color-red-3)' }}>
            <Text size="sm" c="red">서버에서 엑셀을 파싱하는 중 오류가 발생했습니다.</Text>
          </Box>
        )}

        {parsedRows.length > 0 ? (
          <>
            <Text size="sm" fw={600}>미리보기 ({parsedRows.length}건)</Text>
            <ScrollArea h={300} type="hover">
              <Table striped highlightOnHover>
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
                          style={{
                            backgroundColor: CATEGORY_COLORS[row.categoryName] ?? '#64748b',
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
                        <Badge color={row.status === '승인' ? 'green' : 'red'} variant="light" size="sm">
                          {row.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Group justify="flex-end">
              <Button variant="default" onClick={handleClose} disabled={isLoading}>취소</Button>
              <Button
                fw={700}
                style={{ backgroundColor: '#FFCC00', color: '#000' }}
                loading={bulkMutation.isPending}
                onClick={handleSave}
              >
                {parsedRows.length}건 저장
              </Button>
            </Group>
          </>
        ) : (
          <Card withBorder radius="md" p="lg" bg="gray.0">
            <Text size="sm" c="dimmed">
              엑셀 파일을 선택하면 서버에서 파싱한 결과를 미리보기로 확인할 수 있습니다.
            </Text>
          </Card>
        )}
      </Stack>
    </Modal>
  );
}
