"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { applicationService } from "@/services/application.service";

import type {
  ApplicationStatus,
  RecruiterApplication,
} from "@/types/application";

const statuses: ApplicationStatus[] = [
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

export default function RecruiterApplicationDetailPage() {
  const params = useParams<{
    application_id: string;
  }>();

  const applicationId = Number(params.application_id);

  const [application, setApplication] =
    useState<RecruiterApplication | null>(null);

  const [status, setStatus] =
    useState<ApplicationStatus>("APPLIED");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplication() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("You must be signed in.");
        }

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
          throw new Error("Invalid application.");
        }

        const data = await applicationService.getRecruiterApplication(
          token,
          applicationId,
        );

        if (!active) return;

        setApplication(data);
        setStatus(data.status as ApplicationStatus);
      } catch (error) {
        if (!active) return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load application.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadApplication();

    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleStatusUpdate = async () => {
    const token = localStorage.getItem("access_token");

    if (!token || !application) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const updated = await applicationService.updateStatus(
        token,
        application.application_id,
        status,
      );

      setApplication((current) =>
        current
          ? {
              ...current,
              status: updated.status,
              updated_at: updated.updated_at,
            }
          : current,
      );

      setSuccess("Application status updated successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update application status.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading application...
      </p>
    );
  }

  if (error && !application) {
    return (
      <div className="space-y-4">
        <Link
          href="/recruiter/applications"
          className="text-sm font-semibold text-amber-600"
        >
          &larr; Back to applications
        </Link>

        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section>
        <Link
          href="/recruiter/applications"
          className="text-sm font-semibold text-amber-600"
        >
          &larr; Back to applications
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-600">
              Applicant Detail
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {application.student_name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Applied for{" "}
              <span className="font-semibold text-slate-700">
                {application.job_title}
              </span>
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
              application.status,
            )}`}
          >
            {application.status}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Student Profile
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {application.student_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {application.student_email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  University
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {application.university}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Major
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {application.major}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  GPA
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {application.gpa}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Graduation Year
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {application.graduation_year}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Career Goal
              </p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {application.career_goal}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Cover Letter
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {application.cover_letter || "No cover letter provided."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">CV</h2>

            <p className="mt-2 break-words text-sm text-slate-500">
              {application.cv_file_name}
            </p>

            <Link
              href={`/recruiter/applications/${application.application_id}/cv`}
              className="mt-5 block rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              View CV
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Application Status
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Move this candidate through the recruitment process.
            </p>

            <label
              htmlFor="application-status"
              className="sr-only"
            >
              Application status
            </label>
            <select
              id="application-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ApplicationStatus);
                setError("");
                setSuccess("");
              }}
              disabled={updating}
              className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleStatusUpdate()}
              disabled={updating || status === application.status}
              className="mt-4 w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>

            {error && (
              <p role="alert" className="mt-4 text-sm text-rose-600">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="mt-4 text-sm text-emerald-600">
                {success}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Applied At
            </p>

            <p className="mt-2 text-sm font-medium text-slate-700">
              {new Date(application.applied_at).toLocaleString()}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
