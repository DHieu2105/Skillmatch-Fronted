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
  ArrowRight,
  Filter,
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import { cleanJobTitle } from "@/lib/format";
import type { StudentApplication } from "@/types/application";

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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

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

  const filteredApplications =
    activeFilter === "ALL"
      ? applications
      : applications.filter((app) => app.status === activeFilter);

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-2">
            <Briefcase className="h-3.5 w-3.5 text-violet-600" />
            Hồ sơ tuyển dụng
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Đơn ứng tuyển của tôi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tiến trình xét duyệt và kết quả từ các doanh nghiệp bạn đã gửi CV.
          </p>
        </div>

        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/25 hover:bg-violet-500 transition w-fit"
        >
          <Send className="h-3.5 w-3.5" />
          Tìm thêm việc làm
        </Link>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "ALL", label: "Tất cả" },
          { key: "APPLIED", label: "Đã nộp" },
          { key: "REVIEWING", label: "Đang xem xét" },
          { key: "INTERVIEW", label: "Phỏng vấn" },
          { key: "ACCEPTED", label: "Trúng tuyển" },
          { key: "REJECTED", label: "Từ chối" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === tab.key
                ? "bg-violet-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Applications List */}
      <section className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-900">Không có đơn ứng tuyển nào</h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeFilter === "ALL"
                ? "Bạn chưa gửi hồ sơ vào vị trí nào. Hãy khám phá và nộp đơn ngay!"
                : "Không có đơn ứng tuyển nào ở trạng thái này."}
            </p>
            {activeFilter === "ALL" && (
              <Link
                href="/dashboard/jobs"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
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
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/jobs/${app.job_id}`}
                        className="truncate text-base font-bold text-slate-900 hover:text-violet-600 transition"
                      >
                        {cleanJobTitle(app.job_title)}
                      </Link>
                    </div>

                    <p className="mt-0.5 text-xs font-semibold text-violet-600">
                      {app.company_name}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Nộp ngày: {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge.bg}`}>
                      {badge.label}
                    </span>

                    <Link
                      href={`/dashboard/jobs/${app.job_id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
