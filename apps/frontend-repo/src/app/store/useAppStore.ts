import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  colorScheme: "light" | "dark";
  setColorScheme: (colorScheme: "light" | "dark") => void;
  toggleColorScheme: () => void;
  // 인증(Auth) 관련 전역 상태 추가
  accessToken: string | null;
  nickname: string | null;
  isAuthenticated: boolean;
  setSession: (accessToken: string, nickname: string) => void;
  clearSession: () => void;
}

/**
 * 전역 UI 및 인증 상태 스토어
 * 테마 모드 및 사용자 인증 세션 정보를 관리하며 로컬 스토리지에 영속화합니다.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      colorScheme: "light",
      setColorScheme: (colorScheme) => set({ colorScheme }),
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === "dark" ? "light" : "dark",
        })),
      
      // 인증 초기 상태 및 액션 구현
      accessToken: null,
      nickname: null,
      isAuthenticated: false,
      setSession: (accessToken, nickname) =>
        set({ accessToken, nickname, isAuthenticated: true }),
      clearSession: () =>
        set({ accessToken: null, nickname: null, isAuthenticated: false }),
    }),
    {
      name: "app-storage",
    }
  )
);

