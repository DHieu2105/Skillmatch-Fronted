"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    authService
      .getMe(token)
      .then((user) => {
        if (user.role === "STUDENT") {
          router.replace("/dashboard");
        } else if (user.role === "RECRUITER") {
          router.replace("/recruiter/dashboard");
        } else {
          router.replace("/auth/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        router.replace("/auth/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fc]">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-600/30">
            <Sparkles className="h-6 w-6 text-white animate-spin" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Skill<span className="text-violet-600">Match</span>
          </span>
        </div>
        <div className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-600" />
        </div>
      </div>
    );
  }

  return null;
}
