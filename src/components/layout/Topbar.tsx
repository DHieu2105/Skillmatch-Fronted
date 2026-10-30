"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-events";
import { notificationService } from "@/services/notification.service";
import {
  Bell,
  LogOut,
  Menu,
  Sparkles,
  Search,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const studentTabs = [
  { label: "Tổng quan", href: "/dashboard" },
  { label: "Gợi ý AI", href: "/dashboard/recommendations" },
  { label: "Tìm việc làm", href: "/dashboard/jobs" },
  { label: "Đơn ứng tuyển", href: "/dashboard/applications" },
  { label: "CV của tôi", href: "/dashboard/cv" },
  { label: "Kỹ năng", href: "/dashboard/skills" },
];

const recruiterTabs = [
  { label: "Tổng quan", href: "/recruiter/dashboard" },
  { label: "Tin tuyển dụng", href: "/recruiter/jobs" },
  { label: "Đơn ứng tuyển", href: "/recruiter/applications" },
  { label: "Hồ sơ công ty", href: "/recruiter/company" },
];

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const isRecruiter = user?.role === "RECRUITER";
  const tabs = isRecruiter ? recruiterTabs : studentTabs;
  const displayName = user?.full_name?.trim() || user?.email || "Tài khoản";
  const initials = (
    user?.full_name?.trim()
      ? user.full_name.trim().split(" ").pop()?.slice(0, 1)
      : user?.email?.slice(0, 1)
  )?.toUpperCase() ?? "U";

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#20083c] via-[#5c1363] via-[#7d1470] to-[#b3196b] text-white shadow-lg shadow-purple-950/20 backdrop-blur-md">
      {/* Top row */}
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
        {/* Brand logo & mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Mở menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href={isRecruiter ? "/recruiter/dashboard" : "/dashboard"}
            className="flex items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white leading-none">
                Skill<span className="text-pink-300">Match</span>
              </span>
              <span className="block text-[10px] font-medium text-white/70 tracking-wider">
                {isRecruiter ? "Doanh nghiệp & Tuyển dụng" : "Nền tảng AI sự nghiệp"}
              </span>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative mx-auto hidden max-w-md flex-1 md:block"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
            className="w-full rounded-full border border-white/20 bg-white/15 py-1.5 pl-9 pr-4 text-xs text-white placeholder-white/60 backdrop-blur-md outline-none transition hover:bg-white/20 focus:bg-white/25 focus:ring-2 focus:ring-white/30"
          />
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user?.role === "STUDENT" && (
            <button
              aria-label={
                unreadCount > 0
                  ? `${unreadCount} thông báo chưa đọc`
                  : "Thông báo"
              }
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
              onClick={() => router.push("/dashboard/notifications")}
              type="button"
              title="Thông báo"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#7d1470]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User profile pill */}
          <button
            type="button"
            onClick={() =>
              router.push(isRecruiter ? "/recruiter/company" : "/dashboard/profile")
            }
            className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-white/15 py-1 pl-1 pr-3 text-left backdrop-blur-md transition hover:bg-white/25 focus:outline-none"
            title="Xem hồ sơ cá nhân"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-white/40 shadow-sm"
              />
            ) : (
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                  isRecruiter
                    ? "bg-gradient-to-tr from-amber-400 to-orange-500"
                    : "bg-gradient-to-tr from-violet-400 to-pink-500"
                }`}
              >
                {initials}
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p
                className="max-w-[120px] truncate text-xs font-bold text-white leading-tight"
                title={user?.email ? `${displayName} (${user.email})` : displayName}
              >
                {displayName}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-white/70" />
          </button>

          {/* Logout button */}
          <button
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-rose-500 hover:text-white"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="border-t border-white/10 bg-black/10">
        <div className="mx-auto flex items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/dashboard" &&
                tab.href !== "/recruiter/dashboard" &&
                pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-white/25 text-white shadow-sm backdrop-blur-md"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
