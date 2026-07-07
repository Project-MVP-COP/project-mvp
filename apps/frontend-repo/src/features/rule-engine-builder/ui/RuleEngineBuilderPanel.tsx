import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  ColorInput,
  ColorSwatch,
  Group,
  NativeSelect,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconBolt,
  IconCategoryPlus,
  IconDeviceFloppy,
  IconPalette,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconZoomQuestion,
} from "@tabler/icons-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "@/shared/ui/toast";
import {
  createRule,
  deleteRule,
  dryRunRule,
} from "@/features/rule-engine-builder/api/mutations";
import {
  ruleEngineKeys,
  ruleEngineQueries,
} from "@/features/rule-engine-builder/api/queries";
import type {
  RuleDryRunResult,
} from "@/features/rule-engine-builder/model/types";

interface RuleEngineCategory {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
}

interface RuleEngineTransaction {
  id: number;
  transactionDate: string;
  merchant: string;
  categoryId?: number | null;
  categoryName?: string | null;
  amount: number;
  cardName: string;
}

interface RuleEngineBuilderPanelProps {
  categories: RuleEngineCategory[];
  transactions: RuleEngineTransaction[];
  onRuleApplied?: () => void;
}

interface LocalCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

const defaultCategoryColor = "#8b5cf6";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("ko-KR").format(amount);

const isUnclassified = (transaction: RuleEngineTransaction) =>
  transaction.categoryId == null && !transaction.categoryName;

const toLocalCategories = (categories: RuleEngineCategory[]): LocalCategory[] =>
  categories.map((category) => ({
    id: String(category.id),
    name: category.name,
    color: category.color,
    isDefault: category.isDefault,
  }));

const categoryOptions = (categories: LocalCategory[]) =>
  categories.length === 0 ? ["미분류"] : categories.map((category) => category.name);

