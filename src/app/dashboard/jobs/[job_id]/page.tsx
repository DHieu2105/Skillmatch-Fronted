"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { applicationService } from "@/services/application.service";
import { cvService } from "@/services/cv.service";
import { jobService } from "@/services/job.service";
import type { CV } from "@/types/cv";
import type { Job } from "@/types/job";

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
        setError("Invalid job ID");
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
  }, []);

  const handleApply = async () => {
    if (!job || !selectedCVId) return;

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

      setApplySuccess("Application submitted successfully.");
      setCoverLetter("");
    } catch (error) {
      if (error instanceof Error) {
        setApplyError(error.message);
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading job details...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-600">{error}</p>

        <Link
          href="/dashboard/jobs"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return <p className="text-sm text-slate-500">Job not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/jobs"
        className="inline-flex text-sm font-semibold text-violet-600 hover:text-violet-700"
      >
        ← Back to jobs
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              {job.company_name}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {job.title}
            </h1>

            <p className="mt-3 text-sm text-slate-500">{job.location}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                {job.job_type}
              </span>

              <span className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                {job.experience_level}
              </span>

              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {job.status}
              </span>
            </div>
          </div>

          <div className="lg:text-right">
            <p className="text-sm text-slate-500">Salary</p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {job.salary}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Job Description</h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {job.description}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Job Information</h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Location
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {job.location}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Job Type
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {job.job_type}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Experience Level
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {job.experience_level}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Deadline
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {new Date(job.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Apply for this job
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Choose your CV and add an optional cover letter.
        </p>

        {cvs.length === 0 ? (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            You do not have a CV yet. Upload a CV before applying.
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                CV
              </label>

              <select
                value={selectedCVId ?? ""}
                onChange={(event) =>
                  setSelectedCVId(Number(event.target.value))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
              >
                {cvs.map((cv) => (
                  <option key={cv.cv_id} value={cv.cv_id}>
                    {cv.file_name}
                    {cv.is_default ? " (Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cover Letter
              </label>

              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                rows={6}
                placeholder="Tell the recruiter why you are a good fit..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
              />
            </div>

            {applyError && (
              <p className="text-sm text-rose-600">{applyError}</p>
            )}

            {applySuccess && (
              <p className="text-sm text-emerald-600">{applySuccess}</p>
            )}

            <button
              type="button"
              onClick={handleApply}
              disabled={applying || !selectedCVId}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applying ? "Applying..." : "Apply Now"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
