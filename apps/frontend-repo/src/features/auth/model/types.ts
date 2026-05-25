import { z } from "zod";
import { 
  LoginRequest as GeneratedLoginRequest,
  RegisterRequest as GeneratedRegisterRequest,
  AuthResponse as GeneratedAuthResponse,
  UserResponse as GeneratedUserResponse
} from "./generated";

export type LoginRequest = z.infer<typeof GeneratedLoginRequest>;
export type RegisterRequest = z.infer<typeof GeneratedRegisterRequest>;
export type AuthResponse = z.infer<typeof GeneratedAuthResponse>;
export type UserResponse = z.infer<typeof GeneratedUserResponse>;

export { GeneratedLoginRequest, GeneratedRegisterRequest, GeneratedAuthResponse, GeneratedUserResponse };
