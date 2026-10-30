"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Users,
  Clock,
  UserCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Building2,
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import { jobService } from "@/services/job.service";
import { recruiterService } from "@/services/recruiter.service";
import { cleanJobTitle } from "@/lib/format";

import type { RecruiterApplication } from "@/types/application";
import type { Job } from "@/types/job";

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
        label: "Đang xem xét",
      };
    case "ACCEPTED":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        label: "Đã tuyển",
      };
    case "REJECTED":
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200/60",
        label: "Đã từ chối",
      };
    default:
      return {
        bg: "bg-sky-50 text-sky-700 border-sky-200/60",
        label: "Mới nộp",
      };
  }
}

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        }

        const [profile, allJobs, recruiterApplications] = await Promise.all([
          recruiterService.getProfile(token),
          jobService.getJobs(token),
          applicationService.getRecruiterApplications(token),
        ]);

        if (!active) return;

        setJobs(allJobs.filter((job) => job.company_id === profile.company_id));
        setApplications(recruiterApplications);
      } catch (error) {
        if (!active) return;

        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải bảng điều khiển tuyển dụng.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.status === "OPEN").length;
    const reviewing = applications.filter(
      (application) => application.status === "REVIEWING",
    ).length;
    const interviews = applications.filter(
      (application) => application.status === "INTERVIEW",
    ).length;

    return [
      {
        label: "Tin đang mở tuyển",
        value: activeJobs,
        description: "Đang nhận hồ sơ ứng tuyển",
        icon: Briefcase,
        color: "text-amber-600 bg-amber-50",
      },
      {
        label: "Tổng số ứng viên",
        value: applications.length,
        description: "Hồ sơ trên tất cả tin đăng",
        icon: Users,
        color: "text-blue-600 bg-blue-50",
      },
      {
        label: "Đang xem xét",
        value: reviewing,
        description: "Ứng viên đang chờ duyệt",
        icon: Clock,
        color: "text-violet-600 bg-violet-50",
      },
      {
        label: "Vòng phỏng vấn",
        value: interviews,
        description: "Ứng viên vào phỏng vấn",
        icon: UserCheck,
        color: "text-emerald-600 bg-emerald-50",
      },
    ];
  }, [jobs, applications]);

  const recentApplicants = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime(),
        )
        .slice(0, 4),
    [applications],
  );

  const recentJobs = useMemo(
    () =>
      [...jobs]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4),
    [jobs],
  );

  const reviewedCount = applications.filter(
    (application) => application.status !== "APPLIED",
  ).length;
  const reviewedRate =
    applications.length === 0
      ? 0
      : Math.round((reviewedCount / applications.length) * 100);

  const interviewCount = applications.filter(
    (application) =>
      application.status === "INTERVIEW" || application.status === "ACCEPTED",
  ).length;
  const interviewRate =
    applications.length === 0
      ? 0
      : Math.round((interviewCount / applications.length) * 100);

  const getApplicantCount = (jobId: number) =>
    applications.filter((application) => application.job_id === jobId).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="font-bold text-lg">Thông báo lỗi</h2>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Recruiter Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17152d] via-[#211a3d] to-[#2c2045] p-6 text-white shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Hệ thống tuyển dụng thông minh</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Chào mừng trở lại! 👋
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              Theo dõi và quản lý toàn bộ các chiến dịch tuyển dụng, tiếp nhận hồ sơ ứng viên và đưa ra quyết định nhanh chóng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-xl hover:shadow-amber-500/30"
            >
              <PlusCircle className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Link>
            <Link
              href="/recruiter/company"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Building2 className="h-4 w-4" />
              Hồ sơ công ty
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
            </div>
          );
        })}
      </section>

      {/* Recent Applicants */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ứng viên mới nhất</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Các ứng viên vừa ứng tuyển vào các vị trí công ty đang tuyển
            </p>
          </div>

          <Link
            href="/recruiter/applications"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
          >
            Xem tất cả
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="py-10 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có ứng viên nào</p>
            <p className="mt-1 text-xs text-slate-400">
              Các hồ sơ ứng tuyển từ sinh viên sẽ xuất hiện tại đây khi họ nộp đơn.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentApplicants.map((applicant) => {
              const badge = getStatusBadge(applicant.status);
              return (
                <Link
                  key={applicant.application_id}
                  href={`/recruiter/applications/${applicant.application_id}`}
                  className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-50/50 -mx-2 px-2 rounded-xl group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">
                      {applicant.student_name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      Ứng tuyển: <span className="font-semibold text-slate-700">{cleanJobTitle(applicant.job_title)}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(applicant.applied_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge.bg}`}>
                    {badge.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Lower Row: Recent Jobs & Recruitment Funnel */}
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent Jobs */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tin tuyển dụng gần đây</h2>
              <p className="mt-0.5 text-xs text-slate-500">Các vị trí bạn vừa đăng tải</p>
            </div>
            <Link
              href="/recruiter/jobs"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Xem tất cả
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="py-8 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có tin tuyển dụng nào</p>
              <Link
                href="/recruiter/jobs/new"
                className="mt-3 inline-block text-xs font-semibold text-amber-600 hover:underline"
              >
                + Đăng tin tuyển dụng đầu tiên
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <div
                  key={job.job_id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/recruiter/jobs/${job.job_id}/edit`}
                      className="font-bold text-sm text-slate-900 hover:text-amber-600 transition block truncate"
                    >
                      {cleanJobTitle(job.title)}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {getApplicantCount(job.job_id)} hồ sơ ứng tuyển · {job.location}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      job.status === "OPEN"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {job.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recruitment Funnel Performance */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hiệu quả xử lý</h2>
                <p className="mt-0.5 text-xs text-slate-500">Tốc độ & tỷ lệ phản hồi ứng viên</p>
              </div>
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Đã xem xét hồ sơ</span>
                  <span className="text-amber-600 font-bold">{reviewedRate}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${reviewedRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Tỷ lệ vào phỏng vấn</span>
                  <span className="text-violet-600 font-bold">{interviewRate}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                    style={{ width: `${interviewRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <Link
              href="/recruiter/jobs/new"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              Đăng tin tuyển dụng mới
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
