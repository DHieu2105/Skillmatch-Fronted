"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function RoleGuard({
  children,
  allowedRole,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== allowedRole) {
      if (user.role === "STUDENT") {
        router.replace("/dashboard");
      }

      if (user.role === "RECRUITER") {
        router.replace("/recruiter/dashboard");
      }
    }
  }, [user, loading, allowedRole, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}