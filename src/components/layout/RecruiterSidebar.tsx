"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Building2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const navigation = [
  { label: "Tổng quan", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Đăng tin tuyển dụng", href: "/recruiter/jobs/new", icon: PlusCircle, isAction: true },
  { label: "Quản lý tin đăng", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Hồ sơ ứng viên", href: "/recruiter/applications", icon: Users },
];

export default function RecruiterSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-[#131127] px-4 py-6 text-white border-r border-slate-800/40">
      {/* Brand logo */}
      <Link
        className="mb-8 flex items-center gap-3 px-3 transition-opacity hover:opacity-90"
        href="/recruiter/dashboard"
        onClick={onNavigate}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white block leading-none">
            Skill<span className="text-amber-400">Match</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Nhà tuyển dụng
          </span>
        </div>
      </Link>

      <div className="mb-2 px-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Tuyển dụng & Tìm tài năng
        </p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/recruiter/dashboard" && pathname.startsWith(`${item.href}/`));

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="group my-2 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.12] text-amber-300 font-semibold shadow-inner border border-amber-400/20"
                  : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                  active ? "text-amber-400" : "text-slate-400 group-hover:text-amber-300"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Link */}
      <div className="mt-auto pt-4 border-t border-white/[0.08] space-y-1">
        <Link
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:text-white transition"
          href="/recruiter/company"
          onClick={onNavigate}
        >
          <Building2 className="h-4 w-4 text-slate-400" />
          <span>Hồ sơ công ty</span>
        </Link>
      </div>
    </aside>
  );
}
