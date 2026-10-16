"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { applicationService } from "@/services/application.service";
import { jobService } from "@/services/job.service";
import { recruiterService } from "@/services/recruiter.service";

import type { RecruiterApplication } from "@/types/application";
import type { Job } from "@/types/job";

function getStatusStyle(status: string) {
  switch (status) {
    case "INTERVIEW":
      return "bg-violet-50 text-violet-600";

    case "REVIEWING":
      return "bg-amber-50 text-amber-600";

    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-600";

    case "REJECTED":
      return "bg-rose-50 text-rose-600";

    default:
      return "bg-sky-50 text-sky-600";
  }
}

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] =
    useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("You must be signed in.");
        }

        const [profile, allJobs, recruiterApplications] = await Promise.all([
          recruiterService.getProfile(token),
          jobService.getJobs(token),
          applicationService.getRecruiterApplications(token),
        ]);

        if (!active) return;

        setJobs(
          allJobs.filter((job) => job.company_id === profile.company_id),
        );
        setApplications(recruiterApplications);
      } catch (error) {
        if (!active) return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load recruiter dashboard.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.status === "OPEN").length;
    const reviewing = applications.filter(
      (application) => application.status === "REVIEWING",
    ).length;
    const interviews = applications.filter(
      (application) => application.status === "INTERVIEW",
    ).length;

    return [
      {
        label: "Active Jobs",
        value: activeJobs,
        description: "Currently accepting applications",
      },
      {
        label: "Total Applicants",
        value: applications.length,
        description: "Across all job posts",
      },
      {
        label: "Reviewing",
        value: reviewing,
        description: "Applications under review",
      },
      {
        label: "Interviews",
        value: interviews,
        description: "Candidates in interview stage",
      },
    ];
  }, [jobs, applications]);

  const recentApplicants = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.applied_at).getTime() -
            new Date(a.applied_at).getTime(),
        )
        .slice(0, 3),
    [applications],
  );

  const recentJobs = useMemo(
    () =>
      [...jobs]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 3),
    [jobs],
  );

  const reviewedCount = applications.filter(
    (application) => application.status !== "APPLIED",
  ).length;
  const reviewedRate =
    applications.length === 0
      ? 0
      : Math.round((reviewedCount / applications.length) * 100);

  const interviewCount = applications.filter(
    (application) =>
      application.status === "INTERVIEW" ||
      application.status === "ACCEPTED",
  ).length;
  const interviewRate =
    applications.length === 0
      ? 0
      : Math.round((interviewCount / applications.length) * 100);

  const getApplicantCount = (jobId: number) =>
    applications.filter((application) => application.job_id === jobId).length;

  if (loading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Recruiter Dashboard
        </h1>
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-amber-600">
          Recruiter Dashboard
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back 👋
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your job posts and keep track of your candidates.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>

            <p className="mt-2 text-sm text-slate-400">{stat.description}</p>
          </div>
        ))}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Applicants
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest candidates applying to your jobs.
            </p>
          </div>

          <Link
            href="/recruiter/applications"
            className="shrink-0 text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            View all
          </Link>
        </div>

        {recentApplicants.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            No applications yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentApplicants.map((applicant) => (
              <Link
                key={applicant.application_id}
                href={`/recruiter/applications/${applicant.application_id}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {applicant.student_name}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {applicant.job_title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Applied {new Date(applicant.applied_at).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    applicant.status,
                  )}`}
                >
                  {applicant.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Job Posts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of your latest job postings.
              </p>
            </div>

            <Link
              href="/recruiter/jobs"
              className="shrink-0 text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              View all
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No job posts yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <div
                  key={job.job_id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/recruiter/jobs/${job.job_id}/edit`}
                      className="font-semibold text-slate-900 hover:text-amber-600"
                    >
                      {job.title}
                    </Link>

                    <p className="mt-1 text-sm text-slate-500">
                      {getApplicantCount(job.job_id)} applicants
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      job.status === "OPEN"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Job Performance</h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your recruitment activity.
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Applications reviewed</span>

                <span className="font-bold text-amber-600">
                  {reviewedRate}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${reviewedRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Interview rate</span>

                <span className="font-bold text-violet-600">
                  {interviewRate}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${interviewRate}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/recruiter/jobs/new"
            className="mt-8 block rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Post a new job
          </Link>
        </div>
      </section>
    </div>
  );
}
