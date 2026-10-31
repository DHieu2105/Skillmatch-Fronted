import { apiFetch } from "@/lib/api";

import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  CurrentUser,
} from "@/types/auth";

export const authService = {
  login(data: LoginRequest) {
    return apiFetch<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register(data: RegisterRequest) {
    return apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe(token: string) {
    return apiFetch<CurrentUser>("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  uploadAvatar(token: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch<{ avatar_url: string; message: string }>("/api/v1/auth/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  forgotPassword(email: string) {
    return apiFetch<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, new_password: string) {
    return apiFetch<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    });
  },

  googleLogin(credential: string, role?: string) {
    return apiFetch<TokenResponse>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential, role }),
    });
  },
};
