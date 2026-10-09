import Link from "next/link";

const stats = [
  {
    label: "Active Jobs",
    value: "8",
    description: "Currently accepting applications",
  },
  {
    label: "Total Applicants",
    value: "64",
    description: "Across all job posts",
  },
  {
    label: "Reviewing",
    value: "18",
    description: "Applications under review",
  },
  {
    label: "Interviews",
    value: "7",
    description: "Candidates in interview stage",
  },
];

const recentApplicants = [
  {
    id: 1,
    name: "Nguyen Minh Hieu",
    job: "Frontend Developer Intern",
    status: "REVIEWING",
    appliedAt: "Oct 09, 2026",
  },
  {
    id: 2,
    name: "Tran Quang Huy",
    job: "Backend Developer Intern",
    status: "INTERVIEW",
    appliedAt: "Oct 08, 2026",
  },
  {
    id: 3,
    name: "Bui Vu Thu Ha",
    job: "Software Engineer Tester Intern",
    status: "APPLIED",
    appliedAt: "Oct 07, 2026",
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

const recentJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    status: "OPEN",
    applicants: 24,
    createdAt: "Oct 07, 2026",
  },
  {
    id: 2,
    title: "Backend Developer Intern",
    status: "OPEN",
    applicants: 18,
    createdAt: "Oct 04, 2026",
  },
  {
    id: 3,
    title: "Software Engineer Intern",
    status: "CLOSED",
    applicants: 32,
    createdAt: "Sep 28, 2026",
  },
];

export default function RecruiterDashboardPage() {
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
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Applicants
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest candidates applying to your jobs.
            </p>
          </div>

          <Link
            href="/recruiter/applicants"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{applicant.name}</p>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {applicant.job}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Applied {applicant.appliedAt}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  applicant.status,
                )}`}
              >
                {applicant.status}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
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
              className="text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{job.title}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {job.applicants} applicants
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Posted {job.createdAt}
                  </p>
                </div>

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
            ))}
          </div>
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

                <span className="font-bold text-amber-600">72%</span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-amber-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Interview rate</span>

                <span className="font-bold text-violet-600">38%</span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[38%] rounded-full bg-violet-500" />
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
