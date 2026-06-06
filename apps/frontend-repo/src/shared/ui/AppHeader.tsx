import {
  ActionIcon,
  Avatar,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrush,
  IconChartLine,
  IconChevronDown,
  IconLayoutGrid,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSparkles,
  IconSun,
  IconTool,
} from "@tabler/icons-react";
import { useState } from "react";

const userAvatarDefault =
  "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png";

const navTabs = [
  { label: "내역 세척 및 관리", value: "/washing", icon: IconBrush },
  { label: "규칙 엔진 빌더", value: "/rules", icon: IconTool, disabled: true },
  { label: "피벗 분석", value: "/pivot", icon: IconLayoutGrid, disabled: true },
  { label: "미래 가치 시뮬레이터", value: "/sim", icon: IconChartLine, disabled: true },
  { label: "샘플", value: "/sample", icon: IconSparkles },
];

interface AppHeaderProps {
  colorScheme: "light" | "dark";
  onToggleColorScheme: () => void;
  activeTab: string | null;
  onTabChange: (value: string) => void;
  isAuthenticated: boolean;
  nickname: string | null;
  onLogout: () => void;
}

const getActiveTab = (pathname: string | null) =>
  navTabs.find((tab) => pathname?.startsWith(tab.value))?.value ?? "/washing";

export function AppHeader({
  colorScheme,
  onToggleColorScheme,
  activeTab,
  onTabChange,
  isAuthenticated,
  nickname,
  onLogout,
}: AppHeaderProps) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const resolvedActiveTab = getActiveTab(activeTab);

  return (
    <Box component="header">
      <Container size="xl" h={60}>
        <Group justify="space-between" h="100%">
          <Group gap="md">
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
              size="sm"
            />
            <Button
              variant="subtle"
              color="brandYellow"
              px={0}
              onClick={() => onTabChange("/washing")}
              leftSection={<IconSparkles size={18} />}
            >
              <Title order={3}>Card Horizon</Title>
            </Button>
          </Group>

          <Group gap="sm">
            <ActionIcon
              variant="default"
              size="lg"
              onClick={onToggleColorScheme}
              title="테마 변경"
              visibleFrom="sm"
            >
              {colorScheme === "dark" ? (
                <IconSun size={20} stroke={1.5} />
              ) : (
                <IconMoon size={20} stroke={1.5} />
              )}
            </ActionIcon>

            {isAuthenticated ? (
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: "pop-top-right" }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <Button
                    variant={userMenuOpened ? "light" : "subtle"}
                    color="gray"
                    px="xs"
                    h={38}
                  >
                    <Group gap={7}>
                      <Avatar
                        src={userAvatarDefault}
                        alt={nickname || "사용자"}
                        radius="xl"
                        size={24}
                      />
                      <Text fw={500} size="sm" lh={1} mr={3} visibleFrom="xs">
                        {nickname}
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} />
                    </Group>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>사용자</Menu.Label>
                  <Menu.Item
                    leftSection={<IconSettings size={16} stroke={1.5} />}
                  >
                    계정 설정
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLogout size={16} stroke={1.5} />}
                    onClick={onLogout}
                  >
                    로그아웃
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs" visibleFrom="xs">
                <Button
                  variant="default"
                  radius="sm"
                  size="sm"
                  h={34}
                  onClick={() => onTabChange("/login")}
                >
                  로그인
                </Button>
                <Button
                  color="brandYellow"
                  radius="sm"
                  size="sm"
                  h={34}
                  onClick={() => onTabChange("/register")}
                >
                  회원가입
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>

      <Container size="xl" visibleFrom="sm">
        <Tabs
          value={resolvedActiveTab}
          onChange={(value) => onTabChange(value || "/washing")}
          styles={{
            list: {
              gap: rem(6),
              borderBottom: 0,
              paddingBottom: rem(8),
              "--tabs-list-border-width": "0",
            },
            tab: {
              minHeight: rem(42),
              paddingInline: rem(16),
              borderRadius: rem(12),
              fontWeight: 700,
              color: "var(--mantine-color-dimmed)",
              backgroundColor: "transparent",
              transition:
                "background-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
            },
            tabSection: {
              marginInlineEnd: rem(8),
            },
          }}
        >
          <Tabs.List>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = resolvedActiveTab === tab.value;

              return (
                <Tabs.Tab
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.disabled}
                  leftSection={<Icon size={16} />}
                  bg={isActive ? "brandYellow" : undefined}
                  c={isActive ? "black" : "dimmed"}
                  bd={isActive ? "1px solid var(--mantine-color-brandYellow-6)" : undefined}
                >
                  {tab.label}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>
      </Container>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />
          {navTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <NavLink
                key={tab.value}
                label={tab.label}
                leftSection={<Icon size={18} />}
                active={resolvedActiveTab === tab.value}
                disabled={tab.disabled}
                onClick={() => {
                  if (tab.disabled) {
                    return;
                  }
                  onTabChange(tab.value);
                  closeDrawer();
                }}
                fw={resolvedActiveTab === tab.value ? 700 : 500}
                color="brandYellow"
              />
            );
          })}

          <Divider my="sm" />

          <Box px="md" py="xs">
            {isAuthenticated ? (
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  접속 계정: {nickname}
                </Text>
                <Button
                  variant="default"
                  radius="sm"
                  fullWidth
                  onClick={() => {
                    onLogout();
                    closeDrawer();
                  }}
                >
                  로그아웃
                </Button>
              </Stack>
            ) : (
              <Stack gap="xs">
                <Button
                  variant="default"
                  radius="sm"
                  fullWidth
                  onClick={() => {
                    onTabChange("/login");
                    closeDrawer();
                  }}
                >
                  로그인
                </Button>
                <Button
                  color="brandYellow"
                  radius="sm"
                  fullWidth
                  onClick={() => {
                    onTabChange("/register");
                    closeDrawer();
                  }}
                >
                  회원가입
                </Button>
              </Stack>
            )}
          </Box>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
