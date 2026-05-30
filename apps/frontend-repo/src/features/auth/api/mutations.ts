import { api } from "@/shared/api/axios";
import type { LoginRequest, RegisterRequest, AuthResponse, UserResponse } from "../model/types";

/**
 * 회원 가입 API Fetcher
 */
export const registerUser = async (payload: RegisterRequest): Promise<UserResponse> => {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
};

/**
 * 로그인 API Fetcher
 */
export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
};

/**
 * 본인 상세 정보 조회 API Fetcher
 */
export const fetchCurrentUser = async (): Promise<UserResponse> => {
  const { data } = await api.get("/api/user/me");
  return data;
};

/**
 * 회원 탈퇴 API Fetcher
 */
export const deleteCurrentUser = async (): Promise<void> => {
  await api.delete("/api/user");
};
