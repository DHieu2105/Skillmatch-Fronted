"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { jobService } from "@/services/job.service";
import { recruiterService } from "@/services/recruiter.service";

import type { Job, JobStatus } from "@/types/job";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionJobId, setActionJobId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("access_token");

    if (!token) {
      queueMicrotask(() => {
        if (!active) return;
        setError("You must be signed in.");
        setLoading(false);
      });
      return () => { active = false; };
    }

    Promise.all([
      recruiterService.getProfile(token),
      jobService.getJobs(token),
    ])
      .then(([profile, allJobs]) => {
        if (!active) return;
        const companyJobs = allJobs.filter(
          (job) =>
            job.company_id === profile.company_id,
        );

        setJobs(companyJobs);
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : "Unable to load jobs.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

const handleStatusChange = async (
  jobId: number,
  status: JobStatus,
) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    setError("You must be signed in.");
    return;
  }

  setActionJobId(jobId);
  setError("");
  setSuccess("");

  try {
    const updatedJob =
      await jobService.updateJobStatus(
        token,
        jobId,
        status,
      );

    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.job_id === jobId
          ? updatedJob
          : job,
      ),
    );

    setSuccess(
      `Job ${status === "OPEN" ? "opened" : "closed"} successfully.`,
    );
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
    setError("You must be signed in.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this job?",
  );

  if (!confirmed) return;

  setActionJobId(jobId);
  setError("");
  setSuccess("");

  try {
    await jobService.deleteJob(token, jobId);

    setJobs((currentJobs) =>
      currentJobs.filter(
        (job) => job.job_id !== jobId,
      ),
    );

    setSuccess("Job deleted successfully.");
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    }
  } finally {
    setActionJobId(null);
  }
};

if (loading) {
  return (
    <p className="text-sm text-slate-500">
      Loading jobs...
    </p>
  );
}

return (
  <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-amber-600">
          Recruitment
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Manage Jobs
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your company job postings.
        </p>
      </div>

      <Link
        href="/recruiter/jobs/new"
        className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white"
      >
        Post a Job
      </Link>
    </div>

    {error && (
      <p role="alert" className="text-sm text-rose-600">
        {error}
      </p>
    )}

    {success && (
      <p role="status" className="text-sm text-emerald-600">
        {success}
      </p>
    )}

    {jobs.length === 0 ? !error && (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-slate-900">
          No jobs posted yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Create your first job posting.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.job_id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    {job.title}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      job.status === "OPEN"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {job.location} · {job.job_type}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Deadline: {job.deadline}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/recruiter/jobs/${job.job_id}/edit`}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  disabled={actionJobId !== null}
                  onClick={() =>
                    handleStatusChange(
                      job.job_id,
                      job.status === "OPEN"
                        ? "CLOSED"
                        : "OPEN",
                    )
                  }
                  className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600"
                >
                  {job.status === "OPEN"
                    ? "Close"
                    : "Open"}
                </button>

                <button
                  type="button"
                  disabled={actionJobId !== null}
                  onClick={() =>
                    handleDelete(job.job_id)
                  }
                  className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


}
