"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Layers,
  RotateCcw,
  Sparkles,
  ArrowRight,
  DollarSign,
  Building2,
  Calendar,
} from "lucide-react";

import { jobService } from "@/services/job.service";
import { cleanJobTitle } from "@/lib/format";
import type { Job } from "@/types/job";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    jobService
      .getJobs(token)
      .then((data) => {
        setJobs(data);
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

  const handleSearch = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setSearching(true);
    setError("");

    try {
      const data = await jobService.searchJobs(token, {
        title,
        location,
        job_type: jobType,
        experience_level: experienceLevel,
      });

      setJobs(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleReset = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setTitle("");
    setLocation("");
    setJobType("");
    setExperienceLevel("");
    setSearching(true);
    setError("");

    try {
      const data = await jobService.getJobs(token);
      setJobs(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSearching(false);
    }
  };

  const openJobs = jobs.filter((job) => {
    if (job.status !== "OPEN") {
      return false;
    }

    const [year, month, day] = job.deadline
      .slice(0, 10)
      .split("-")
      .map(Number);
    const deadline = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deadline >= today;
  });

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            Cơ hội nghề nghiệp
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Tìm kiếm việc làm
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Khám phá các vị trí tuyển dụng mới nhất phù hợp với kỹ năng và định hướng của bạn.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Hiện có <span className="font-bold text-violet-600">{openJobs.length}</span> vị trí đang tuyển
        </div>
      </section>

      {/* Advanced Filter Box */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Title */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Chức danh, từ khóa..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Địa điểm (Hà Nội, TP.HCM...)"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />
          </div>

          {/* Job Type */}
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={jobType}
              onChange={(event) => setJobType(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            >
              <option value="">Tất cả hình thức</option>
              <option value="FULL_TIME">Toàn thời gian (Full-time)</option>
              <option value="PART_TIME">Bán thời gian (Part-time)</option>
              <option value="INTERNSHIP">Thực tập sinh (Internship)</option>
              <option value="REMOTE">Làm việc từ xa (Remote)</option>
            </select>
          </div>

          {/* Experience */}
          <div className="relative">
            <Layers className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={experienceLevel}
              onChange={(event) => setExperienceLevel(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            >
              <option value="">Tất cả cấp bậc</option>
              <option value="ENTRY_LEVEL">Mới tốt nghiệp / Entry level</option>
              <option value="JUNIOR">Junior (1-2 năm)</option>
              <option value="MID_LEVEL">Mid-level (2-4 năm)</option>
              <option value="SENIOR">Senior (4+ năm)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            disabled={searching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Đặt lại bộ lọc
          </button>

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500 hover:shadow-lg disabled:opacity-50"
          >
            <Search className="h-3.5 w-3.5" />
            {searching ? "Đang tìm kiếm..." : "Tìm việc ngay"}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Jobs Listing */}
      <section className="space-y-4">
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        )}

        {!loading && openJobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-900">Không tìm thấy vị trí tuyển dụng phù hợp</h3>
            <p className="mt-1 text-sm text-slate-500">
              Hãy thử thay đổi tiêu chí lọc hoặc quay lại sau khi nhà tuyển dụng đăng tin mới.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {openJobs.map((job) => (
            <div
              key={job.job_id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {cleanJobTitle(job.title)}
                    </h2>
                    <p className="mt-0.5 text-sm font-semibold text-violet-600">
                      {job.company_name}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                    Đang tuyển
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">{job.salary}</span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {job.job_type}
                  </span>
                  <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    {job.experience_level}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>Hạn: {new Date(job.deadline).toLocaleDateString("vi-VN")}</span>
                </div>

                <Link
                  href={`/dashboard/jobs/${job.job_id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                  Xem chi tiết
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
