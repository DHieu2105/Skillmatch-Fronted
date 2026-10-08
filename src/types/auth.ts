export type UserRole = "STUDENT" | "RECRUITER";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  user_id: number;
  email: string;
  role: UserRole;
  status: string;
  auth_provider?: string;
  has_password?: boolean;
}