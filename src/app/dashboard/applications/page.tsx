"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  Send,
  Layers,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import { cleanJobTitle } from "@/lib/format";
import type { StudentApplication, ApplicationStatus } from "@/types/application";

const statuses: Array<{
  key: "ALL" | ApplicationStatus;
  label: string;
  icon: typeof Layers;
  activeGradient: string;
  activeShadow: string;
}> = [
  {
    key: "ALL",
    label: "Tất cả",
    icon: Layers,
    activeGradient: "from-violet-600 via-indigo-600 to-purple-600",
    activeShadow: "shadow-violet-500/25",
  },
  {
    key: "APPLIED",
    label: "Đã nộp",
    icon: Inbox,
    activeGradient: "from-sky-500 to-blue-600",
    activeShadow: "shadow-sky-500/25",
  },
  {
    key: "REVIEWING",
    label: "Đang xem xét",
    icon: Clock,
    activeGradient: "from-amber-500 to-orange-500",
    activeShadow: "shadow-amber-500/25",
  },
  {
    key: "INTERVIEW",
    label: "Phỏng vấn",
    icon: Calendar,
    activeGradient: "from-purple-500 to-pink-600",
    activeShadow: "shadow-purple-500/25",
  },
  {
    key: "ACCEPTED",
    label: "Trúng tuyển",
    icon: CheckCircle2,
    activeGradient: "from-emerald-500 to-teal-600",
    activeShadow: "shadow-emerald-500/25",
  },
  {
    key: "REJECTED",
    label: "Từ chối",
    icon: XCircle,
    activeGradient: "from-rose-500 to-red-600",
    activeShadow: "shadow-rose-500/25",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "INTERVIEW":
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200/70",
        label: "Phỏng vấn",
        dot: "bg-purple-500",
      };
    case "REVIEWING":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200/70",
        label: "Đang xem xét",
        dot: "bg-amber-500",
      };
    case "ACCEPTED":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
        label: "Trúng tuyển",
        dot: "bg-emerald-500",
      };
    case "REJECTED":
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200/70",
        label: "Đã từ chối",
        dot: "bg-rose-500",
      };
    default:
      return {
        bg: "bg-sky-50 text-sky-700 border-sky-200/70",
        label: "Đã nộp đơn",
        dot: "bg-sky-500",
      };
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    applicationService
      .getMyApplications(token)
      .then((data) => {
        setApplications(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getCount = (key: "ALL" | ApplicationStatus) => {
    if (key === "ALL") return applications.length;
    return applications.filter((app) => app.status === key).length;
  };

  // Metrics
  const totalCount = applications.length;
  const reviewingCount = applications.filter(
    (a) => a.status === "REVIEWING" || a.status === "APPLIED",
  ).length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;

  const filteredApplications = applications.filter((app) => {
    if (activeFilter !== "ALL" && app.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = app.job_title?.toLowerCase().includes(q);
      const matchCompany = app.company_name?.toLowerCase().includes(q);
      const matchLoc = app.location?.toLowerCase().includes(q);
      return matchTitle || matchCompany || matchLoc;
    }
    return true;
  });

  return (
    <div className="space-y-7 pb-12">
      {/* Header Banner */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 mb-2 border border-violet-100">
            <Briefcase className="h-3.5 w-3.5 text-violet-600" />
            Hồ sơ tuyển dụng
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Đơn ứng tuyển của tôi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Theo dõi tiến trình xét duyệt và kết quả phản hồi trực tiếp từ nhà tuyển dụng.
          </p>
        </div>

        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/35 hover:scale-[1.02] shrink-0"
        >
          <Send className="h-4 w-4" />
          <span>Tìm thêm việc làm mới</span>
        </Link>
      </section>

      {/* 4 Metric Stats Cards (Nimbus SaaS Style) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Card 1: Tổng đơn */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-500/25">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng số đơn đã nộp
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalCount} <span className="text-xs font-semibold text-slate-400">công việc</span>
            </p>
          </div>
        </div>

        {/* Card 2: Đang xem xét */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Đang xem xét
            </p>
            <p className="text-xl font-extrabold text-amber-600 mt-0.5">
              {reviewingCount} <span className="text-xs font-semibold text-slate-400">đơn</span>
            </p>
          </div>
        </div>

        {/* Card 3: Phỏng vấn */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-sm shadow-purple-500/25">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mời phỏng vấn
            </p>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">
              {interviewCount} <span className="text-xs font-semibold text-slate-400">vòng tiếp</span>
            </p>
          </div>
        </div>

        {/* Card 4: Trúng tuyển */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trúng tuyển
            </p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {acceptedCount} <span className="text-xs font-semibold text-slate-400">thành công</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-1.5">
            {statuses.map((tab) => {
              const count = getCount(tab.key);
              const isActive = activeFilter === tab.key;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.activeGradient} text-white shadow-md ${tab.activeShadow} scale-[1.02]`
                      : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo vị trí, công ty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm backdrop-blur-md outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>

      {/* Applications List */}
      <section className="space-y-3.5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-sm backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800">Không có đơn ứng tuyển nào</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {activeFilter === "ALL"
                ? "Bạn chưa gửi hồ sơ vào vị trí nào. Hãy khám phá và nộp đơn ngay!"
                : `Không có đơn ứng tuyển nào ở trạng thái "${statuses.find((s) => s.key === activeFilter)?.label}".`}
            </p>
            {activeFilter === "ALL" && (
              <Link
                href="/dashboard/jobs"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/25 hover:shadow-lg transition"
              >
                Khám phá việc làm ngay
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const badge = getStatusBadge(app.status);
              return (
                <div
                  key={app.application_id}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-500/20">
                      <Building2 className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/jobs/${app.job_id}`}
                          className="truncate text-base font-extrabold text-slate-900 group-hover:text-violet-600 transition"
                        >
                          {cleanJobTitle(app.job_title)}
                        </Link>
                      </div>

                      <p className="mt-1 text-xs font-bold text-violet-700 truncate">
                        {app.company_name}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {app.location || "Toàn quốc"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Nộp ngày: {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-3 border-t border-slate-100 sm:pt-0 sm:border-t-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>

                    <Link
                      href={`/dashboard/jobs/${app.job_id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                    >
                      Xem việc làm
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
