"use client";

import { useEffect, useState } from "react";

import { skillService } from "@/services/skill.service";
import type { Skill, SkillCreate, StudentSkill } from "@/types/skill";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function SkillsPage() {
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [form, setForm] = useState<SkillCreate>({
    skill_id: 0,
    level: "BEGINNER",
    source: "MANUAL",
  });
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    Promise.all([
      skillService.getCatalog(token),
      skillService.getMySkills(token),
    ])
      .then(([catalogData, skillsData]) => {
        setCatalog(catalogData);
        setSkills(skillsData);
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

  const resetForm = () => {
    setEditingSkillId(null);
    setForm({
      skill_id: 0,
      level: "BEGINNER",
      source: "MANUAL",
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in to manage your skills.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingSkillId === null) {
        const addedSkill = await skillService.addSkill(token, form);
        setSkills((currentSkills) => [...currentSkills, addedSkill]);
        setSuccess("Skill added successfully.");
      } else {
        const updatedSkill = await skillService.updateSkill(
          token,
          editingSkillId,
          { level: form.level, source: form.source },
        );
        setSkills((currentSkills) =>
          currentSkills.map((skill) =>
            skill.skill_id === editingSkillId ? updatedSkill : skill,
          ),
        );
        setSuccess("Skill updated successfully.");
      }

      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (skill: StudentSkill) => {
    setEditingSkillId(skill.skill_id);
    setForm({
      skill_id: skill.skill_id,
      level: skill.level,
      source: skill.source,
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (skillId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in to manage your skills.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await skillService.deleteSkill(token, skillId);
      setSkills((currentSkills) =>
        currentSkills.filter((skill) => skill.skill_id !== skillId),
      );
      if (editingSkillId === skillId) {
        resetForm();
      }
      setSuccess("Skill deleted successfully.");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const availableSkills = catalog.filter(
    (option) =>
      !skills.some((skill) => skill.skill_id === option.skill_id),
  );

  if (loading) {
    return <p className="text-sm text-slate-500">Loading skills...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section>
        <p className="text-sm font-semibold text-violet-600">Career Profile</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Skills</h1>
        <p className="mt-2 text-sm text-slate-500">
          Keep your skills up to date to improve job matching.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          {editingSkillId === null ? "Add Skill" : "Edit Skill"}
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          {editingSkillId !== null ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {
                skills.find((skill) => skill.skill_id === editingSkillId)
                  ?.skill_name
              }
            </div>
          ) : (
            <select
              value={form.skill_id}
              onChange={(event) =>
                setForm({ ...form, skill_id: Number(event.target.value) })
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value={0}>Select a skill</option>
              {availableSkills.map((option) => (
                <option key={option.skill_id} value={option.skill_id}>
                  {option.skill_name}
                </option>
              ))}
            </select>
          )}

          <select
            value={form.level}
            onChange={(event) =>
              setForm({ ...form, level: event.target.value })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || form.skill_id === 0}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingSkillId === null
                  ? "Add Skill"
                  : "Save"}
            </button>

            {editingSkillId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {success && (
          <p className="mt-4 text-sm text-emerald-600">{success}</p>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Your Skills</h2>
          <p className="mt-1 text-sm text-slate-500">
            Skills from your profile and uploaded CVs.
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-slate-900">No skills added yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Add at least one skill to improve your profile completion.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => (
              <div
                key={skill.skill_id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900">{skill.skill_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{skill.category}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-600">
                      {skill.level}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500">
                      Source: {skill.source}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(skill)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(skill.skill_id)}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
