"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import SkillPicker from "@/components/skills/SkillPicker";
import { jobService } from "@/services/job.service";
import { jobSkillService } from "@/services/job-skill.service";
import { recruiterService } from "@/services/recruiter.service";
import { skillService } from "@/services/skill.service";

import type { JobUpdate } from "@/types/job";
import type { JobSkillCreate } from "@/types/job-skill";
import type { Skill, SkillCatalogCreate } from "@/types/skill";

const initialForm: JobUpdate = {
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

export default function EditJobPage() {
  const params = useParams<{ job_id: string }>();

  const jobId = Number(params.job_id);

  const [form, setForm] =
    useState<JobUpdate>(initialForm);

  const [catalog, setCatalog] =
    useState<Skill[]>([]);

  const [jobSkills, setJobSkills] =
    useState<JobSkillCreate[]>([]);

  const [skillForm, setSkillForm] =
    useState<JobSkillCreate>(initialSkill);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadedJobId, setLoadedJobId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadJob() {
      // Defer state updates until after the effect setup.
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setLoadedJobId(null);
      setError("");
      setSuccess("");
      setSkillForm(initialSkill);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("You must be signed in.");
        if (!Number.isSafeInteger(jobId) || jobId <= 0) throw new Error("Invalid job.");
        const [profile, job, currentSkills, skillCatalog] = await Promise.all([
          recruiterService.getProfile(token),
          jobService.getJobById(token, jobId),
          jobSkillService.getSkills(token, jobId),
          skillService.getCatalog(token),
        ]);
        if (!active) return;
          if (job.company_id !== profile.company_id) {
            throw new Error("You do not have access to this job.");
          }

          setForm({
            title: job.title,
            description: job.description,
            location: job.location,
            salary: job.salary,
            job_type: job.job_type,
            experience_level:
              job.experience_level,
            deadline: job.deadline.slice(0, 10),
            status: job.status,
          });

          setJobSkills(
            currentSkills.map((skill) => ({
              skill_id: skill.skill_id,
              requirement_type:
                skill.requirement_type,
              level: skill.level,
            })),
          );

          setCatalog(skillCatalog);
          setLoadedJobId(jobId);
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Unable to load job.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadJob();
    return () => { active = false; };
  }, [jobId]);

  const availableSkills = catalog.filter(
    (skill) =>
      !jobSkills.some(
        (jobSkill) =>
          jobSkill.skill_id === skill.skill_id,
      ),
  );

  const handleAddSkill = () => {
    if (!availableSkills.some((skill) => skill.skill_id === skillForm.skill_id)) return;

    const exists = jobSkills.some(
      (skill) =>
        skill.skill_id === skillForm.skill_id,
    );

    if (exists) return;

    setJobSkills((current) => [
      ...current,
      skillForm,
    ]);

    setSkillForm(initialSkill);
  };

  const handleRemoveSkill = (
    skillId: number,
  ) => {
    setJobSkills((current) =>
      current.filter(
        (skill) => skill.skill_id !== skillId,
      ),
    );
  };

  const handleCreateCatalogSkill = async (data: SkillCatalogCreate) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("You must be signed in to create a skill.");
    }

    const skill = await skillService.createCatalogSkill(token, data);
    setCatalog((current) =>
      [...current.filter((item) => item.skill_id !== skill.skill_id), skill].sort(
        (left, right) => left.skill_name.localeCompare(right.skill_name),
      ),
    );
    return skill;
  };

  const handleSkillChange = (
    skillId: number,
    field: "requirement_type" | "level",
    value: string,
  ) => {
    setJobSkills((current) =>
      current.map((skill) =>
        skill.skill_id === skillId
          ? {
              ...skill,
              [field]: value,
            }
          : skill,
      ),
    );
  };

  const syncSkills = async (
    token: string,
  ) => {
    const serverSkills =
      await jobSkillService.getSkills(
        token,
        jobId,
      );

    const serverMap = new Map(
      serverSkills.map((skill) => [
        skill.skill_id,
        skill,
      ]),
    );

    const desiredMap = new Map(
      jobSkills.map((skill) => [
        skill.skill_id,
        skill,
      ]),
    );

    for (const serverSkill of serverSkills) {
      if (!desiredMap.has(serverSkill.skill_id)) {
        await jobSkillService.deleteSkill(
          token,
          jobId,
          serverSkill.skill_id,
        );
      }
    }

    for (const desiredSkill of jobSkills) {
      const existing =
        serverMap.get(desiredSkill.skill_id);

      if (!existing) {
        await jobSkillService.addSkill(
          token,
          jobId,
          desiredSkill,
        );

        continue;
      }

      if (
        existing.requirement_type !==
          desiredSkill.requirement_type ||
        existing.level !== desiredSkill.level
      ) {
        await jobSkillService.updateSkill(
          token,
          jobId,
          desiredSkill.skill_id,
          desiredSkill,
        );
      }
    }
  };

  const handleSave = async () => {
    if (saving || loadedJobId !== jobId) return;
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.salary.trim() ||
      !form.deadline
    ) {
      setError(
        "Please complete all required fields.",
      );
      return;
    }

    if (jobSkills.length === 0) {
      setError(
        "The job must have at least one skill.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await jobService.updateJob(
        token,
        jobId,
        form,
      );

      await syncSkills(token);

      setSuccess(
        "Job updated successfully.",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save job.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading job...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section>
        <Link
          href="/recruiter/jobs"
          className="text-sm font-semibold text-amber-600"
        >
          ← Back to jobs
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Edit Job
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update job information and required skills.
        </p>
      </section>

      <fieldset disabled={saving || loadedJobId !== jobId} className="space-y-7 disabled:opacity-60">
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
                  deadline:
                    event.target.value,
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
                  job_type:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target
                    .value as JobUpdate["status"],
                })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="OPEN">
                Open
              </option>

              <option value="CLOSED">
                Closed
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
                description:
                  event.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Job Skills
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add, remove or update skill requirements.
        </p>

        <div className="mt-5 grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
          <div className="grid gap-2 text-sm font-semibold text-slate-700">
            <span>Skill</span>
            <SkillPicker
              key={`edit-job-skill-${skillForm.skill_id}`}
              accent="amber"
              catalog={catalog}
              excludedSkillIds={jobSkills.map((skill) => skill.skill_id)}
              value={skillForm.skill_id}
              onChange={(skillId) =>
                setSkillForm((current) => ({
                  ...current,
                  skill_id: skillId,
                }))
              }
              onCreate={handleCreateCatalogSkill}
            />
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Requirement
            <select
              value={skillForm.requirement_type}
              onChange={(event) =>
                setSkillForm({
                  ...skillForm,
                  requirement_type:
                    event.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal"
            >
              <option value="REQUIRED">
                Required
              </option>

              <option value="PREFERRED">
                Preferred
              </option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Minimum level
            <select
              value={skillForm.level}
              onChange={(event) =>
                setSkillForm({
                  ...skillForm,
                  level: event.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal"
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
          </label>

          <button
            type="button"
            onClick={handleAddSkill}
            disabled={skillForm.skill_id === 0}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add skill
          </button>
        </div>

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
                className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_180px_180px_auto] md:items-center"
              >
                <p className="font-semibold text-slate-900">
                  {skill?.skill_name ?? `Skill #${jobSkill.skill_id}`}
                </p>

                <select
                  value={
                    jobSkill.requirement_type
                  }
                  onChange={(event) =>
                    handleSkillChange(
                      jobSkill.skill_id,
                      "requirement_type",
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="REQUIRED">
                    Required
                  </option>

                  <option value="PREFERRED">
                    Preferred
                  </option>
                </select>

                <select
                  value={jobSkill.level}
                  onChange={(event) =>
                    handleSkillChange(
                      jobSkill.skill_id,
                      "level",
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
      </section>

      </fieldset>

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

      <div className="flex justify-end gap-3">
        <Link
          href="/recruiter/jobs"
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loadedJobId !== jobId}
          className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
