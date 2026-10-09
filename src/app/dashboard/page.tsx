import Link from "next/link";

const stats = [
  {
    label: "Recommended Jobs",
    value: "12",
    description: "Jobs matching your skills",
  },
  {
    label: "Applications",
    value: "5",
    description: "Applications submitted",
  },
  {
    label: "Profile Completion",
    value: "60%",
    description: "Complete your profile",
  },
];

const recommendedJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Hanoi",
    skills: ["React", "TypeScript", "Next.js"],
    matchScore: 92,
  },
  {
    id: 2,
    title: "Backend Developer Intern",
    company: "Cloudify",
    location: "Remote",
    skills: ["Python", "FastAPI", "PostgreSQL"],
    matchScore: 86,
  },
  {
    id: 3,
    title: "Software Engineer Intern",
    company: "DevHub",
    location: "Hanoi",
    skills: ["Java", "SQL", "Git"],
    matchScore: 79,
  },
];

const recentApplications = [
  {
    id: 1,
    title: "Backend Developer Intern",
    company: "Cloudify",
    status: "REVIEWING",
    appliedAt: "Oct 08, 2026",
  },
  {
    id: 2,
    title: "Frontend Developer Intern",
    company: "TechNova",
    status: "APPLIED",
    appliedAt: "Oct 05, 2026",
  },
  {
    id: 3,
    title: "Software Engineer Intern",
    company: "DevHub",
    status: "INTERVIEW",
    appliedAt: "Oct 01, 2026",
  },
];

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

        <div className="grid gap-4 xl:grid-cols-3">
          {recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">{job.title}</h3>

                  <p className="mt-1 text-sm text-slate-500">{job.company}</p>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  {job.matchScore}% Match
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">{job.location}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <Link
                href={`/dashboard/jobs/${job.id}`}
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

          <div className="divide-y divide-slate-100">
            {recentApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {application.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {application.company}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Applied {application.appliedAt}
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

              <span className="text-sm font-bold text-violet-600">60%</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[60%] rounded-full bg-violet-600" />
            </div>
          </div>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <p className="text-sm font-semibold text-slate-800">Skill gaps</p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Adding these skills may improve your job matches.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Docker", "AWS", "Redis"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600"
                >
                  + {skill}
                </span>
              ))}
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
