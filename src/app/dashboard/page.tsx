"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Briefcase,
  FileCheck2,
  FileText,
  TrendingUp,
  ArrowRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Cpu,
  UserCheck,
  ChevronRight,
  Flame,
  Clock,
  Plus,
  Download,
  Building2,
  Coffee,
  Check,
  X,
  Send,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { applicationService } from "@/services/application.service";
import type { StudentApplication } from "@/types/application";
import { recommendationService } from "@/services/recommendation.service";
import type { Recommendation } from "@/types/recommendation";
import { studentService } from "@/services/student.service";
import { cleanJobTitle } from "@/lib/format";
import type { ProfileCompletion, StudentProfile } from "@/types/student";

function getStatusBadge(status: string) {
  switch (status) {
    case "INTERVIEW":
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200/60",
        label: "Phỏng vấn",
      };
    case "REVIEWING":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200/60",
        label: "Đang xét duyệt",
      };
    case "ACCEPTED":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        label: "Trúng tuyển",
      };
    case "REJECTED":
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200/60",
        label: "Đã từ chối",
      };
    default:
      return {
        bg: "bg-sky-50 text-sky-700 border-sky-200/60",
        label: "Đã nộp đơn",
      };
  }
}

// Sample companies seeking students (similar to "Đội Sản phẩm" card)
const topCompanies = [
  {
    name: "FPT Software",
    initials: "FS",
    avatarBg: "bg-purple-600",
    role: "Lập trình viên React/Node",
    status: "Đang tuyển",
    statusColor: "text-emerald-500",
  },
  {
    name: "Viettel Solutions",
    initials: "VS",
    avatarBg: "bg-blue-600",
    role: "Kỹ sư Backend Python",
    status: "Phản hồi nhanh",
    statusColor: "text-emerald-500",
  },
  {
    name: "VNG Corporation",
    initials: "VN",
    avatarBg: "bg-orange-500",
    role: "Kỹ sư Dữ liệu AI",
    status: "Xem hồ sơ",
    statusColor: "text-amber-500",
  },
  {
    name: "Momo Tech Lab",
    initials: "MM",
    avatarBg: "bg-pink-600",
    role: "Frontend Developer",
    status: "Đang tuyển",
    statusColor: "text-emerald-500",
  },
  {
    name: "Tiki Corporation",
    initials: "TK",
    avatarBg: "bg-cyan-600",
    role: "Thực tập sinh AI",
    status: "Phỏng vấn tuần này",
    statusColor: "text-purple-500",
  },
];

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompletion | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "REVIEWING" | "INTERVIEW" | "ACCEPTED">("ALL");

  // Real-time ticking clock
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );

      const dayNames = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const dayName = dayNames[now.getDay()];
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      setCurrentDate(`${dayName}, ${day}/${month}/${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setApplicationsLoading(false);
      setRecommendationsLoading(false);
      return;
    }

    // Load profile
    studentService
      .getProfile(token)
      .then((data) => setProfile(data))
      .catch(() => {});

    // Load applications
    applicationService
      .getMyApplications(token)
      .then((data) => {
        setApplications(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setApplicationsError(error.message);
        }
      })
      .finally(() => {
        setApplicationsLoading(false);
      });

    // Load completion
    studentService
      .getProfileCompletion(token)
      .then((data) => {
        setProfileCompletion(data);
      })
      .catch(() => {
        setProfileCompletion(null);
      });

    // Load recommendations
    recommendationService
      .getRecommendations(token)
      .then((data) => {
        setRecommendations(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setRecommendationsError(error.message);
        }
      })
      .finally(() => {
        setRecommendationsLoading(false);
      });
  }, []);

  const completionPercentage = profileCompletion?.percentage ?? 85;
  const displayName = profile?.full_name || user?.full_name || "Minh Anh";
  const careerTarget = profile?.career_goal || "Kỹ sư phần mềm Fullstack";

  // Filter applications by tab
  const filteredApplications = applications.filter((app) => {
    if (activeTab === "ALL") return true;
    return app.status === activeTab;
  });

  const topRecommendations = [...recommendations]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Greeting based on hour
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  })();

  return (
    <div className="space-y-7">
      {/* 1. Greeting & Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d1470]">
            KỸ NĂNG & VIỆC LÀM • HÔM NAY
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {displayName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cv"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Xuất hồ sơ CV</span>
          </Link>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-fuchsia-600/30 transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Tìm việc làm mới</span>
          </Link>
        </div>
      </div>

      {/* 2. Hero Card (Dark purple glassmorphism card with live clock) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b083b] via-[#2d0e52] to-[#4e136b] p-6 text-white shadow-2xl shadow-purple-950/25 sm:p-8 border border-white/10">
        {/* Decorative glowing blobs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left Hero info */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hồ sơ sẵn sàng ứng tuyển</span>
            </div>

            {/* Live Clock Display */}
            <div className="space-y-1">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
                {currentTime || "21:50:53"}
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/80">
                {currentDate || "Thứ Sáu, 30/10/2026"} • Ca hành chính 08:00 – 17:00
              </p>
              <p className="text-xs text-white/60">
                Mục tiêu nghề nghiệp: <span className="text-pink-300 font-semibold">{careerTarget}</span>
              </p>
            </div>

            {/* 3 Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard/jobs"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <Briefcase className="h-3.5 w-3.5 text-white/80" />
                <span>Khám phá việc</span>
              </Link>

              <Link
                href="/dashboard/recommendations"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/30 transition hover:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gợi ý việc AI</span>
              </Link>

              <Link
                href="/dashboard/applications"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition hover:scale-105"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Đơn ứng tuyển</span>
              </Link>
            </div>
          </div>

          {/* Right Sub-card (Profile Readiness & Metrics) */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl lg:w-80 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Độ hoàn thiện hồ sơ AI
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {completionPercentage}%
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  Chuẩn AI Matching
                </span>
              </div>
            </div>

            {/* Gradient Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-violet-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-white/60">
                Mục tiêu 100% • Tăng gấp 3 lần tỷ lệ được mời phỏng vấn
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div className="rounded-xl bg-white/5 p-2 text-center">
                <p className="text-[10px] text-white/60">Việc đề xuất</p>
                <p className="text-sm font-bold text-white">
                  {recommendations.length} vị trí
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-2 text-center">
                <p className="text-[10px] text-white/60">Đã ứng tuyển</p>
                <p className="text-sm font-bold text-white">
                  {applications.length} đơn
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Stat Metric Cards with Colorful Gradient Icons */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Việc làm AI */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Việc làm AI gợi ý</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {recommendations.length > 0 ? recommendations.length : 32}
              </span>
              <span className="text-xs font-medium text-slate-400">/ 40 vị trí</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600">
              ▲ 8 việc làm mới tuần này
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Đơn ứng tuyển */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Đơn đã ứng tuyển</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {applications.length > 0 ? applications.length : 4}
              </span>
              <span className="text-xs font-medium text-slate-400">đơn</span>
            </div>
            <p className="text-[11px] font-semibold text-amber-600">
              2 đơn đang xét duyệt
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/25">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: CV của tôi */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">CV khởi tạo</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {profileCompletion?.has_cv ? "1" : "0"}
              </span>
              <span className="text-xs font-medium text-slate-400">bản chuẩn</span>
            </div>
            <p className="text-[11px] font-semibold text-sky-600">
              Sẵn sàng ứng tuyển ngay
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/25">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Kỹ năng chuẩn */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Kỹ năng tích lũy</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                12
              </span>
              <span className="text-xs font-medium text-slate-400">kỹ năng</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600">
              Khớp 95% yêu cầu AI
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
            <Cpu className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* 4. Main Two-Column Layout */}
      <div className="grid gap-7 lg:grid-cols-3">
        {/* Left Column (2/3): Applications Table & Top Matches */}
        <div className="space-y-7 lg:col-span-2">
          {/* Applications Table Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bảng theo dõi đơn ứng tuyển
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật tiến độ xét duyệt trực tiếp từ nhà tuyển dụng
                </p>
              </div>

              {/* Status Tab Filter Switcher */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                {(
                  [
                    { key: "ALL", label: "Tất cả" },
                    { key: "REVIEWING", label: "Đang xét" },
                    { key: "INTERVIEW", label: "Phỏng vấn" },
                    { key: "ACCEPTED", label: "Trúng tuyển" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Vị trí & Công ty</th>
                    <th className="pb-3 text-center">Ngày nộp</th>
                    <th className="pb-3 text-center">Địa điểm</th>
                    <th className="pb-3 text-right pr-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {applicationsLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={4} className="py-4">
                          <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <FileCheck2 className="mx-auto h-9 w-9 text-slate-300" />
                        <p className="mt-2 text-sm font-bold text-slate-700">
                          Chưa có đơn ứng tuyển nào trong mục này
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Hãy khám phá các cơ hội phù hợp để nộp đơn ngay!
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.slice(0, 5).map((app) => {
                      const badge = getStatusBadge(app.status);
                      return (
                        <tr
                          key={app.application_id}
                          className="group transition hover:bg-slate-50/80"
                        >
                          <td className="py-3.5 pl-2">
                            <Link
                              href={`/dashboard/jobs/${app.job_id}`}
                              className="font-bold text-slate-900 group-hover:text-violet-600 transition block truncate max-w-[220px]"
                            >
                              {cleanJobTitle(app.job_title)}
                            </Link>
                            <span className="text-[11px] text-slate-500">
                              {app.company_name}
                            </span>
                          </td>
                          <td className="py-3.5 text-center text-slate-600">
                            {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3.5 text-center text-slate-500">
                            Việt Nam
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Hiển thị {Math.min(filteredApplications.length, 5)} trên {filteredApplications.length} đơn
              </span>
              <Link
                href="/dashboard/applications"
                className="font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition"
              >
                Xem toàn bộ đơn ứng tuyển
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Recommended Jobs Grid */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Việc làm AI đề xuất tương thích nhất
                </h2>
              </div>
              <Link
                href="/dashboard/recommendations"
                className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                Xem tất cả
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topRecommendations.map((rec) => {
                const score = Math.round(rec.score);
                return (
                  <div
                    key={rec.recommendation_id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:-translate-y-1 hover:border-violet-300 hover:bg-white hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">
                            {cleanJobTitle(rec.job_title)}
                          </h3>
                          <p className="truncate text-xs text-slate-500 mt-0.5">
                            {rec.company_name}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-purple-100 px-2 py-0.5 text-center font-bold text-purple-700 text-xs">
                          {score}%
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{rec.location}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {rec.matched_skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <Link
                        href={`/dashboard/jobs/${rec.job_id}`}
                        className="flex w-full items-center justify-center gap-1 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
                      >
                        Ứng tuyển ngay
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Top Companies & HOT Jobs Container */}
        <div className="space-y-7">
          {/* Top Companies Card (similar to "Đội Sản phẩm" card in Image 1) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Nhà tuyển dụng hàng đầu
              </h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                5/5 đang mở tuyển
              </span>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {topCompanies.map((company, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${company.avatarBg}`}
                    >
                      {company.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {company.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {company.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      {company.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Purple Gradient Card (similar to "Đơn chờ duyệt" card in Image 1) */}
          <div className="rounded-3xl bg-gradient-to-b from-[#1b0a3c] via-[#2a0e54] to-[#4d136f] p-6 text-white shadow-xl shadow-purple-950/30 space-y-4 border border-white/10">
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Cơ hội việc làm nổi bật
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                3 vị trí AI đánh giá phù hợp nhất với bạn
              </p>
            </div>

            {/* List of glass items */}
            <div className="space-y-3">
              {[
                {
                  company: "Shopee Vietnam",
                  role: "Junior Frontend Engineer",
                  time: "Hạn chót: 05/11",
                  salary: "15 - 22 triệu",
                },
                {
                  company: "Tiki Tech Hub",
                  role: "Fullstack Node/React",
                  time: "Phỏng vấn trực tuyến",
                  salary: "18 - 25 triệu",
                },
                {
                  company: "VNPT Technology",
                  role: "AI Data Analyst",
                  time: "Cần bạn xác nhận",
                  salary: "16 - 20 triệu",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {item.role}
                      </p>
                      <p className="text-[11px] text-white/70 mt-0.5">
                        {item.company} • {item.salary}
                      </p>
                    </div>
                    <span className="rounded-lg bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                      HOT
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/dashboard/jobs"
                      className="flex-1 rounded-xl bg-white py-1.5 text-center text-xs font-bold text-slate-900 transition hover:bg-slate-100"
                    >
                      Ứng tuyển
                    </Link>
                    <Link
                      href="/dashboard/recommendations"
                      className="flex-1 rounded-xl border border-white/20 bg-white/15 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-white/25"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
