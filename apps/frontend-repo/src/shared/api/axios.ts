import axios from "axios";
import { ProblemDetailSchema } from "@/shared/model/problemDetail";

export const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

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
