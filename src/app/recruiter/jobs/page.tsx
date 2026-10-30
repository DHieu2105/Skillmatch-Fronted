"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Calendar,
  Edit3,
  Lock,
  Unlock,
  Trash2,
  Building2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { jobService } from "@/services/job.service";
import { recruiterService } from "@/services/recruiter.service";
import { cleanJobTitle } from "@/lib/format";
import type { Job, JobStatus } from "@/types/job";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionJobId, setActionJobId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("access_token");

    if (!token) {
      queueMicrotask(() => {
        if (!active) return;
        setError("Bạn cần đăng nhập để xem danh sách tin tuyển dụng.");
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }

    Promise.all([
      recruiterService.getProfile(token),
      jobService.getJobs(token),
    ])
      .then(([profile, allJobs]) => {
        if (!active) return;
        const companyJobs = allJobs.filter(
          (job) => job.company_id === profile.company_id,
        );
        setJobs(companyJobs);
      })
      .catch((error) => {
        if (active)
          setError(error instanceof Error ? error.message : "Không thể tải danh sách tin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (jobId: number, status: JobStatus) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn cần đăng nhập.");
      return;
    }

    setActionJobId(jobId);
    setError("");
    setSuccess("");

    try {
      const updatedJob = await jobService.updateJobStatus(token, jobId, status);
      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.job_id === jobId ? updatedJob : job)),
      );
      setSuccess(`Đã ${status === "OPEN" ? "mở lại" : "đóng"} tin tuyển dụng thành công.`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setActionJobId(null);
    }
  };

  const handleDelete = async (jobId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn cần đăng nhập.");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tin tuyển dụng này?");
    if (!confirmed) return;

    setActionJobId(jobId);
    setError("");
    setSuccess("");

    try {
      await jobService.deleteJob(token, jobId);
      setJobs((currentJobs) => currentJobs.filter((job) => job.job_id !== jobId));
      setSuccess("Đã xóa tin tuyển dụng thành công.");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setActionJobId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
            <Briefcase className="h-3.5 w-3.5 text-amber-600" />
            Tuyển dụng
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Quản lý tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tình trạng và cập nhật các vị trí đang tuyển của công ty.
          </p>
        </div>

        <Link
          href="/recruiter/jobs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/25 hover:shadow-lg transition w-fit"
        >
          <PlusCircle className="h-4 w-4" />
          Đăng tin mới
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Jobs list */}
      <section className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-900">Chưa có tin tuyển dụng nào</h3>
            <p className="mt-1 text-sm text-slate-500">
              Hãy tạo tin đăng tuyển đầu tiên để bắt đầu tiếp cận hàng ngàn ứng viên tiềm năng!
            </p>
            <Link
              href="/recruiter/jobs/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Đăng tin tuyển dụng ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {cleanJobTitle(job.title)}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        job.status === "OPEN"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {job.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location} · {job.job_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/recruiter/jobs/${job.job_id}/edit`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Sửa
                  </Link>

                  <button
                    type="button"
                    disabled={actionJobId !== null}
                    onClick={() =>
                      handleStatusChange(
                        job.job_id,
                        job.status === "OPEN" ? "CLOSED" : "OPEN",
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition"
                  >
                    {job.status === "OPEN" ? (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        Đóng tin
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        Mở lại
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={actionJobId !== null}
                    onClick={() => handleDelete(job.job_id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
