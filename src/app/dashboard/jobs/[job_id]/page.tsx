"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Layers,
  Calendar,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { applicationService } from "@/services/application.service";
import { cvService } from "@/services/cv.service";
import { jobService } from "@/services/job.service";
import { cleanJobTitle } from "@/lib/format";
import type { CV } from "@/types/cv";
import type { Job } from "@/types/job";

function isJobAcceptingApplications(job: Job): boolean {
  const [year, month, day] = job.deadline
    .slice(0, 10)
    .split("-")
    .map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    job.status.trim().toUpperCase() === "OPEN" &&
    !Number.isNaN(deadline.getTime()) &&
    deadline >= today
  );
}

export default function JobDetailPage() {
  const params = useParams<{ job_id: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cvs, setCVs] = useState<CV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    const jobId = Number(params.job_id);

    if (Number.isNaN(jobId)) {
      Promise.resolve().then(() => {
        setError("Mã việc làm không hợp lệ");
        setLoading(false);
      });
      return;
    }

    jobService
      .getJobById(token, jobId)
      .then((data) => {
        setJob(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.job_id]);

  useEffect(() => {
    if (!job || !isJobAcceptingApplications(job)) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    cvService
      .getCVs(token)
      .then((data) => {
        setCVs(data);

        const defaultCV = data.find((cv) => cv.is_default);
        if (defaultCV) {
          setSelectedCVId(defaultCV.cv_id);
        } else if (data.length > 0) {
          setSelectedCVId(data[0].cv_id);
        }
      })
      .catch((error) => {
        if (error instanceof Error) {
          setApplyError(error.message);
        }
      });
  }, [job]);

  const handleApply = async () => {
    if (!job || !selectedCVId || !isJobAcceptingApplications(job)) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    setApplying(true);
    setApplyError("");
    setApplySuccess("");

    try {
      await applicationService.apply(token, {
        job_id: job.job_id,
        cv_id: selectedCVId,
        cover_letter: coverLetter,
      });

      setApplySuccess("Nộp đơn ứng tuyển thành công! Nhà tuyển dụng sẽ sớm nhận được hồ sơ của bạn.");
      setCoverLetter("");
    } catch (error) {
      if (error instanceof Error) {
        setApplyError(error.message);
      } else {
        setApplyError("Không thể nộp đơn. Vui lòng thử lại sau.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">{error || "Không tìm thấy thông tin việc làm."}</p>
        <Link
          href="/dashboard/jobs"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  const acceptingApplications = isJobAcceptingApplications(job);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Danh sách việc làm</span>
        </Link>
      </div>

      {/* Header Banner Card */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200/60">
                <Building2 className="h-3.5 w-3.5" />
                {job.company_name}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                {job.status === "OPEN" ? "Đang mở tuyển" : "Đã đóng"}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {cleanJobTitle(job.title)}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                {job.job_type}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                {job.experience_level}
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-left lg:text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mức lương</p>
            <p className="mt-1 text-xl font-extrabold text-violet-600">{job.salary}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
        {/* Job Description */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Mô tả công việc & Yêu cầu
          </h2>
          <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700 font-normal">
            {job.description}
          </div>
        </div>

        {/* Apply Section */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Send className="h-4 w-4 text-violet-600" />
              Ứng tuyển vị trí này
            </h2>

            {!acceptingApplications ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs font-semibold text-amber-700 border border-amber-200/60">
                Vị trí này đã hết hạn nhận hồ sơ hoặc tạm thời ngừng nhận ứng tuyển.
              </div>
            ) : cvs.length === 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs font-semibold text-amber-700 border border-amber-200/60">
                Bạn chưa có CV nào trong hồ sơ. Vui lòng tải CV lên trước khi ứng tuyển.
                <div className="mt-3">
                  <Link
                    href="/dashboard/cv"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Đến trang Quản lý CV
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Chọn CV ứng tuyển
                  </label>
                  <select
                    value={selectedCVId ?? ""}
                    onChange={(event) => setSelectedCVId(Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
                  >
                    {cvs.map((cv) => (
                      <option key={cv.cv_id} value={cv.cv_id}>
                        {cv.file_name} {cv.is_default ? "★ (Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Thư giới thiệu (Cover Letter - Không bắt buộc)
                  </label>
                  <textarea
                    rows={5}
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    placeholder="Giới thiệu ngắn gọn lý do bạn phù hợp với công việc này..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                {applyError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                {applySuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{applySuccess}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {acceptingApplications && cvs.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleApply}
                disabled={applying || !selectedCVId}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg disabled:opacity-50"
              >
                {applying ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Gửi hồ sơ ứng tuyển</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
