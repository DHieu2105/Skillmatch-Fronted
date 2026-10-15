"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { applicationService } from "@/services/application.service";

import type {
  RecruiterApplication,
  ApplicationStatus,
} from "@/types/application";

const statuses: Array<"ALL" | ApplicationStatus> = [
  "ALL",
  "APPLIED",
  "REVIEWING",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];

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

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] =
    useState<RecruiterApplication[]>([]);

  const [filter, setFilter] =
    useState<"ALL" | ApplicationStatus>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadApplications() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("You must be signed in.");
        const data = await applicationService.getRecruiterApplications(token);
        if (active) setApplications(data);
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Unable to load applications.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadApplications();
    return () => { active = false; };
  }, []);

  const filteredApplications =
    filter === "ALL"
      ? applications
      : applications.filter(
          (application) =>
            application.status === filter,
        );

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading applications...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-semibold text-amber-600">
          Recruitment
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Applications
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review candidates who applied to your jobs.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            aria-pressed={filter === status}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              filter === status
                ? "bg-amber-500 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}

      {filteredApplications.length === 0 &&
      !error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-slate-900">
            No applications found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Applications from candidates will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(
            (application) => (
              <div
                key={application.application_id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        {application.student_name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          application.status,
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-amber-600">
                      {application.job_title}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {application.university} ·{" "}
                      {application.major}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      GPA: {application.gpa} · Graduation{" "}
                      {application.graduation_year}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Applied{" "}
                      {new Date(
                        application.applied_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href={`/recruiter/applications/${application.application_id}`}
                    className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    View Application
                  </Link>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
