"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Sparkles,
  FileText,
  Cpu,
  User,
  Bell,
  ArrowUpRight,
} from "lucide-react";

const navigation = [
  { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tìm việc làm", href: "/dashboard/jobs", icon: Search },
  { label: "Đơn ứng tuyển", href: "/dashboard/applications", icon: Briefcase },
  { label: "Gợi ý AI", href: "/dashboard/recommendations", icon: Sparkles, badge: "AI" },
  { label: "CV của tôi", href: "/dashboard/cv", icon: FileText },
  { label: "Kỹ năng", href: "/dashboard/skills", icon: Cpu },
  { label: "Thông báo", href: "/dashboard/notifications", icon: Bell },
];

export default function StudentSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-[#110e28] px-4 py-6 text-white border-r border-slate-800/40">
      {/* Brand logo */}
      <Link
        className="mb-8 flex items-center gap-3 px-3 transition-opacity hover:opacity-90"
        href="/dashboard"
        onClick={onNavigate}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white block leading-none">
            Skill<span className="text-violet-400">Match</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Student Portal
          </span>
        </div>
      </Link>

      {/* Navigation Group */}
      <div className="mb-2 px-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Không gian làm việc
        </p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40 font-semibold"
                  : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-violet-300"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="rounded-full bg-violet-400/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-400/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pro recommendation card */}
      <div className="mt-auto pt-4 border-t border-white/[0.08] space-y-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/60 to-indigo-950/60 p-4 border border-violet-500/20 shadow-inner">
          <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            AI Career Booster
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            Cập nhật CV & kỹ năng để AI đối soát việc làm chính xác hơn 90%.
          </p>
          <Link
            href="/dashboard/recommendations"
            onClick={onNavigate}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white transition"
          >
            Khám phá ngay <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <Link
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:text-white transition"
          href="/dashboard/profile"
          onClick={onNavigate}
        >
          <User className="h-4 w-4 text-slate-400" />
          <span>Hồ sơ của tôi</span>
        </Link>
      </div>
    </aside>
  );
}
