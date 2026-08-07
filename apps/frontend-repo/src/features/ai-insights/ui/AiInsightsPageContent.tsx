import {
  Alert,
  Badge,
  Button,
  Code,
  Container,
  Group,
  NativeSelect,
  Paper,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBrain,
  IconChartLine,
  IconCircleCheck,
  IconDatabase,
  IconPigMoney,
  IconPlayerPause,
  IconRefresh,
  IconSparkles,
  IconTargetArrow,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSuspenseQueries } from "@tanstack/react-query";
import { generateInsight } from "@/features/ai-insights/api/fetchers";
import { aiInsightQueries } from "@/features/ai-insights/api/queries";
import {
  buildDataSignature,
  buildInsightRequest,
  buildPromptPreview,
  buildRecommendedGoals,
  buildTrajectoryRows,
  calculateCategoryStats,
  calculateTotalSaved,
  filterTransactionsForInsight,
  formatAmount,
  formatGeneratedAt,
  getPeriodLabel,
  getLatestTransactionMonth,
  hasCurrentMonthGoal,
  isTransactionClassified,
  seedMonthlyGoals,
} from "@/features/ai-insights/model/core";
import type {
  InsightFilters,
  InsightResponse,
  MonthlyGoal,
} from "@/features/ai-insights/model/types";
import { toast } from "@/shared/ui/toast";

const goalStorageKey = "card-horizon-ai-insight-goals";

const periodOptions = [
  { value: "ALL", label: "전체 기간" },
  { value: "LAST_1_MONTH", label: "최근 1개월" },
  { value: "LAST_3_MONTHS", label: "최근 3개월" },
];

const readGoals = () => {
  const storedValue = window.localStorage.getItem(goalStorageKey);
  if (!storedValue) return seedMonthlyGoals();

  try {
    return JSON.parse(storedValue) as MonthlyGoal[];
  } catch {
    return seedMonthlyGoals();
  }
};

const writeGoals = (goals: MonthlyGoal[]) => {
  window.localStorage.setItem(goalStorageKey, JSON.stringify(goals));
};

