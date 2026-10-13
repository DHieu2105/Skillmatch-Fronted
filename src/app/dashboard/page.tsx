"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { applicationService } from "@/services/application.service";
import type { StudentApplication } from "@/types/application";
import { recommendationService } from "@/services/recommendation.service";
import type { Recommendation } from "@/types/recommendation";
import { studentService } from "@/services/student.service";
import type { ProfileCompletion } from "@/types/student";

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

export default function StudentDashboardPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompletion | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setApplicationsLoading(false);
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
          setApplicationsError(error.message);
        }
      })
      .finally(() => {
        setApplicationsLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    studentService
      .getProfileCompletion(token)
      .then((data) => {
        setProfileCompletion(data);
      })
      .catch(() => {
        setProfileCompletion(null);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setRecommendationsLoading(false);
      });
      return;
    }

    recommendationService
      .getRecommendations(token)
      .then((data) => {
        setRecommendations(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setRecommendationsError(error.message);
        }
      })
      .finally(() => {
        setRecommendationsLoading(false);
      });
  }, []);

  const recentApplications = applications.slice(0, 3);
  const topRecommendations = [...recommendations]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

    const skillGapCounts = recommendations
  .flatMap((recommendation) => recommendation.missing_skills)
  .reduce<Record<string, number>>((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {});

const skillGaps = Object.entries(skillGapCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([skill]) => skill);

  const completionPercentage = profileCompletion?.percentage ?? 0;

  const stats = [
    {
      label: "Recommended Jobs",
      value: recommendations.length.toString(),
      description: "Jobs matching your skills",
    },
    {
      label: "Applications",
      value: applications.length.toString(),
      description: "Applications submitted",
    },
    {
      label: "Profile Completion",
      value: `${completionPercentage}%`,
      description: "Complete your profile",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-violet-600">Dashboard</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here&apos;s what&apos;s happening with your job search today.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recommended Jobs
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jobs selected based on your skills and profile.
            </p>
          </div>

          <Link
            href="/dashboard/recommendations"
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            View all
          </Link>
        </div>

        {recommendationsLoading && (
          <p className="text-sm text-slate-500">
            Loading recommendations...
          </p>
        )}

        {recommendationsError && (
          <p className="text-sm text-rose-600">{recommendationsError}</p>
        )}

        {!recommendationsLoading &&
          !recommendationsError &&
          topRecommendations.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-semibold text-slate-900">
                No recommendations yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Generate recommendations to see jobs matched to your CV and
                skills.
              </p>

              <Link
                href="/dashboard/recommendations"
                className="mt-4 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                Generate recommendations
              </Link>
            </div>
          )}

        <div className="grid gap-4 xl:grid-cols-3">
          {topRecommendations.map((recommendation) => (
            <div
              key={recommendation.recommendation_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {recommendation.job_title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {recommendation.company_name}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  {Math.round(recommendation.score)}% Match
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {recommendation.location}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {recommendation.matched_skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <Link
                href={`/dashboard/jobs/${recommendation.job_id}`}
                className="mt-5 block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your latest job applications.
              </p>
            </div>

            <Link
              href="/dashboard/applications"
              className="text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              View all
            </Link>
          </div>

          {applicationsLoading && (
            <p className="py-6 text-sm text-slate-500">
              Loading applications...
            </p>
          )}

          {applicationsError && (
            <p className="py-6 text-sm text-rose-600">{applicationsError}</p>
          )}

          {!applicationsLoading &&
            !applicationsError &&
            recentApplications.length === 0 && (
              <div className="py-6">
                <p className="font-semibold text-slate-900">
                  No applications yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your recent applications will appear here.
                </p>
              </div>
            )}

          <div className="divide-y divide-slate-100">
            {!applicationsLoading &&
              !applicationsError &&
              recentApplications.map((application) => (
              <div
                key={application.application_id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/jobs/${application.job_id}`}
                    className="truncate font-semibold text-slate-900 hover:text-violet-600"
                  >
                    {application.job_title}
                  </Link>

                  <p className="mt-1 text-sm text-slate-500">
                    {application.company_name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Applied{" "}
                    {new Date(
                      application.applied_at,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    application.status,
                  )}`}
                >
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Profile Readiness
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Improve your profile to get better matches.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                Profile completion
              </span>

              <span className="text-sm font-bold text-violet-600">
                {completionPercentage}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {profileCompletion && (
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p>
                  Profile information:{" "}
                  {profileCompletion.profile_fields_completed}/
                  {profileCompletion.profile_fields_total}
                </p>
                <p>
                  CV: {profileCompletion.has_cv ? "Completed" : "Missing"}
                </p>
                <p>
                  Skills:{" "}
                  {profileCompletion.has_skills ? "Completed" : "Missing"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <p className="text-sm font-semibold text-slate-800">Skill gaps</p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Adding these skills may improve your job matches.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {recommendationsLoading ? (
                <p className="text-sm text-slate-400">
                  Loading skill gaps...
                </p>
              ) : skillGaps.length > 0 ? (
                skillGaps.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600"
                  >
                    + {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No skill gaps found.
                </p>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="mt-6 block rounded-xl bg-violet-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Complete profile
          </Link>
        </div>
      </section>
    </div>
  );
}
