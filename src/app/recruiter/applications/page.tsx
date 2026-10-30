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
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import { cleanJobTitle } from "@/lib/format";
import type {
  RecruiterApplication,
  ApplicationStatus,
} from "@/types/application";

const statuses: Array<{ key: "ALL" | ApplicationStatus; label: string }> = [
  { key: "ALL", label: "Tất cả" },
  { key: "APPLIED", label: "Mới nộp" },
  { key: "REVIEWING", label: "Đang xem xét" },
  { key: "INTERVIEW", label: "Phỏng vấn" },
  { key: "ACCEPTED", label: "Trúng tuyển" },
  { key: "REJECTED", label: "Từ chối" },
];

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
        label: "Mới nộp",
      };
  }
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
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

  const filteredApplications =
    filter === "ALL"
      ? applications
      : applications.filter((application) => application.status === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <section>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
          <Users className="h-3.5 w-3.5 text-amber-600" />
          Quản lý ứng viên
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Danh sách hồ sơ ứng tuyển
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xem xét, cập nhật trạng thái tuyển dụng và tải CV của các ứng viên nộp vào công ty.
        </p>
      </section>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((status) => (
          <button
            key={status.key}
            type="button"
            onClick={() => setFilter(status.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === status.key
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
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
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-900">Không có hồ sơ nào</h3>
            <p className="mt-1 text-sm text-slate-500">
              {filter === "ALL"
                ? "Chưa có ứng viên nào nộp hồ sơ vào các vị trí tuyển dụng của công ty."
                : "Không có hồ sơ ứng viên nào ở trạng thái này."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => {
              const badge = getStatusBadge(application.status);
              return (
                <div
                  key={application.application_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-slate-900 truncate">
                        {application.student_name}
                      </h2>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-amber-600 truncate">
                      Vị trí: {cleanJobTitle(application.job_title)}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {application.university} · {application.major}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        GPA: {application.gpa} (Tốt nghiệp {application.graduation_year})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(application.applied_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/recruiter/applications/${application.application_id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 shrink-0 w-fit"
                  >
                    <span>Xem hồ sơ</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
