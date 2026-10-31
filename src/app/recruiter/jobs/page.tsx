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
  Search,
  Users,
  ChevronRight,
  Clock,
  Sparkles,
  DollarSign,
  Code2,
  Layers,
  Cpu,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

import { jobService } from "@/services/job.service";
import { recruiterService } from "@/services/recruiter.service";
import { applicationService } from "@/services/application.service";
import { cleanJobTitle } from "@/lib/format";
import type { Job, JobStatus } from "@/types/job";
import type { RecruiterApplication } from "@/types/application";

function getJobTypeLabel(type: string) {
  const upper = type?.toUpperCase() || "";
  switch (upper) {
    case "INTERNSHIP":
      return { label: "Thực tập", color: "bg-blue-50 text-blue-700 border-blue-200/60" };
    case "FULL_TIME":
      return { label: "Toàn thời gian", color: "bg-violet-50 text-violet-700 border-violet-200/60" };
    case "PART_TIME":
      return { label: "Bán thời gian", color: "bg-amber-50 text-amber-700 border-amber-200/60" };
    case "REMOTE":
      return { label: "Làm từ xa (Remote)", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" };
    default:
      return { label: type || "Khác", color: "bg-slate-50 text-slate-700 border-slate-200" };
  }
}

function getJobIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("ai") || t.includes("data") || t.includes("machine")) {
    return { icon: Cpu, gradient: "from-fuchsia-500 to-pink-600" };
  }
  if (t.includes("backend") || t.includes("engineer")) {
    return { icon: Code2, gradient: "from-indigo-500 to-violet-600" };
  }
  if (t.includes("web") || t.includes("frontend") || t.includes("fullstack")) {
    return { icon: Globe, gradient: "from-sky-500 to-blue-600" };
  }
  return { icon: Briefcase, gradient: "from-purple-500 to-indigo-600" };
}

