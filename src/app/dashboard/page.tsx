"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Briefcase,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Cpu,
  UserCheck,
  ChevronRight,
  Flame,
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import type { StudentApplication } from "@/types/application";
import { recommendationService } from "@/services/recommendation.service";
import type { Recommendation } from "@/types/recommendation";
import { studentService } from "@/services/student.service";
import { cleanJobTitle } from "@/lib/format";
import type { ProfileCompletion } from "@/types/student";

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

export default function StudentDashboardPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompletion | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setApplicationsLoading(false);
      return;
    }

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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    studentService
      .getProfileCompletion(token)
      .then((data) => {
        setProfileCompletion(data);
      })
      .catch(() => {
        setProfileCompletion(null);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setRecommendationsLoading(false);
      return;
    }

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

  const recentApplications = applications.slice(0, 4);
  const topRecommendations = [...recommendations]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const skillGapCounts = recommendations
    .flatMap((recommendation) => recommendation.missing_skills)
    .reduce<Record<string, number>>((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const skillGaps = Object.entries(skillGapCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  const completionPercentage = profileCompletion?.percentage ?? 0;

  const stats = [
    {
      label: "Việc làm AI gợi ý",
      value: recommendations.length.toString(),
      description: "Phù hợp với bộ kỹ năng",
      icon: Sparkles,
      color: "from-violet-600 to-indigo-600",
      accentBg: "bg-violet-50 text-violet-600",
    },
    {
      label: "Đơn đã nộp",
      value: applications.length.toString(),
      description: "Cơ hội đang theo dõi",
      icon: Briefcase,
      color: "from-blue-600 to-cyan-600",
      accentBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Độ hoàn thiện hồ sơ",
      value: `${completionPercentage}%`,
      description: "Càng cao đối sánh càng chuẩn",
      icon: TrendingUp,
      color: "from-emerald-600 to-teal-600",
      accentBg: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17152d] via-[#1f1b42] to-[#2b2460] p-6 text-white shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 -mb-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>SkillMatch Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Khám phá công việc lý tưởng của bạn
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              Hệ thống AI tự động phân tích hồ sơ và liên tục tìm kiếm các cơ hội việc làm phù hợp nhất với năng lực của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 hover:shadow-violet-600/40"
            >
              <Sparkles className="h-4 w-4" />
              Xem gợi ý AI
            </Link>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Tìm tất cả việc làm
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accentBg}`}>
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

      {/* Recommended Jobs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Việc làm phù hợp nhất
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 border border-violet-200/60">
                <Flame className="h-3.5 w-3.5 text-violet-600" />
                Top matches
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các vị trí được chấm điểm độ tương thích cao nhất với bạn
            </p>
          </div>

          <Link
            href="/dashboard/recommendations"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recommendationsLoading && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200/60" />
            ))}
          </div>
        )}

        {recommendationsError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {recommendationsError}
          </div>
        )}

        {!recommendationsLoading && !recommendationsError && topRecommendations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-3 font-semibold text-slate-900">Chưa có dữ liệu gợi ý</p>
            <p className="mt-1 text-sm text-slate-500">
              Hãy bấm tạo gợi ý để AI bắt đầu quét và phân tích việc làm phù hợp cho bạn.
            </p>
            <Link
              href="/dashboard/recommendations"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition"
            >
              Bắt đầu gợi ý ngay
            </Link>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {topRecommendations.map((recommendation) => {
            const score = Math.round(recommendation.score);
            return (
              <div
                key={recommendation.recommendation_id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {cleanJobTitle(recommendation.job_title)}
                      </h3>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
                        {recommendation.company_name}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-emerald-50 px-2.5 py-1 text-center font-bold text-emerald-700 border border-emerald-200/60">
                      <span className="text-sm">{score}%</span>
                      <span className="block text-[9px] uppercase tracking-wider font-semibold text-emerald-600">match</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{recommendation.location}</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Kỹ năng khớp
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendation.matched_skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {recommendation.matched_skills.length > 3 && (
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                          +{recommendation.matched_skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    href={`/dashboard/jobs/${recommendation.job_id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-violet-600 hover:text-white hover:border-violet-600"
                  >
                    Xem chi tiết & Ứng tuyển
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Recent Applications & Profile Readiness */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent Applications */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Đơn ứng tuyển gần đây</h2>
              <p className="mt-0.5 text-xs text-slate-500">Theo dõi trạng thái phản hồi từ công ty</p>
            </div>
            <Link
              href="/dashboard/applications"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              Xem tất cả
            </Link>
          </div>

          {applicationsLoading && (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}

          {applicationsError && (
            <p className="py-6 text-sm text-rose-600">{applicationsError}</p>
          )}

          {!applicationsLoading && !applicationsError && recentApplications.length === 0 && (
            <div className="py-10 text-center">
              <FileCheck2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có đơn ứng tuyển nào</p>
              <p className="mt-1 text-xs text-slate-400">
                Hãy khám phá các cơ hội phù hợp và nộp đơn ngay hôm nay!
              </p>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {!applicationsLoading &&
              !applicationsError &&
              recentApplications.map((application) => {
                const badge = getStatusBadge(application.status);
                return (
                  <div
                    key={application.application_id}
                    className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-50/50 -mx-2 px-2 rounded-xl"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/jobs/${application.job_id}`}
                        className="truncate text-sm font-bold text-slate-900 hover:text-violet-600 transition block"
                      >
                        {cleanJobTitle(application.job_title)}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{application.company_name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Nộp ngày: {new Date(application.applied_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Profile Readiness & Skill Gaps */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Độ hoàn thiện hồ sơ</h2>
                <p className="mt-0.5 text-xs text-slate-500">Giúp nhà tuyển dụng chú ý hơn</p>
              </div>
              <span className="text-base font-extrabold text-violet-600">
                {completionPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              {profileCompletion && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Thông tin</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      {profileCompletion.profile_fields_completed}/{profileCompletion.profile_fields_total}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">CV</p>
                    <p className={`mt-1 text-xs font-bold ${profileCompletion.has_cv ? "text-emerald-600" : "text-amber-600"}`}>
                      {profileCompletion.has_cv ? "Đã tải lên" : "Thiếu"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Kỹ năng</p>
                    <p className={`mt-1 text-xs font-bold ${profileCompletion.has_skills ? "text-emerald-600" : "text-amber-600"}`}>
                      {profileCompletion.has_skills ? "Đã thêm" : "Thiếu"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Skill Gaps */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-bold text-slate-800">Kỹ năng nên bổ sung</p>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Học hoặc thêm các kỹ năng này vào CV sẽ tăng tỷ lệ match với nhà tuyển dụng:
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {recommendationsLoading ? (
                  <p className="text-xs text-slate-400">Đang phân tích kỹ năng...</p>
                ) : skillGaps.length > 0 ? (
                  skillGaps.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60"
                    >
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Hồ sơ đã bao phủ đầy đủ các kỹ năng chính!</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4">
            <Link
              href="/dashboard/profile"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg"
            >
              <UserCheck className="h-4 w-4" />
              Hoàn thiện hồ sơ ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
