import { Form, useNavigation } from "react-router";
import { 
  Stack, 
  Group, 
  Title, 
  Text, 
  Card, 
  TextInput, 
  Button, 
  Select, 
  Badge, 
  Paper,
  Divider,
  SimpleGrid
} from "@mantine/core";
import type { Sample } from "@/features/sample/model/types";

interface SampleListProps {
  samples: Sample[];
}

export function SampleList({ samples }: SampleListProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

  return (
    <Stack gap="xl" py="xl">
      <Title order={2}>React Query & FSD 기반 샘플 CRUD</Title>

      <Paper withBorder p="xl" radius="md" shadow="sm">
        <Title order={3} mb="md">새 샘플 생성</Title>
        <Form method="post">
          <input type="hidden" name="intent" value="create" />
          <Group align="flex-end">
            <TextInput
              name="message"
              label="샘플 메시지"
              placeholder="메시지를 입력하세요..."
              required
              style={{ flex: 1 }}
            />
            <Button type="submit" loading={isSubmitting}>
              생성
            </Button>
          </Group>
        </Form>
      </Paper>

      <Stack gap="md">
        <Title order={3}>샘플 목록</Title>
        {samples.length === 0 ? (
          <Text c="dimmed">사용 가능한 샘플이 없습니다.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
            {samples.map((sample) => (
              <Card key={sample.id} withBorder shadow="sm" radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group>
                      <Text fw={700} size="sm">ID: {sample.id}</Text>
                      <Badge color={sample.status === "ACTIVE" ? "green" : sample.status === "ERROR" ? "red" : "gray"}>
                        {sample.status}
                      </Badge>
                      {sample.urgent && <Badge color="orange" variant="filled">긴급</Badge>}
                    </Group>
                    <Text size="xs" c="dimmed">업데이트: {sample.updatedAt}</Text>
                  </Group>

                  <Divider />

                  <Form method="post">
                    <input type="hidden" name="intent" value="update" />
                    <input type="hidden" name="id" value={sample.id} />
                    <input type="hidden" name="status" value={sample.status} />
                    <input type="hidden" name="urgent" value={String(sample.urgent)} />
                    <Group align="flex-end">
                      <TextInput
                        name="message"
                        label="메시지 수정"
                        defaultValue={sample.message}
                        required
                        style={{ flex: 1 }}
                      />
                      <Button type="submit" variant="light" loading={isSubmitting}>
                        수정
                      </Button>
                    </Group>
                  </Form>

                  <Group align="flex-end" justify="space-between">
                    <Form method="post">
                      <input type="hidden" name="intent" value="patch" />
                      <input type="hidden" name="id" value={sample.id} />
                      <Group align="flex-end" gap="xs">
                        <Select
                          name="status"
                          label="상태 변경"
                          defaultValue={sample.status}
                          data={["ACTIVE", "INACTIVE", "ERROR"]}
                          style={{ width: 140 }}
                        />
                        <Button type="submit" variant="outline" loading={isSubmitting}>
                          상태 업데이트
                        </Button>
                      </Group>
                    </Form>

                    <Group gap="xs">
                      <Form method="post">
                        <input type="hidden" name="intent" value="error_test" />
                        <Button type="submit" color="orange" variant="light" loading={isSubmitting}>
                          에러 강제 발생
                        </Button>
                      </Form>

                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={sample.id} />
                        <Button type="submit" color="red" loading={isSubmitting}>
                          삭제
                        </Button>
                      </Form>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Stack>
  );
}
