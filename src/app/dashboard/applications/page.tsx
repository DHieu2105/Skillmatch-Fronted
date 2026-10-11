"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { applicationService } from "@/services/application.service";
import type { StudentApplication } from "@/types/application";

function getStatusStyle(status: string) {
  switch (status) {
    case "REVIEWING":
      return "bg-amber-50 text-amber-600";

    case "INTERVIEW":
      return "bg-violet-50 text-violet-600";

    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-600";

    case "REJECTED":
      return "bg-rose-50 text-rose-600";

    default:
      return "bg-sky-50 text-sky-600";
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
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

    applicationService
      .getMyApplications(token)
      .then((data) => {
        setApplications(data);
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

  if (loading) {
    return <p className="text-sm text-slate-500">Loading applications...</p>;
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Job Applications
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Applications
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track the status of jobs you have applied for.
        </p>
      </section>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {applications.length === 0 && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="font-bold text-slate-900">No applications yet</h2>

          <p className="mt-2 text-sm text-slate-500">
            Explore available jobs and submit your first application.
          </p>

          <Link
            href="/dashboard/jobs"
            className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Find Jobs
          </Link>
        </section>
      )}

      <section className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.application_id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/dashboard/jobs/${application.job_id}`}
                  className="text-lg font-bold text-slate-900 hover:text-violet-600"
                >
                  {application.job_title}
                </Link>

                <p className="mt-1 font-medium text-violet-600">
                  {application.company_name}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {application.location}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Applied{" "}
                  {new Date(application.applied_at).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  application.status,
                )}`}
              >
                {application.status}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
