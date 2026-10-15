"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { jobService } from "@/services/job.service";
import { jobSkillService } from "@/services/job-skill.service";
import { recruiterService } from "@/services/recruiter.service";
import { skillService } from "@/services/skill.service";

import type { JobCreate } from "@/types/job";
import type { JobSkillCreate } from "@/types/job-skill";
import type { Skill } from "@/types/skill";

const initialJob: JobCreate = {
  company_id: 0,
  title: "",
  description: "",
  location: "",
  salary: "",
  job_type: "INTERNSHIP",
  experience_level: "ENTRY_LEVEL",
  deadline: "",
  status: "OPEN",
};

const initialSkill: JobSkillCreate = {
  skill_id: 0,
  requirement_type: "REQUIRED",
  level: "BEGINNER",
};

export default function CreateJobPage() {
  const [form, setForm] = useState<JobCreate>(initialJob);

  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [jobSkills, setJobSkills] = useState<JobSkillCreate[]>([]);
  const [skillForm, setSkillForm] =
    useState<JobSkillCreate>(initialSkill);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingJob, setPendingJob] = useState<{
    job_id: number;
    title: string;
    skills: JobSkillCreate[];
  } | null>(null);

  const [hasProfile, setHasProfile] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("access_token");

    if (!token) {
      queueMicrotask(() => {
        if (!active) return;
        setError("You must be signed in.");
        setLoadFailed(true);
        setLoading(false);
      });
      return () => { active = false; };
    }

    Promise.all([
      recruiterService.getProfile(token),
      skillService.getCatalog(token),
    ])
      .then(([profile, skillCatalog]) => {
        if (!active) return;
        setForm((current) => ({
          ...current,
          company_id: profile.company_id,
        }));

        setCatalog(skillCatalog);
        setHasProfile(true);
      })
      .catch((error) => {
        if (!active) return;
        if (
          error instanceof Error &&
          error.message === "Recruiter profile not found"
        ) {
          setHasProfile(false);
          return;
        }

        setLoadFailed(true);
        setError(error instanceof Error ? error.message : "Unable to load job form.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const availableSkills = catalog.filter(
    (skill) =>
      !jobSkills.some(
        (jobSkill) =>
          jobSkill.skill_id === skill.skill_id,
      ),
  );

  const handleAddSkill = () => {
    if (!availableSkills.some((skill) => skill.skill_id === skillForm.skill_id)) return;

    setJobSkills((current) => [
      ...current,
      skillForm,
    ]);

    setSkillForm(initialSkill);
  };

  const handleRemoveSkill = (skillId: number) => {
    setJobSkills((current) =>
      current.filter(
        (skill) => skill.skill_id !== skillId,
      ),
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in.");
      return;
    }

    if (form.company_id === 0) {
      setError("Recruiter company is missing.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.salary.trim() ||
      !form.deadline
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (jobSkills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const createdJob = pendingJob ?? {
        ...await jobService.createJob(token, form),
        skills: jobSkills,
      };
      setPendingJob(createdJob);
      // On retry, reconcile with the server in case a response was lost.
      const existingSkills = pendingJob
        ? await jobSkillService.getSkills(token, createdJob.job_id)
        : [];
      const remainingSkills = createdJob.skills.filter(
        (skill) => !existingSkills.some((existing) => existing.skill_id === skill.skill_id),
      );
      for (const skill of remainingSkills) {
        await jobSkillService.addSkill(token, createdJob.job_id, skill);
      }
      setPendingJob(null);

      setSuccess(
        `Job "${createdJob.title}" created successfully.`,
      );

      setForm({
        ...initialJob,
        company_id: form.company_id,
      });

      setJobSkills([]);
      setSkillForm(initialSkill);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to publish job.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading job form...
      </p>
    );
  }

  if (!hasProfile) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-xl font-bold text-slate-900">
          Complete your recruiter profile first
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          You need a company and recruiter profile before
          posting a job.
        </p>

        <Link
          href="/recruiter/company"
          className="mt-5 inline-block rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white"
        >
          Set up company
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section>
        <p className="text-sm font-semibold text-amber-600">
          Recruitment
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Post a Job
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new job opportunity and define the
          skills you are looking for.
        </p>
      </section>

      <fieldset disabled={saving || loadFailed || pendingJob !== null} className="space-y-7 disabled:opacity-60">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Job Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Job Title
            </label>

            <input
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value,
                })
              }
              placeholder="Backend Developer Intern"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Location
            </label>

            <input
              value={form.location}
              onChange={(event) =>
                setForm({
                  ...form,
                  location: event.target.value,
                })
              }
              placeholder="Hanoi"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Salary
            </label>

            <input
              value={form.salary}
              onChange={(event) =>
                setForm({
                  ...form,
                  salary: event.target.value,
                })
              }
              placeholder="5,000,000 - 8,000,000 VND"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Deadline
            </label>

            <input
              type="date"
              value={form.deadline}
              onChange={(event) =>
                setForm({
                  ...form,
                  deadline: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Job Type
            </label>

            <select
              value={form.job_type}
              onChange={(event) =>
                setForm({
                  ...form,
                  job_type: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            >
              <option value="INTERNSHIP">
                Internship
              </option>
              <option value="FULL_TIME">
                Full Time
              </option>
              <option value="PART_TIME">
                Part Time
              </option>
              <option value="REMOTE">
                Remote
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Experience Level
            </label>

            <select
              value={form.experience_level}
              onChange={(event) =>
                setForm({
                  ...form,
                  experience_level:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
            >
              <option value="ENTRY_LEVEL">
                Entry Level
              </option>
              <option value="JUNIOR">
                Junior
              </option>
              <option value="MID_LEVEL">
                Mid Level
              </option>
              <option value="SENIOR">
                Senior
              </option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            rows={8}
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            placeholder="Describe responsibilities, requirements and benefits..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Required Skills
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          These skills will be used by SkillMatch when
          calculating candidate compatibility.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px_200px_auto]">
          <select
            value={skillForm.skill_id}
            onChange={(event) =>
              setSkillForm({
                ...skillForm,
                skill_id: Number(
                  event.target.value,
                ),
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value={0}>
              Select skill
            </option>

            {availableSkills.map((skill) => (
              <option
                key={skill.skill_id}
                value={skill.skill_id}
              >
                {skill.skill_name}
              </option>
            ))}
          </select>

          <select
            value={skillForm.requirement_type}
            onChange={(event) =>
              setSkillForm({
                ...skillForm,
                requirement_type:
                  event.target.value,
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="REQUIRED">
              Required
            </option>

            <option value="PREFERRED">
              Preferred
            </option>
          </select>

          <select
            value={skillForm.level}
            onChange={(event) =>
              setSkillForm({
                ...skillForm,
                level: event.target.value,
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="BEGINNER">
              Beginner
            </option>

            <option value="INTERMEDIATE">
              Intermediate
            </option>

            <option value="ADVANCED">
              Advanced
            </option>
          </select>

          <button
            type="button"
            onClick={handleAddSkill}
            disabled={skillForm.skill_id === 0}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {jobSkills.length > 0 && (
          <div className="mt-5 space-y-3">
            {jobSkills.map((jobSkill) => {
              const skill = catalog.find(
                (item) =>
                  item.skill_id ===
                  jobSkill.skill_id,
              );

              return (
                <div
                  key={jobSkill.skill_id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {skill?.skill_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {jobSkill.requirement_type} ·{" "}
                      {jobSkill.level}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSkill(
                        jobSkill.skill_id,
                      )
                    }
                    className="text-sm font-semibold text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      </fieldset>

      {pendingJob && <p role="status" className="text-sm text-amber-700">Job #{pendingJob.job_id} was created. Retry to finish saving its skills.</p>}
      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-emerald-600">
          {success}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loadFailed}
          className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Publishing..." : pendingJob ? "Retry Saving Skills" : "Publish Job"}
        </button>
      </div>
    </div>
  );
}
