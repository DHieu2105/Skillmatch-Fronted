"use client";

import { useEffect, useState } from "react";

import { jobService } from "@/services/job.service";
import type { Job } from "@/types/job";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const openJobs = jobs.filter((job) => job.status === "OPEN");

  if (loading) {
    return <p className="text-sm text-slate-500">Loading jobs...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-violet-600">Opportunities</p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">Find Jobs</h1>

        <p className="mt-2 text-sm text-slate-500">
          Explore opportunities that match your career goals.
        </p>
      </section>

      <section className="grid gap-4">
        {openJobs.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-semibold text-slate-900">
              No open jobs found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              New opportunities will appear here when recruiters post them.
            </p>
          </div>
        )}

        {openJobs.map((job) => (
          <div
            key={job.job_id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>

            <p className="mt-1 text-sm font-medium text-violet-600">
              {job.company_name}
            </p>

            <p className="mt-2 text-sm text-slate-500">{job.location}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                {job.job_type}
              </span>

              <span className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                {job.experience_level}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-600">{job.salary}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
