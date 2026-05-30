import { z } from "zod";
import { GeneratedRegisterRequest } from "./types";

/**
 * 회원 가입 폼 유효성 검사 스키마
 * 백엔드 계약 스키마(RegisterRequest)에 비밀번호 일치 확인(confirmPassword) 필드를 확장합니다.
 */
export const RegisterFormSchema = GeneratedRegisterRequest.extend({
  confirmPassword: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export type RegisterFormInput = z.infer<typeof RegisterFormSchema>;
export { GeneratedRegisterRequest as RegisterRequestSchema };
export { GeneratedLoginRequest as LoginRequestSchema } from "./types";
