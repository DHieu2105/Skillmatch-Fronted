"use client";

import { useEffect, useState } from "react";

import { jobService } from "@/services/job.service";
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

  const openJobs = jobs.filter((job) => job.status === "OPEN");

  if (loading) {
    return <p className="text-sm text-slate-500">Loading jobs...</p>;
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Search job title..."
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
          />

          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
          />

          <input
            type="text"
            value={jobType}
            onChange={(event) => setJobType(event.target.value)}
            placeholder="Job type"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
          />

          <input
            type="text"
            value={experienceLevel}
            onChange={(event) => setExperienceLevel(event.target.value)}
            placeholder="Experience level"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? "Searching..." : "Search Jobs"}
          </button>
        </div>
      </section>

      {error && <p className="text-sm text-rose-600">{error}</p>}

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
