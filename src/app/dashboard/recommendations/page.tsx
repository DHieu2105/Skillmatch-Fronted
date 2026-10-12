"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { recommendationService } from "@/services/recommendation.service";
import type { Recommendation } from "@/types/recommendation";

function getScoreStyle(score: number) {
  if (score >= 80) {
    return {
      badge: "bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-500",
      label: "Strong match",
    };
  }

  if (score >= 60) {
    return {
      badge: "bg-violet-50 text-violet-700",
      bar: "bg-violet-500",
      label: "Good match",
    };
  }

  return {
    badge: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
    label: "Potential match",
  };
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
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
          setError(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    setGenerating(true);
    setError("");

    try {
      const data =
        await recommendationService.generateRecommendations(token);

      setRecommendations(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-label="Loading recommendations">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              className="h-24 animate-pulse rounded-2xl bg-slate-200/70"
              key={item}
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#17152d] px-6 py-7 text-white shadow-xl shadow-violet-950/10 sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-violet-300">
              AI-powered matching
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Find your next opportunity
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Discover roles selected for your experience, skills, and career
              goals.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="shrink-0 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? "Finding matches..." : "Refresh recommendations"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total matches</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {recommendations.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Based on your profile</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Top match</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {recommendations.length > 0
              ? `${Math.round(Math.max(...recommendations.map(({ score }) => score)))}%`
              : "-"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Highest compatibility</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Matching method</p>
          <p className="mt-2 truncate text-lg font-bold text-slate-900">
            {recommendations[0]?.matching_method || "AI analysis"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Personalized for you</p>
        </div>
      </section>

      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Recommended for you
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Jobs ranked by how well they fit your profile.
          </p>
        </div>
        {recommendations.length > 0 && (
          <p className="text-sm font-medium text-slate-400">
            {recommendations.length} {recommendations.length === 1 ? "role" : "roles"} found
          </p>
        )}
      </section>

      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}

      {recommendations.length === 0 && !error && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
            AI
          </div>
          <h2 className="mt-5 font-bold text-slate-900">
            No recommendations yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Generate recommendations to find jobs that match your CV and
            skills.
          </p>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.recommendation_id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">
                  {recommendation.job_title}
                </h2>

                <p className="mt-1 text-sm font-semibold text-violet-600">
                  {recommendation.company_name}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {recommendation.location}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {recommendation.reason}
                </p>
              </div>

              <div className={`shrink-0 rounded-xl px-3 py-2 text-center ${getScoreStyle(recommendation.score).badge}`}>
                <p className="text-xl font-bold">
                  {Math.round(recommendation.score)}%
                </p>
                <p className="text-[11px] font-semibold">match</p>
              </div>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${getScoreStyle(recommendation.score).bar}`}
                style={{ width: `${Math.min(100, Math.max(0, recommendation.score))}%` }}
              />
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Matched Skills
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.matched_skills.length > 0 ? (
                  recommendation.matched_skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No matched skills.</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Missing Skills
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.missing_skills.length > 0 ? (
                  recommendation.missing_skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No missing skills.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <span className="text-xs font-semibold text-slate-400">
                {getScoreStyle(recommendation.score).label}
              </span>
              <Link
                href={`/dashboard/jobs/${recommendation.job_id}`}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                View details
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}