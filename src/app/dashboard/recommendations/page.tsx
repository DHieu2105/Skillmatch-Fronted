"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  BrainCircuit,
} from "lucide-react";

import { recommendationService } from "@/services/recommendation.service";
import { cleanJobTitle } from "@/lib/format";
import type { Recommendation } from "@/types/recommendation";

function getScoreStyle(score: number) {
  if (score >= 80) {
    return {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      bar: "from-emerald-500 to-teal-500",
      label: "Rất phù hợp (Strong match)",
    };
  }

  if (score >= 60) {
    return {
      badge: "bg-violet-50 text-violet-700 border-violet-200/60",
      bar: "from-violet-500 to-indigo-500",
      label: "Khá phù hợp (Good match)",
    };
  }

  return {
    badge: "bg-amber-50 text-amber-700 border-amber-200/60",
    bar: "from-amber-500 to-orange-500",
    label: "Tiềm năng (Potential match)",
  };
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    recommendationService
      .getRecommendations(token)
      .then((data) => {
        setRecommendations(data);
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

  const handleGenerate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setGenerating(true);
    setError("");

    try {
      const data = await recommendationService.generateRecommendations(token);
      setRecommendations(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      </div>
    );
  }

  const topMatchScore =
    recommendations.length > 0
      ? Math.round(Math.max(...recommendations.map(({ score }) => score)))
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* AI Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17152d] via-[#211a43] to-[#2c2055] px-6 py-8 text-white shadow-xl shadow-slate-900/5 sm:px-8 sm:py-10">
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>AI Job Matchmaker</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Cơ hội nghề nghiệp dành riêng cho bạn
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              Mô hình AI đối soát hồ sơ, kỹ năng của bạn với yêu cầu nhà tuyển dụng để tìm ra những công việc có tỷ lệ trúng tuyển cao nhất.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 hover:shadow-violet-600/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Đang phân tích..." : "Làm mới gợi ý AI"}</span>
          </button>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng vị trí khớp</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            {recommendations.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Dựa trên CV & Kỹ năng của bạn</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Độ tương thích cao nhất</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 tracking-tight">
            {recommendations.length > 0 ? `${topMatchScore}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Tỷ lệ tương thích lý tưởng</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thuật toán đối soát</p>
          <p className="mt-2 truncate text-base font-bold text-slate-900">
            {recommendations[0]?.matching_method || "Cosine Similarity AI"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Được cá nhân hóa theo từng ứng viên</p>
        </div>
      </section>

      {/* Header section */}
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Danh sách việc làm đề xuất
          </h2>
          <p className="text-sm text-slate-500">
            Sắp xếp theo thứ tự độ tương đồng kỹ năng giảm dần
          </p>
        </div>

        {recommendations.length > 0 && (
          <span className="text-xs font-semibold text-slate-400">
            Tìm thấy {recommendations.length} vị trí
          </span>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !error && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <BrainCircuit className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900 text-lg">Chưa có gợi ý việc làm</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            Hãy bấm nút &quot;Làm mới gợi ý AI&quot; ở trên để hệ thống quét dữ liệu và so khớp công việc phù hợp với bạn.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
          >
            <Sparkles className="h-4 w-4" />
            Tạo gợi ý việc làm ngay
          </button>
        </section>
      )}

      {/* Recommendations Grid */}
      <section className="grid gap-5 lg:grid-cols-2">
        {recommendations.map((recommendation) => {
          const style = getScoreStyle(recommendation.score);
          const score = Math.round(recommendation.score);

          return (
            <div
              key={recommendation.recommendation_id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {cleanJobTitle(recommendation.job_title)}
                    </h3>
                    <p className="mt-0.5 text-sm font-semibold text-violet-600">
                      {recommendation.company_name}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{recommendation.location}</span>
                    </div>
                  </div>

                  <div className={`shrink-0 rounded-2xl border px-3.5 py-2 text-center ${style.badge}`}>
                    <p className="text-xl font-black">{score}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Tương thích</p>
                  </div>
                </div>

                {/* Compatibility progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                    <span>Mức độ đáp ứng yêu cầu</span>
                    <span>{style.label}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    />
                  </div>
                </div>

                {/* Reason description */}
                {recommendation.reason && (
                  <p className="mt-4 text-xs leading-relaxed text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">Lý do gợi ý:</span> {recommendation.reason}
                  </p>
                )}

                {/* Matched Skills */}
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Kỹ năng đã đáp ứng
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.matched_skills.length > 0 ? (
                      recommendation.matched_skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Chưa ghi nhận kỹ năng khớp.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Kỹ năng cần trau dồi thêm
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.missing_skills.length > 0 ? (
                      recommendation.missing_skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/50"
                        >
                          + {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Đã đáp ứng toàn bộ kỹ năng yêu cầu!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {recommendation.matched_skills.length} kỹ năng khớp
                </span>
                <Link
                  href={`/dashboard/jobs/${recommendation.job_id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                  Xem chi tiết & Nộp đơn
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
