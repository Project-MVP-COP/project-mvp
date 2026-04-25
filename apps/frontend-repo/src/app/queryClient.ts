import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "@/shared/ui/toast";
import { api } from "@/shared/api/axios";

const globalErrorHandler = (error: unknown) => {
  // 중복 토스트 방지를 위해 처리 완료 플래그 확인
  if (error && typeof error === "object" && (error as any).__handled) {
    return;
  }

  // error 객체가 RFC 9457 규격(detail, title) 또는 원본 AxiosError(message)를 포함하는지 확인
  const err = error as { detail?: string; title?: string; message?: string; __handled?: boolean };
  const errorMessage = err.detail || err.title || err.message || "An unexpected error occurred";
  
  toast.error(errorMessage);

  // 처리 완료 플래그 설정
  if (error && typeof error === "object") {
    (error as any).__handled = true;
  }
};

// Axios 인터셉터를 통한 전역 에러 처리 (React Router Action 등 TanStack Query 외부 호출 대응)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    globalErrorHandler(error);
    return Promise.reject(error);
  }
);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: globalErrorHandler,
  }),
  mutationCache: new MutationCache({
    onError: globalErrorHandler,
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});
