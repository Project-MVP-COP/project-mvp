import axios from "axios";
import { ProblemDetailSchema } from "@/shared/model/problemDetail";

export const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 모든 API 요청 시 로컬 스토리지에서 토큰을 직접 추출하여 Authorization 헤더에 자동 탑재 (FSD 순환 의존 방지)
api.interceptors.request.use(
  (config) => {
    const storageStr = typeof window !== "undefined" ? localStorage.getItem("app-storage") : null;
    if (storageStr) {
      try {
        const parsed = JSON.parse(storageStr);
        const token = parsed?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to parse app-storage for token injection:", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      // RFC 9457 표준 에러 처리
      const parsed = ProblemDetailSchema.safeParse(error.response.data);
      if (parsed.success) {
        return Promise.reject(parsed.data); // 파싱된 RFC 9457 객체만 던짐
      }
    }
    
    return Promise.reject(error);
  }
);

