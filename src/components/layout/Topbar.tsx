"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-events";
import { notificationService } from "@/services/notification.service";
import { Bell, LogOut, Menu, Sparkles, User, ShieldCheck } from "lucide-react";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const initials = user?.email?.slice(0, 1).toUpperCase() ?? "U";

  useEffect(() => {
    if (user?.role !== "STUDENT") return;

    let active = true;

    const loadUnreadCount = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const notifications = await notificationService.getNotifications(token);
        if (active) {
          setUnreadCount(
            notifications.filter((notification) => !notification.is_read).length
          );
        }
      } catch {
        if (active) setUnreadCount(0);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadUnreadCount();
      }
    };

    void loadUnreadCount();
    const refreshInterval = window.setInterval(loadUnreadCount, 60_000);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    window.addEventListener("focus", loadUnreadCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
      window.removeEventListener("focus", loadUnreadCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.role]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.replace("/auth/login");
  }

  const isRecruiter = user?.role === "RECRUITER";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/80 px-5 backdrop-blur-xl transition-all sm:px-8">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Mở menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            AI-Driven Job Platform
          </span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user?.role === "STUDENT" && (
          <button
            aria-label={
              unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Thông báo"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            onClick={() => router.push("/dashboard/notifications")}
            type="button"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile info */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${
              isRecruiter
                ? "bg-gradient-to-tr from-amber-500 to-orange-400 shadow-amber-500/20"
                : "bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-violet-500/20"
            }`}
          >
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900 leading-tight">
              {user?.email ?? "Tài khoản"}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isRecruiter
                    ? "bg-amber-50 text-amber-700"
                    : "bg-violet-50 text-violet-700"
                }`}
              >
                <ShieldCheck className="h-2.5 w-2.5" />
                {isRecruiter ? "Nhà tuyển dụng" : "Sinh viên"}
              </span>
            </div>
          </div>

          <button
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
