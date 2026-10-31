"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Calendar,
  ChevronRight,
  Award,
  AlertCircle,
  Layers,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Mail,
  Download,
  ExternalLink,
  Sparkles,
  Briefcase,
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import { cleanJobTitle } from "@/lib/format";
import type {
  RecruiterApplication,
  ApplicationStatus,
} from "@/types/application";

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
    label: "Mới nộp",
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
        label: "Mới nộp",
        dot: "bg-sky-500",
      };
  }
}

function getGpaBadge(gpa: number) {
  if (gpa >= 3.6) {
    return {
      text: "Xuất sắc",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (gpa >= 3.2) {
    return {
      text: "Giỏi",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  return {
    text: "Khá",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
  };
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadApplications() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Bạn cần đăng nhập để quản lý ứng viên.");
        const data = await applicationService.getRecruiterApplications(token);
        if (active) setApplications(data);
      } catch (error) {
        if (active)
          setError(
            error instanceof Error ? error.message : "Không thể tải hồ sơ ứng viên.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadApplications();
    return () => {
      active = false;
    };
  }, []);

  const getCount = (key: "ALL" | ApplicationStatus) => {
    if (key === "ALL") return applications.length;
    return applications.filter((app) => app.status === key).length;
  };

  // Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter(
    (a) => a.status === "APPLIED" || a.status === "REVIEWING",
  ).length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;

  const filteredApplications = applications.filter((application) => {
    if (filter !== "ALL" && application.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = application.student_name?.toLowerCase().includes(q);
      const matchJob = application.job_title?.toLowerCase().includes(q);
      const matchUniv = application.university?.toLowerCase().includes(q);
      const matchEmail = application.student_email?.toLowerCase().includes(q);
      return matchName || matchJob || matchUniv || matchEmail;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      {/* Header Banner */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 mb-2 border border-violet-100">
            <Users className="h-3.5 w-3.5 text-violet-600" />
            Tuyển dụng & Nhân sự
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Danh sách hồ sơ ứng tuyển
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Xem xét, đánh giá hồ sơ và cập nhật tiến trình tuyển dụng của từng ứng viên.
          </p>
        </div>

        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 shrink-0 w-fit"
        >
          <Briefcase className="h-4 w-4 text-violet-600" />
          <span>Quản lý tin tuyển dụng</span>
        </Link>
      </section>

      {/* 4 Metric Stats Cards (Nimbus Work SaaS Style) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Card 1: Tổng hồ sơ */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-500/25">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng hồ sơ nộp
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalCount} <span className="text-xs font-semibold text-slate-400">ứng viên</span>
            </p>
          </div>
        </div>

        {/* Card 2: Chờ xem xét */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Chờ xem xét
            </p>
            <p className="text-xl font-extrabold text-amber-600 mt-0.5">
              {pendingCount} <span className="text-xs font-semibold text-slate-400">cần duyệt</span>
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
              Lịch phỏng vấn
            </p>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">
              {interviewCount} <span className="text-xs font-semibold text-slate-400">ứng viên</span>
            </p>
          </div>
        </div>

        {/* Card 4: Trúng tuyển */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trúng tuyển
            </p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {acceptedCount} <span className="text-xs font-semibold text-slate-400">đạt chuẩn</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Modern Segmented Filter Tabs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-1.5">
            {statuses.map((status) => {
              const count = getCount(status.key);
              const isActive = filter === status.key;
              const Icon = status.icon;

              return (
                <button
                  key={status.key}
                  type="button"
                  onClick={() => setFilter(status.key)}
                  className={`group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${status.activeGradient} text-white shadow-md ${status.activeShadow} scale-[1.02]`
                      : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{status.label}</span>
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
            placeholder="Tìm ứng viên, vị trí, trường..."
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
            <h3 className="mt-3 text-sm font-bold text-slate-800">Không có hồ sơ nào</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {filter === "ALL"
                ? "Chưa có ứng viên nào nộp hồ sơ vào các vị trí tuyển dụng của công ty."
                : `Không tìm thấy hồ sơ nào ở trạng thái "${statuses.find((s) => s.key === filter)?.label}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => {
              const badge = getStatusBadge(application.status);
              const gpaInfo = getGpaBadge(application.gpa);
              const initials = application.student_name
                ? application.student_name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(-2)
                    .toUpperCase()
                : "UV";

              return (
                <div
                  key={application.application_id}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Candidate Avatar (Gradient initials) */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-violet-500/25">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      {/* Name & Status */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-base font-extrabold text-slate-900 group-hover:text-violet-600 transition truncate">
                          {application.student_name}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badge.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>

                        {application.student_email && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="h-3 w-3" />
                            {application.student_email}
                          </span>
                        )}
                      </div>

                      {/* Job Applied Pill */}
                      <p className="mt-1 text-xs font-semibold text-violet-700 truncate">
                        Vị trí ứng tuyển: <span className="font-bold">{cleanJobTitle(application.job_title)}</span>
                      </p>

                      {/* Academic & Date Meta */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                          {application.university} · {application.major}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                          GPA: <strong className="text-slate-800">{application.gpa}</strong>
                          <span
                            className={`rounded-md border px-1.5 py-0.2 text-[10px] font-bold ${gpaInfo.badgeClass}`}
                          >
                            {gpaInfo.text}
                          </span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          Nộp ngày: {new Date(application.applied_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 lg:pt-0 lg:border-t-0 shrink-0">
                    {/* Quick View CV button if url available */}
                    {application.cv_file_url && (
                      <a
                        href={application.cv_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                        title="Mở CV ứng viên"
                      >
                        <FileText className="h-3.5 w-3.5 text-violet-500" />
                        <span>Xem CV</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    )}

                    {/* Full Profile View */}
                    <Link
                      href={`/recruiter/applications/${application.application_id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition hover:shadow-lg hover:shadow-violet-600/35 hover:scale-[1.02] shrink-0"
                    >
                      <span>Chi tiết hồ sơ</span>
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