export function AiInsightsPageContent() {
  const [transactionsQuery, categoriesQuery] = useSuspenseQueries({
    queries: [aiInsightQueries.transactions(), aiInsightQueries.categories()],
  });
  const transactions = transactionsQuery.data;
  const categories = categoriesQuery.data;
  const [filters, setFilters] = useState<InsightFilters>({
    period: "ALL",
    categoryId: null,
  });
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [promptOpened, setPromptOpened] = useState(false);
  const [goals, setGoals] = useState<MonthlyGoal[]>(readGoals);
  const [requestErrorMessage, setRequestErrorMessage] = useState<string | null>(
    null,
  );
  const [lastSuccessSignature, setLastSuccessSignature] = useState<string | null>(
    null,
  );

  const filteredTransactions = useMemo(
    () => filterTransactionsForInsight(transactions, filters),
    [filters, transactions],
  );
  const categoryStats = useMemo(
    () => calculateCategoryStats(filteredTransactions),
    [filteredTransactions],
  );
  const currentGoalMonth = useMemo(
    () =>
      getLatestTransactionMonth(
        filteredTransactions.length > 0 ? filteredTransactions : transactions,
      ),
    [filteredTransactions, transactions],
  );
  const recommendedGoals = useMemo(
    () => buildRecommendedGoals(filteredTransactions, currentGoalMonth),
    [currentGoalMonth, filteredTransactions],
  );
  const unclassifiedTransactions = useMemo(
    () =>
      transactions.filter((transaction) => !isTransactionClassified(transaction)),
    [transactions],
  );
  const totalUnclassifiedAmount = unclassifiedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const totalAmount = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const promptPreview = buildPromptPreview(
    filteredTransactions,
    categories,
    filters,
  );
  const currentSignature = buildDataSignature(filteredTransactions);
  const isStaleInsight =
    insight != null &&
    lastSuccessSignature != null &&
    currentSignature !== lastSuccessSignature;
  const totalSaved = calculateTotalSaved(goals, filteredTransactions);
  const trajectoryRows = buildTrajectoryRows(goals, currentGoalMonth);
  const maxTrajectoryValue = Math.max(
    ...trajectoryRows.map((row) => Math.max(row.saved, row.target)),
    1,
  );
  const hasGoal = hasCurrentMonthGoal(goals, currentGoalMonth);

  const insightMutation = useMutation({
    mutationFn: generateInsight,
    onSuccess: (result) => {
      setInsight(result);
      setRequestErrorMessage(null);
      setLastSuccessSignature(currentSignature);
      toast.success("AI 인사이트를 생성했습니다.");
    },
    onError: () => {
      const message =
        "인사이트 생성에 실패했습니다. 조건을 확인한 뒤 다시 시도해주세요.";
      setRequestErrorMessage(message);
      toast.error(message);
    },
  });

  const requestInsight = () => {
    if (filteredTransactions.length === 0) {
      toast.warning("분석할 거래 내역이 없습니다.");
      return;
    }

    setRequestErrorMessage(null);
    insightMutation.mutate(buildInsightRequest(filteredTransactions, filters));
  };

  const selectGoal = (goal: MonthlyGoal) => {
    const nextGoals = [
      ...goals.filter((item) => item.month !== goal.month),
      goal,
    ].sort((a, b) => a.month.localeCompare(b.month));
    setGoals(nextGoals);
    writeGoals(nextGoals);
    toast.success("이번 달 절감 목표를 저장했습니다.");
  };

  const updateGoalStatus = (
    goalId: string,
    status: MonthlyGoal["status"],
  ) => {
    const nextGoals = goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            status,
            actualSaved:
              status === "completed" ? goal.actualSaved ?? goal.monthlySave : null,
          }
        : goal,
    );
    setGoals(nextGoals);
    writeGoals(nextGoals);
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Paper withBorder p="xl" radius="md" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="violet" size="lg">
                  <IconBrain size={22} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Title order={2}>AI 소비 인사이트</Title>
                  <Text size="sm" c="dimmed">
                    세척된 카드 이용 내역을 기간과 카테고리 조건으로 해석합니다.
                  </Text>
                </Stack>
              </Group>
              <Badge variant="light" color="violet">
                MVP-300
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <NativeSelect
                label="기간 조건"
                value={filters.period}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    period: event.currentTarget.value as InsightFilters["period"],
                  }))
                }
                data={periodOptions}
              />
              <NativeSelect
                label="카테고리 조건"
                value={String(filters.categoryId ?? "all")}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    categoryId:
                      event.currentTarget.value === "all"
                        ? null
                        : Number(event.currentTarget.value),
                  }))
                }
                data={[
                  { value: "all", label: "전체 카테고리" },
                  ...categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  })),
                ]}
              />
              <Button
                mt={{ base: 0, md: 24 }}
                leftSection={<IconSparkles size={16} />}
                color="violet"
                onClick={requestInsight}
                loading={insightMutation.isPending}
              >
                인사이트 생성
              </Button>
            </SimpleGrid>

            <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-gray-light)">
              <Group justify="space-between" gap="sm">
                <Group gap="xs">
                  <IconDatabase size={16} />
                  <Text size="sm" c="dimmed">
                    {getPeriodLabel(filters.period)} · {filteredTransactions.length}건 ·{" "}
                    {formatAmount(totalAmount)}원
                  </Text>
                </Group>
                <Button
                  variant="subtle"
                  color="teal"
                  size="xs"
                  onClick={() => setPromptOpened((opened) => !opened)}
                >
                  프롬프트 보기
                </Button>
              </Group>
            </Paper>

            {requestErrorMessage && (
              <Alert
                color="red"
                variant="light"
                icon={<IconAlertTriangle size={16} />}
              >
                {requestErrorMessage}
              </Alert>
            )}
          </Stack>
        </Paper>

        {unclassifiedTransactions.length > 0 && (
          <Alert
            color="orange"
            variant="light"
            icon={<IconAlertTriangle size={18} />}
            title="미분류 데이터 잔여"
          >
            미분류 거래 {unclassifiedTransactions.length}건,{" "}
            {formatAmount(totalUnclassifiedAmount)}원이 남아 있어 인사이트 품질이 제한될 수 있습니다.
          </Alert>
        )}

        <Paper withBorder p="xl" radius="md" shadow="sm">
          {insightMutation.isPending ? (
            <Stack align="center" gap="sm" py="xl">
              <ThemeIcon variant="light" color="violet" size={56} radius="md">
                <IconBrain size={28} />
              </ThemeIcon>
              <Text fw={800}>AI가 분석 중입니다</Text>
              <Text size="sm" c="dimmed">
                현재 조건의 거래 내역을 요약하고 핵심 포인트를 만들고 있습니다.
              </Text>
            </Stack>
          ) : insight == null ? (
            <Stack align="center" gap="sm" py="xl">
              <ThemeIcon variant="light" color="violet" size={56} radius="md">
                <IconBrain size={28} />
              </ThemeIcon>
              <Title order={3}>인사이트가 아직 없습니다</Title>
              <Text size="sm" c="dimmed" ta="center">
                조건을 설정하고 인사이트 생성을 눌러 주세요.
              </Text>
            </Stack>
          ) : (
            <Stack gap="lg">
              <Group justify="space-between">
                <Badge variant="light" color="violet">
                  AI 인사이트
                </Badge>
                <Text size="xs" c="dimmed">
                  {formatGeneratedAt(insight.generatedAt)}
                </Text>
              </Group>
              {isStaleInsight && (
                <Alert color="yellow" variant="light" icon={<IconRefresh size={16} />}>
                  거래 데이터나 조회 조건이 변경되었습니다. 최신 내역 기준으로 다시 생성하면 결과 신뢰도를 높일 수 있습니다.
                </Alert>
              )}
              <Text size="sm" lh={1.7}>
                {insight.summary}
              </Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                {insight.cards.map((card) => (
                  <Paper key={card.title} withBorder p="md" radius="md">
                    <Stack gap="xs">
                      <ThemeIcon variant="light" color="violet">
                        <IconSparkles size={18} />
                      </ThemeIcon>
                      <Text fw={900}>{card.title}</Text>
                      <Text size="sm" c="dimmed">
                        {card.description}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          )}
        </Paper>

        {promptOpened && (
          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Text fw={800} c="teal">
                전송 프롬프트 미리보기
              </Text>
              <Code block>{promptPreview}</Code>
            </Stack>
          </Paper>
        )}

        {insight != null && (
          <Stack gap="lg">
            <Paper withBorder p="xl" radius="md" shadow="sm">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="yellow">
                    <IconPigMoney size={20} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Title order={3}>목표 관리 & 총 절감</Title>
                    <Text size="sm" c="dimmed">
                      이전 목표와 이번 달 목표를 함께 관리합니다.
                    </Text>
                  </Stack>
                </Group>
                <Stack gap={0} align="flex-end">
                  <Text size="xs" c="dimmed">
                    누적 절감액
                  </Text>
                  <Text size="xl" fw={900} c="brandYellow">
                    {formatAmount(totalSaved)}원
                  </Text>
                </Stack>
              </Group>

              <Stack gap="sm" mt="lg">
                {goals.map((goal) => (
                  <Paper key={goal.id} withBorder p="md" radius="md">
                    <Group justify="space-between" align="center">
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Text fw={900}>{goal.title}</Text>
                          <Badge
                            color={
                              goal.status === "active"
                                ? "teal"
                                : goal.status === "completed"
                                  ? "green"
                                  : "gray"
                            }
                            variant="light"
                          >
                            {goal.status === "active"
                              ? "유지 중"
                              : goal.status === "completed"
                                ? "완수"
                                : "중단"}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {goal.month} · 월 {formatAmount(goal.monthlySave)}원 절감 목표
                        </Text>
                      </Stack>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          leftSection={<IconCircleCheck size={14} />}
                          onClick={() => updateGoalStatus(goal.id, "completed")}
                        >
                          완수
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="gray"
                          leftSection={<IconPlayerPause size={14} />}
                          onClick={() => updateGoalStatus(goal.id, "stopped")}
                        >
                          중단
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Paper withBorder p="xl" radius="md" shadow="sm">
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="violet">
                    <IconChartLine size={20} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Title order={3}>절감·자산 추이</Title>
                    <Text size="sm" c="dimmed">
                      유지 중인 목표의 중첩 절감을 반영한 과거·현재·미래 흐름입니다.
                    </Text>
                  </Stack>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 6 }} spacing="sm">
                  {trajectoryRows.map((row) => (
                    <Paper
                      key={row.month}
                      withBorder
                      p="sm"
                      radius="md"
                      bg={
                        row.isCurrent
                          ? "var(--mantine-color-yellow-light)"
                          : "var(--mantine-color-body)"
                      }
                    >
                      <Stack gap={8}>
                        <Group justify="space-between">
                          <Text size="xs" fw={800}>
                            {row.month}
                          </Text>
                          {row.isCurrent && (
                            <Badge size="xs" color="yellow" variant="filled">
                              현재
                            </Badge>
                          )}
                        </Group>
                        <Progress.Root size="lg">
                          <Progress.Section
                            value={(row.saved / maxTrajectoryValue) * 100}
                            color="teal"
                          />
                        </Progress.Root>
                        <Text size="xs" c="dimmed">
                          누적 {formatAmount(row.saved)}원
                        </Text>
                        <Text size="xs" c="dimmed">
                          목표 {formatAmount(row.target)}원
                        </Text>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>

            {!hasGoal && (
              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Stack gap="md">
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="teal">
                      <IconTargetArrow size={20} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Title order={3}>이번 달 AI 추천 목표</Title>
                      <Text size="sm" c="dimmed">
                        한 달에 하나만 선택할 수 있습니다.
                      </Text>
                    </Stack>
                  </Group>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    {recommendedGoals.map((goal) => (
                      <Paper key={goal.id} withBorder p="md" radius="md">
                        <Stack gap="sm">
                          <Text fw={900}>{goal.title}</Text>
                          <Text size="sm" c="dimmed">
                            현재 {formatAmount(goal.baselineAmount)}원에서 목표{" "}
                            {formatAmount(goal.targetAmount)}원까지 줄이는 계획입니다.
                          </Text>
                          <Badge color="teal" variant="light">
                            월 {formatAmount(goal.monthlySave)}원 절감
                          </Badge>
                          <Button
                            size="xs"
                            variant="light"
                            color="teal"
                            onClick={() => selectGoal(goal)}
                          >
                            목표 선택
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Paper>
            )}

            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Text size="sm" fw={800} c="dimmed">
                  카테고리별 분석 기준
                </Text>
                <ScrollArea h={160}>
                  <Stack gap="xs">
                    {categoryStats.map((category) => (
                      <Group key={category.name} justify="space-between">
                        <Text size="sm">{category.name}</Text>
                        <Text size="sm" fw={800}>
                          {formatAmount(category.amount)}원
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
