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
      const parsed = ProblemDetailSchema.safeParse(error.response.data);
      if (parsed.success) {
        console.error("API Problem Detail:", parsed.data);
        return Promise.reject(parsed.data);
      }
    }
    return Promise.reject(error);
  }
);