export function RuleEngineBuilderPanel({
  categories: serverCategories,
  transactions,
  onRuleApplied,
}: RuleEngineBuilderPanelProps) {
  const isDesktopLayout = useMediaQuery("(min-width: 62em)");
  const queryClient = useQueryClient();
  const [rulesQuery, patternsQuery] = useSuspenseQueries({
    queries: [ruleEngineQueries.rules(), ruleEngineQueries.patterns()],
  });
  const rules = rulesQuery.data;
  const suggestions = patternsQuery.data;
  const baseCategories = useMemo(
    () => toLocalCategories(serverCategories),
    [serverCategories],
  );
  const [customCategories, setCustomCategories] = useState<LocalCategory[]>([]);
  const categories = useMemo(
    () => [...baseCategories, ...customCategories],
    [baseCategories, customCategories],
  );
  const ruleCategoryOptions = useMemo(
    () => categoryOptions(baseCategories),
    [baseCategories],
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(defaultCategoryColor);
  const [keyword, setKeyword] = useState("");
  const [targetCategory, setTargetCategory] = useState(
    ruleCategoryOptions[0],
  );
  const [tag, setTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDryRun, setShowDryRun] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<RuleDryRunResult | null>(
    null,
  );

  const unclassifiedCount = useMemo(
    () => transactions.filter(isUnclassified).length,
    [transactions],
  );
  const selectedCategory = baseCategories.find(
    (category) => category.name === targetCategory,
  );
  const dryRunMatches = dryRunResult?.transactions ?? [];
  const clearPreview = () => {
    setDryRunResult(null);
    setShowDryRun(false);
  };

  const invalidateRuleQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ruleEngineKeys.all });
  };

  const dryRunMutation = useMutation({
    mutationFn: dryRunRule,
    onSuccess: (result) => {
      setDryRunResult(result);
      setShowDryRun(true);
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: createRule,
    onSuccess: async () => {
      await invalidateRuleQueries();
      onRuleApplied?.();
      setKeyword("");
      setTag("");
      setDryRunResult(null);
      setShowDryRun(false);
      toast.success("매핑 룰을 등록하고 일치 거래를 갱신했습니다.");
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: async () => {
      await invalidateRuleQueries();
      toast.success("매핑 룰을 삭제했습니다.");
    },
  });

  const analyzePatterns = () => {
    setShowSuggestions(true);
    patternsQuery.refetch();
  };

  const addCategory = () => {
    const name = categoryName.trim();
    if (!name) {
      toast.warning("카테고리명을 입력해주세요.");
      return;
    }
    if (categories.some((category) => category.name === name)) {
      toast.warning("이미 등록된 카테고리입니다.");
      return;
    }

    setCustomCategories((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        name,
        color: categoryColor,
        isDefault: false,
      },
    ]);
    setCategoryName("");
    toast.success("카테고리 스토어에 추가했습니다. 규칙 바인딩은 서버 카테고리만 사용할 수 있습니다.");
  };

  const removeCustomCategory = (categoryToRemove: LocalCategory) => {
    setCustomCategories((current) =>
      current.filter((category) => category.id !== categoryToRemove.id),
    );
    if (targetCategory === categoryToRemove.name) {
      setTargetCategory(baseCategories[0]?.name ?? "미분류");
      clearPreview();
    }
  };

  const applySuggestion = (suggestion: {
    keyword: string;
    recommendedCategoryId: number;
    recommendedCategoryName: string;
  }) => {
    setKeyword(suggestion.keyword);
    setTargetCategory(suggestion.recommendedCategoryName);
    setTag(`#${suggestion.keyword.replace(/\s+/g, "_")}`);
    setShowSuggestions(false);
    dryRunMutation.mutate({
      keyword: suggestion.keyword,
      categoryId: suggestion.recommendedCategoryId,
    });
    toast.info("추천 패턴을 규칙 입력값에 반영했습니다.");
  };

  const getSelectedCategoryId = () => {
    if (!selectedCategory) {
      toast.warning("규칙에 적용할 서버 카테고리를 선택해주세요.");
      return null;
    }
    return Number(selectedCategory.id);
  };

  const runDryRun = () => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      toast.warning("감지할 가맹점 키워드를 입력해주세요.");
      return;
    }

    const categoryId = getSelectedCategoryId();
    if (categoryId == null) return;

    dryRunMutation.mutate({
      keyword: normalizedKeyword,
      categoryId,
    });
  };

  const addRule = () => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      toast.warning("감지할 가맹점 키워드를 입력해주세요.");
      return;
    }

    const categoryId = getSelectedCategoryId();
    if (categoryId == null) return;

    createRuleMutation.mutate({
      keyword: normalizedKeyword,
      categoryId,
      tag: tag.trim() || `#${normalizedKeyword.replace(/\s+/g, "_")}`,
    });
  };

  return (
    <SimpleGrid cols={{ base: 1, lg: 12 }} spacing="xl">
      <Paper
        withBorder
        p="xl"
        radius="lg"
        mih={isDesktopLayout ? 632 : undefined}
        style={isDesktopLayout ? { gridColumn: "span 5" } : undefined}
      >
        <Stack gap="lg">
          <Stack gap={4}>
            <Group gap="xs">
              <ThemeIcon variant="light" color="yellow">
                <IconPalette size={20} />
              </ThemeIcon>
              <Title order={3}>무제한 커스텀 카테고리 정의</Title>
            </Group>
            <Text size="sm" c="dimmed">
              소비 정밀 진단을 위해 나만의 독창적인 소비 태그 그룹을 생성하세요.
            </Text>
          </Stack>

          <Paper withBorder bg="var(--mantine-color-gray-light)" p="md" radius="md">
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <TextInput
                  label="카테고리명"
                  placeholder="예: 시발비용, 배달중독"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.currentTarget.value)}
                />
                <ColorInput
                  label="테마 컬러"
                  value={categoryColor}
                  onChange={setCategoryColor}
                  format="hex"
                  swatches={[
                    "#f97316",
                    "#8b5cf6",
                    "#10b981",
                    "#3b82f6",
                    "#ec4899",
                    "#f59e0b",
                  ]}
                />
              </SimpleGrid>
              <Button
                variant="light"
                leftSection={<IconCategoryPlus size={16} />}
                onClick={addCategory}
              >
                카테고리 스토어 추가
              </Button>
            </Stack>
          </Paper>

          <Stack gap="sm">
            <Text size="sm" fw={700} c="dimmed">
              등록된 맞춤형 카테고리
            </Text>
            <ScrollArea h={348} type="always">
              <Stack gap="xs">
                {categories.map((category) => (
                  <Paper key={category.id} withBorder p="sm" radius="md">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <ColorSwatch color={category.color} size={14} />
                        <Text fw={800} size="sm">
                          {category.name}
                        </Text>
                      </Group>
                      {category.isDefault ? (
                        <Badge variant="light" color="gray">
                          기본
                        </Badge>
                      ) : (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => removeCustomCategory(category)}
                          aria-label={`${category.name} 삭제`}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        withBorder
        p="xl"
        radius="lg"
        mih={isDesktopLayout ? 632 : undefined}
        style={isDesktopLayout ? { gridColumn: "span 7" } : undefined}
      >
        <Stack gap="lg">
          <Stack gap={4}>
            <Group gap="xs">
              <ThemeIcon variant="light" color="yellow">
                <IconBolt size={20} />
              </ThemeIcon>
              <Title order={3}>스마트 분류 워크벤치</Title>
              <Badge color="red" variant="light">
                미분류 {unclassifiedCount}건
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              미분류 패턴 자동 탐색 → Dry Run 검증 → 정밀 규칙 등록까지 한 곳에서 처리하세요.
            </Text>
          </Stack>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <ThemeIcon variant="light" color="teal">
                  <IconZoomQuestion size={20} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={900}>미분류 패턴 자동 탐색기</Text>
                  <Text size="xs" c="dimmed">
                    반복되는 미분류 가맹점 패턴을 자동으로 찾아 규칙 후보를 제안합니다.
                  </Text>
                </Stack>
              </Group>
              <Button
                color="teal"
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={analyzePatterns}
                loading={patternsQuery.isFetching}
              >
                패턴 분석 실행
              </Button>
            </Group>
          </Paper>

          {showSuggestions && (
            <Stack gap="xs">
              {suggestions.length === 0 ? (
                <Paper withBorder p="md" radius="md">
                  <Text ta="center" c="dimmed">
                    추천할 미분류 패턴이 없습니다.
                  </Text>
                </Paper>
              ) : (
                suggestions.map((suggestion) => (
                  <Paper key={suggestion.keyword} withBorder p="md" radius="md">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Text fw={900}>"{suggestion.keyword}"</Text>
                          <Badge color="teal" variant="light">
                            {suggestion.occurrences}건
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          예시: {suggestion.exampleMerchant} · 합계 {formatAmount(suggestion.totalAmount)}원
                        </Text>
                      </Stack>
                      <Button size="xs" color="teal" onClick={() => applySuggestion(suggestion)}>
                        규칙 만들기
                      </Button>
                    </Group>
                  </Paper>
                ))
              )}
            </Stack>
          )}

          <Paper withBorder bg="var(--mantine-color-gray-light)" p="md" radius="md">
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <TextInput
                  label="감지할 가맹점 키워드"
                  placeholder="예: 스타벅스, 스타벅"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.currentTarget.value);
                    clearPreview();
                  }}
                />
                <NativeSelect
                  label="타겟 카테고리 바인딩"
                  value={targetCategory}
                  onChange={(event) => {
                    setTargetCategory(event.currentTarget.value);
                    clearPreview();
                  }}
                  data={ruleCategoryOptions}
                />
                <TextInput
                  label="할당할 자동 태그"
                  placeholder="예: #야근용, #충동지출"
                  value={tag}
                  onChange={(event) => {
                    setTag(event.currentTarget.value);
                    clearPreview();
                  }}
                />
              </SimpleGrid>

              <Button
                variant="light"
                color="gray"
                leftSection={<IconSearch size={16} />}
                onClick={runDryRun}
                loading={dryRunMutation.isPending}
              >
                이 규칙으로 영향 분석하기 (Dry Run 미리보기)
              </Button>

              {showDryRun && (
                <Paper withBorder p="md" radius="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={900}>Dry Run 결과</Text>
                      <Group gap="xs">
                        <Badge color={dryRunResult?.matchCount ? "teal" : "gray"} variant="light">
                          영향 {dryRunResult?.matchCount ?? 0}건
                        </Badge>
                        {dryRunResult && dryRunResult.newlyClassifiedCount > 0 && (
                          <Badge color="blue" variant="light">
                            신규 {dryRunResult.newlyClassifiedCount}건
                          </Badge>
                        )}
                        {dryRunResult?.hasOverrideRisk && (
                          <Badge color="orange" variant="light">
                            Override {dryRunResult.overrideCount}건
                          </Badge>
                        )}
                      </Group>
                    </Group>
                    {dryRunResult?.hasOverrideRisk && (
                      <Alert
                        color="orange"
                        variant="light"
                        icon={<IconAlertTriangle size={16} />}
                      >
                        이미 분류된 거래가 포함되어 있습니다. 기존 분류를 덮어쓸 수 있으니 키워드 범위를 확인해주세요.
                      </Alert>
                    )}
                    <ScrollArea h={180}>
                      <Table verticalSpacing="xs">
                        <Table.Tbody>
                          {dryRunMatches.length === 0 ? (
                            <Table.Tr>
                              <Table.Td>
                                <Text ta="center" c="dimmed" py="md">
                                  일치하는 거래가 없습니다.
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ) : (
                            dryRunMatches.slice(0, 5).map((transaction) => (
                              <Table.Tr key={transaction.id}>
                                <Table.Td>
                                  <Text fw={700}>{transaction.merchant}</Text>
                                  <Group gap="xs">
                                    <Text size="xs" c="dimmed">
                                      {transaction.transactionDate}
                                    </Text>
                                    {transaction.override && (
                                      <Badge size="xs" color="orange" variant="light">
                                        덮어쓰기
                                      </Badge>
                                    )}
                                    {transaction.newlyClassified && (
                                      <Badge size="xs" color="blue" variant="light">
                                        신규 분류
                                      </Badge>
                                    )}
                                  </Group>
                                </Table.Td>
                                <Table.Td ta="right" fw={700}>
                                  {formatAmount(transaction.amount)}원
                                </Table.Td>
                              </Table.Tr>
                            ))
                          )}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Stack>
                </Paper>
              )}

              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={addRule}
                loading={createRuleMutation.isPending}
              >
                매핑 룰 등록 및 데이터 소급 세척
              </Button>
              <Text size="xs" ta="center" c="dimmed">
                미리보기로 영향을 확인한 후 등록을 권장합니다.
              </Text>
            </Stack>
          </Paper>

          <Stack gap="sm">
            <Text size="sm" fw={700} c="dimmed">
              활성화된 룰 엔진 규칙
            </Text>
            <ScrollArea h={188} type="always">
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>감지 키워드</Table.Th>
                    <Table.Th>분류 지정 카테고리</Table.Th>
                    <Table.Th>자동 부착 태그</Table.Th>
                    <Table.Th ta="right">현재 적용</Table.Th>
                    <Table.Th ta="center">동작</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rules.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="xl">
                          등록된 룰 엔진 규칙이 없습니다.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    rules.map((rule) => (
                      <Table.Tr key={rule.id}>
                        <Table.Td>
                          <Text fw={800}>"{rule.keyword}"</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="orange">
                            {rule.categoryName || "미지정"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text c="teal" fw={800}>
                            {rule.tag ?? "-"}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Badge color="teal" variant="filled">
                            {rule.appliedCount}건
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            loading={deleteRuleMutation.isPending}
                            onClick={() =>
                              modals.openConfirmModal({
                                title: "규칙 삭제",
                                children: (
                                  <Text size="sm">
                                    "{rule.keyword}" 규칙을 삭제할까요?
                                  </Text>
                                ),
                                labels: { confirm: "삭제", cancel: "취소" },
                                confirmProps: { color: "red" },
                                onConfirm: () =>
                                  deleteRuleMutation.mutate(rule.id),
                              })
                            }
                            aria-label={`${rule.keyword} 규칙 삭제`}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}