function getDaysRemaining(deadlineStr: string) {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionJobId, setActionJobId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
      applicationService.getRecruiterApplications(token).catch(() => []),
    ])
      .then(([profile, allJobs, appList]) => {
        if (!active) return;
        const companyJobs = allJobs.filter(
          (job) => job.company_id === profile.company_id,
        );
        setJobs(companyJobs);
        setApplications(appList);
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

  // Metrics
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;
  const closedJobs = jobs.filter((j) => j.status === "CLOSED").length;
  const totalApplicants = applications.length;

  const getApplicationCountForJob = (jobId: number) => {
    return applications.filter((app) => app.job_id === jobId).length;
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== "ALL" && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchLoc = job.location?.toLowerCase().includes(q);
      const matchType = job.job_type?.toLowerCase().includes(q);
      return matchTitle || matchLoc || matchType;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 mb-2 border border-violet-100">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            Tuyển dụng Doanh nghiệp
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Quản lý tin tuyển dụng
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Theo dõi, cập nhật tiến độ đăng tin và quản trị danh sách ứng viên nộp hồ sơ.
          </p>
        </div>

        <Link
          href="/recruiter/jobs/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/35 hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Đăng tin tuyển dụng mới</span>
        </Link>
      </div>

      {/* 4 Metric Stats Cards (Nimbus Work Style) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Card 1: Tổng tin */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-500/25">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng số tin
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalJobs} <span className="text-xs font-semibold text-slate-400">vị trí</span>
            </p>
          </div>
        </div>

        {/* Card 2: Đang mở */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Đang tuyển dụng
            </p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {openJobs} <span className="text-xs font-semibold text-slate-400">tin mở</span>
            </p>
          </div>
        </div>

        {/* Card 3: Đã đóng */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-sm shadow-slate-500/25">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tạm đóng / Dừng
            </p>
            <p className="text-xl font-extrabold text-slate-700 mt-0.5">
              {closedJobs} <span className="text-xs font-semibold text-slate-400">tin đóng</span>
            </p>
          </div>
        </div>

        {/* Card 4: Tổng ứng viên */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-sm shadow-pink-500/25">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hồ sơ đã nhận
            </p>
            <p className="text-xl font-extrabold text-rose-600 mt-0.5">
              {totalApplicants} <span className="text-xs font-semibold text-slate-400">ứng viên</span>
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Segmented Filter Pills */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-md inline-flex items-center gap-1.5 w-fit">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              statusFilter === "ALL"
                ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-violet-500/25 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Tất cả</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {totalJobs}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("OPEN")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              statusFilter === "OPEN"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang mở</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                statusFilter === "OPEN" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {openJobs}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("CLOSED")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              statusFilter === "CLOSED"
                ? "bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-md shadow-slate-600/25 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Đã đóng</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                statusFilter === "CLOSED" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {closedJobs}
            </span>
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo chức danh, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm backdrop-blur-md outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>

      {/* Jobs List (High-End Card Design) */}
      <section className="space-y-3.5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-sm backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="mt-3 font-bold text-slate-900">Không tìm thấy tin tuyển dụng nào</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {jobs.length === 0
                ? "Công ty của bạn chưa có tin đăng tuyển nào. Hãy tạo tin đầu tiên để tiếp cận ứng viên tài năng!"
                : "Không có vị trí tuyển dụng nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn."}
            </p>
            {jobs.length === 0 && (
              <Link
                href="/recruiter/jobs/new"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/25 hover:shadow-lg transition"
              >
                <PlusCircle className="h-4 w-4" />
                Đăng tin ngay
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const { icon: IconComponent, gradient } = getJobIcon(job.title);
              const typeBadge = getJobTypeLabel(job.job_type);
              const daysLeft = getDaysRemaining(job.deadline);
              const applicantCount = getApplicationCountForJob(job.job_id);
              const isOpen = job.status === "OPEN";

              return (
                <div
                  key={job.job_id}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Left: Job Meta & Title */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Modern Gradient Icon Box */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm shadow-violet-500/20`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-base font-extrabold text-slate-900 group-hover:text-violet-600 transition truncate">
                          {cleanJobTitle(job.title)}
                        </h2>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            isOpen
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {isOpen ? "Đang mở" : "Đã đóng"}
                        </span>

                        {/* Job Type Badge */}
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      </div>

                      {/* Info Row */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {/* Location */}
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {job.location || "Toàn quốc"}
                        </span>

                        {/* Salary if available */}
                        {job.salary && (
                          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salary}
                          </span>
                        )}

                        {/* Deadline */}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Hạn: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                          {daysLeft !== null && (
                            <span
                              className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                daysLeft > 7
                                  ? "bg-slate-100 text-slate-600"
                                  : daysLeft > 0
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã hết hạn"}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Applicants Pill & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 lg:pt-0 lg:border-t-0 shrink-0">
                    {/* Applicant Count Pill (Clickable directly to candidate list) */}
                    <Link
                      href="/recruiter/applications"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200/80 bg-violet-50/70 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 hover:border-violet-300"
                      title="Xem danh sách ứng viên"
                    >
                      <Users className="h-3.5 w-3.5 text-violet-600" />
                      <span>{applicantCount} hồ sơ</span>
                      <ChevronRight className="h-3 w-3 text-violet-400" />
                    </Link>

                    {/* Edit button */}
                    <Link
                      href={`/recruiter/jobs/${job.job_id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                      <span>Sửa</span>
                    </Link>

                    {/* Toggle status (Lock / Unlock) button */}
                    <button
                      type="button"
                      disabled={actionJobId !== null}
                      onClick={() =>
                        handleStatusChange(
                          job.job_id,
                          job.status === "OPEN" ? "CLOSED" : "OPEN",
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-sm ${
                        isOpen
                          ? "border-amber-200/80 bg-amber-50/50 text-amber-700 hover:bg-amber-100/80"
                          : "border-emerald-200/80 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/80"
                      }`}
                    >
                      {isOpen ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Đóng tin</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Mở lại</span>
                        </>
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={actionJobId !== null}
                      onClick={() => handleDelete(job.job_id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/40 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100/80 shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      <span>Xóa</span>
                    </button>
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
