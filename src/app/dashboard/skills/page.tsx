"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
} from "lucide-react";

import SkillPicker from "@/components/skills/SkillPicker";
import { skillService } from "@/services/skill.service";
import type {
  Skill,
  SkillCatalogCreate,
  SkillCreate,
  StudentSkill,
} from "@/types/skill";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const levelLabels: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: "Cơ bản (Beginner)", color: "bg-blue-50 text-blue-700 border-blue-200/60" },
  INTERMEDIATE: { label: "Trung cấp (Intermediate)", color: "bg-violet-50 text-violet-700 border-violet-200/60" },
  ADVANCED: { label: "Nâng cao (Advanced)", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
};

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
      setError("Bạn cần đăng nhập để quản lý kỹ năng.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingSkillId === null) {
        const addedSkill = await skillService.addSkill(token, form);
        setSkills((currentSkills) => [...currentSkills, addedSkill]);
        setSuccess("Thêm kỹ năng thành công!");
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
        setSuccess("Cập nhật trình độ kỹ năng thành công!");
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

  const handleCreateCatalogSkill = async (data: SkillCatalogCreate) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Bạn cần đăng nhập để tạo kỹ năng mới.");
    }

    const skill = await skillService.createCatalogSkill(token, data);
    setCatalog((current) =>
      [...current.filter((item) => item.skill_id !== skill.skill_id), skill].sort(
        (left, right) => left.skill_name.localeCompare(right.skill_name),
      ),
    );
    return skill;
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
      setError("Bạn cần đăng nhập để quản lý kỹ năng.");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa kỹ năng này?");
    if (!confirmed) return;

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
      setSuccess("Đã xóa kỹ năng thành công.");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Header */}
      <section>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-2">
          <Cpu className="h-3.5 w-3.5 text-violet-600" />
          Hồ sơ năng lực
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Kỹ năng chuyên môn
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật liên tục các kỹ năng giúp tăng độ chính xác khi thuật toán AI đối sánh việc làm phù hợp cho bạn.
        </p>
      </section>

      {/* Add / Edit Form */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Plus className="h-4 w-4 text-violet-600" />
          {editingSkillId === null ? "Thêm kỹ năng mới" : "Chỉnh sửa trình độ kỹ năng"}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
          {editingSkillId !== null ? (
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
              {skills.find((skill) => skill.skill_id === editingSkillId)?.skill_name}
            </div>
          ) : (
            <SkillPicker
              key={`student-skill-${form.skill_id}`}
              catalog={catalog}
              excludedSkillIds={skills.map((skill) => skill.skill_id)}
              value={form.skill_id}
              onChange={(skillId) =>
                setForm((current) => ({ ...current, skill_id: skillId }))
              }
              onCreate={handleCreateCatalogSkill}
            />
          )}

          <select
            value={form.level}
            onChange={(event) =>
              setForm({ ...form, level: event.target.value })
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {levelLabels[level]?.label || level}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (editingSkillId === null && form.skill_id === 0)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : editingSkillId === null ? "Thêm kỹ năng" : "Cập nhật"}
            </button>

            {editingSkillId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </section>

      {/* Skills list */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Kỹ năng hiện có ({skills.length})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Bao gồm kỹ năng tự thêm và các kỹ năng được AI trích xuất tự động từ CV của bạn.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Cpu className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có kỹ năng nào</p>
            <p className="mt-1 text-xs text-slate-400">
              Hãy thêm các kỹ năng chuyên môn bạn sở hữu để nhận được các cơ hội việc làm tốt nhất!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {skills.map((skill) => {
              const lvl = levelLabels[skill.level] || { label: skill.level, color: "bg-slate-100 text-slate-600" };
              return (
                <div
                  key={skill.skill_id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{skill.skill_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{skill.category}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${lvl.color}`}>
                        {lvl.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {skill.source === "CV" ? "Từ CV" : "Thủ công"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(skill)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(skill.skill_id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
