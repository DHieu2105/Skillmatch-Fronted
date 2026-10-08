"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import type { CurrentUser } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe(token)
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    user,
    loading,
  };
}