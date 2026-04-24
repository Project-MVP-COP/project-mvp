import { create } from 'zustand';

/**
 * 앱 전체를 아우르는 단일 스토어 (Zustand)
 * 
 * [권장 사항] "가능한 한 Zustand 스토어를 비우세요."
 * 
 * Zustand 사용 원칙:
 * 1. API 응답 데이터: 100% TanStack Query에 위임 (습관적인 dispatch 금지)
 * 2. 컴포넌트 내부 상태: useState / useReducer 사용
 * 3. URL 상태 (검색, 필터 등): React Router의 Query Parameter 사용
 * 4. 위 케이스에 해당하지 않는 '순수 UI/UX용 휘발성 데이터'만 이 곳에 관리합니다.
 */

interface AppState {
  // 예: 사이드바 및 모달 등의 레이아웃 상태
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // 예: 사용자 환경 설정 (서버 저장이 필요 없는 로컬 설정)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // 예: 휘발성 알림 상태
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
