"use client";

import { useState } from "react";

import type { Skill, SkillCatalogCreate } from "@/types/skill";

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Mobile",
  "Databases",
  "DevOps",
  "Cloud",
  "Data & AI",
  "Software Engineering",
  "Quality Assurance",
  "Design",
  "Tools",
  "Ways of Working",
  "Soft Skills",
  "Languages",
  "Other",
];

interface SkillPickerProps {
  accent?: "amber" | "violet";
  catalog: Skill[];
  disabled?: boolean;
  excludedSkillIds?: number[];
  onChange: (skillId: number) => void;
  onCreate: (data: SkillCatalogCreate) => Promise<Skill>;
  value: number;
}

export default function SkillPicker({
  accent = "violet",
  catalog,
  disabled = false,
  excludedSkillIds = [],
  onChange,
  onCreate,
  value,
}: SkillPickerProps) {
  const selectedSkill = catalog.find((skill) => skill.skill_id === value);
  const [query, setQuery] = useState(selectedSkill?.skill_name ?? "");
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [category, setCategory] = useState("Other");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const excludedIds = new Set(excludedSkillIds);
  const exactMatch = catalog.find(
    (skill) => skill.skill_name.toLocaleLowerCase() === normalizedQuery,
  );
  const matches = catalog
    .filter(
      (skill) =>
        !excludedIds.has(skill.skill_id) &&
        (!normalizedQuery ||
          skill.skill_name.toLocaleLowerCase().includes(normalizedQuery) ||
          skill.category.toLocaleLowerCase().includes(normalizedQuery)),
    )
    .slice(0, 8);
  const canCreate = normalizedQuery.length >= 2 && !exactMatch;

  const focusClass =
    accent === "amber" ? "focus:border-amber-400" : "focus:border-violet-400";
  const actionClass =
    accent === "amber"
      ? "text-amber-700 hover:bg-amber-50"
      : "text-violet-700 hover:bg-violet-50";
  const buttonClass =
    accent === "amber"
      ? "bg-amber-500 hover:bg-amber-600"
      : "bg-violet-600 hover:bg-violet-700";

  const selectSkill = (skill: Skill) => {
    setQuery(skill.skill_name);
    setOpen(false);
    setShowCreate(false);
    setError("");
    onChange(skill.skill_id);
  };

  const handleCreate = async () => {
    const skillName = query.trim();
    if (!skillName || !canCreate) return;

    setCreating(true);
    setError("");

    try {
      const skill = await onCreate({
        skill_name: skillName,
        category,
      });
      selectSkill(skill);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create skill.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setShowCreate(false);
        }
      }}
    >
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="skill-search-results"
        autoComplete="off"
        disabled={disabled}
        value={query}
        placeholder="Search skills..."
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setShowCreate(false);
          setError("");
          onChange(0);
        }}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ${focusClass}`}
      />

      {open && (
        <div
          id="skill-search-results"
          className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {matches.map((skill) => (
            <button
              key={skill.skill_id}
              type="button"
              onClick={() => selectSkill(skill)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
            >
              <span className="text-sm font-semibold text-slate-800">
                {skill.skill_name}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {skill.category}
              </span>
            </button>
          ))}

          {matches.length === 0 && !canCreate && (
            <p className="px-3 py-3 text-sm text-slate-500">
              {exactMatch && excludedIds.has(exactMatch.skill_id)
                ? "This skill has already been added."
                : "Type at least 2 characters to search."}
            </p>
          )}

          {canCreate && !showCreate && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className={`w-full rounded-lg px-3 py-3 text-left text-sm font-semibold ${actionClass}`}
            >
              + Add &quot;{query.trim()}&quot;
            </button>
          )}

          {canCreate && showCreate && (
            <div className="space-y-3 rounded-lg bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">
                Add &quot;{query.trim()}&quot; to the catalog
              </p>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {SKILL_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={creating}
                onClick={() => void handleCreate()}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 ${buttonClass}`}
              >
                {creating ? "Adding..." : "Add custom skill"}
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="px-3 py-2 text-xs text-rose-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
