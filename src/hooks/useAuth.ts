"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { studentService } from "@/services/student.service";
import { recruiterService } from "@/services/recruiter.service";
import { USER_UPDATED_EVENT } from "@/lib/auth-events";
import type { CurrentUser } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe(token);

      // If full_name is not in getMe response, try loading from student or recruiter profile
      let fullName = userData.full_name;
      if (!fullName) {
        try {
          if (userData.role === "STUDENT") {
            const profile = await studentService.getProfile(token);
            fullName = profile.full_name;
          } else if (userData.role === "RECRUITER") {
            const profile = await recruiterService.getProfile(token);
            fullName = profile.full_name;
          }
        } catch {
          // Profile not yet created
        }
      }

      setUser({
        ...userData,
        full_name: fullName || userData.full_name,
      });
    } catch {
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();

    window.addEventListener(USER_UPDATED_EVENT, fetchUser);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, fetchUser);
    };
  }, [fetchUser]);

  return {
    user,
    loading,
    refetch: fetchUser,
  };
}
