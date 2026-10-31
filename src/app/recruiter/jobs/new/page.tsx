"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  Layers,
  GraduationCap,
  Building2,
  HelpCircle,
  Save,
} from "lucide-react";

import SkillPicker from "@/components/skills/SkillPicker";
import { jobService } from "@/services/job.service";
import { jobSkillService } from "@/services/job-skill.service";
import { recruiterService } from "@/services/recruiter.service";
import { skillService } from "@/services/skill.service";

import type { JobCreate } from "@/types/job";
import type { JobSkillCreate } from "@/types/job-skill";
import type { Skill, SkillCatalogCreate } from "@/types/skill";

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
  const [skillForm, setSkillForm] = useState<JobSkillCreate>(initialSkill);

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
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      queueMicrotask(() => {
        if (!active) return;
        setError("Bạn cần đăng nhập để đăng tin tuyển dụng.");
        setLoadFailed(true);
        setLoading(false);
      });
      return () => {
        active = false;
      };
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
        setError(error instanceof Error ? error.message : "Không thể tải dữ liệu tạo tin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const availableSkills = catalog.filter(
    (skill) =>
      !jobSkills.some((jobSkill) => jobSkill.skill_id === skill.skill_id),
  );

  const handleAddSkill = () => {
    if (!availableSkills.some((skill) => skill.skill_id === skillForm.skill_id))
      return;

    setJobSkills((current) => [...current, skillForm]);
    setSkillForm(initialSkill);
  };

  const handleRemoveSkill = (skillId: number) => {
    setJobSkills((current) =>
      current.filter((skill) => skill.skill_id !== skillId),
    );
  };

  const handleCreateCatalogSkill = async (data: SkillCatalogCreate) => {
    const token = sessionStorage.getItem("access_token");
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

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setError("Bạn cần đăng nhập.");
      return;
    }

    if (form.company_id === 0) {
      setError("Không tìm thấy thông tin doanh nghiệp.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.salary.trim() ||
      !form.deadline
    ) {
      setError("Vui lòng điền đầy đủ các trường thông tin bắt buộc (*).");
      return;
    }

    if (jobSkills.length === 0) {
      setError("Vui lòng thêm ít nhất một kỹ năng yêu cầu để AI matching.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const createdJob =
        pendingJob ?? (await jobService.createJob(token, form));

      const skillsToSync = pendingJob ? pendingJob.skills : jobSkills;
      const failedSkills: JobSkillCreate[] = [];

      for (const skill of skillsToSync) {
        try {
          await jobSkillService.addSkill(token, createdJob.job_id, skill);
        } catch {
          failedSkills.push(skill);
        }
      }

      if (failedSkills.length > 0) {
        setPendingJob({
          job_id: createdJob.job_id,
          title: createdJob.title,
          skills: failedSkills,
        });

        setError(
          `Tin đã tạo nhưng ${failedSkills.length} kỹ năng chưa được lưu. Bấm "Thử lại lưu kỹ năng" để hoàn tất.`,
        );
        return;
      }

      setPendingJob(null);
      setSuccess("Đăng tin tuyển dụng thành công! Ứng viên đã có thể xem và nộp hồ sơ.");

      setForm({
        ...initialJob,
        company_id: form.company_id,
      });

      setJobSkills([]);
      setSkillForm(initialSkill);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể đăng tin tuyển dụng.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600 mb-3" />
        <p className="text-sm font-semibold text-slate-500">Đang chuẩn bị biểu mẫu đăng tin...</p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200/80 bg-amber-50/70 p-8 text-center shadow-sm backdrop-blur-md">
        <Building2 className="mx-auto h-12 w-12 text-amber-600 mb-3" />
        <h1 className="text-xl font-extrabold text-slate-900">
          Cần hoàn thiện hồ sơ Doanh nghiệp trước
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bạn cần thiết lập hồ sơ công ty và thông tin người đại diện trước khi có thể đăng tin tuyển dụng.
        </p>
        <Link
          href="/recruiter/company"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition hover:shadow-lg"
        >
          Thiết lập thông tin công ty ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-600 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách tin tuyển dụng</span>
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 mb-2 border border-violet-100">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              Đăng tin tuyển dụng mới
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Tạo vị trí tuyển dụng
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Điền thông tin chi tiết công việc và thiết lập các tiêu chí kỹ năng để hệ thống AI kết nối đúng ứng viên.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {pendingJob && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Tin tuyển dụng #{pendingJob.job_id} đã được tạo thành công nhưng kỹ năng chưa lưu hết. Vui lòng bấm &quot;Thử lại lưu kỹ năng&quot; bên dưới.</span>
        </div>
      )}

      <fieldset
        disabled={saving || loadFailed || pendingJob !== null}
        className="space-y-7 disabled:opacity-60"
      >
        {/* Card 1: Thông tin cơ bản công việc */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-500/25">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                1. Thông tin cơ bản & Chế độ đãi ngộ
              </h2>
              <p className="text-xs text-slate-400">
                Mô tả chức danh, địa điểm làm việc, mức lương dự kiến và hạn nộp đơn
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Job Title */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Tiêu đề vị trí tuyển dụng <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Backend Developer Intern (Node.js / Python)..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Địa điểm làm việc <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="VD: Hà Nội (hoặc TP. Hồ Chí Minh, Remote)..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mức lương / Trợ cấp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="VD: 5,000,000 - 8,000,000 VNĐ hoặc Thỏa thuận..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Hình thức làm việc
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={form.job_type}
                  onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                >
                  <option value="INTERNSHIP">Thực tập sinh (Internship)</option>
                  <option value="FULL_TIME">Toàn thời gian (Full-time)</option>
                  <option value="PART_TIME">Bán thời gian (Part-time)</option>
                  <option value="REMOTE">Làm việc từ xa (Remote)</option>
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Yêu cầu kinh nghiệm
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={form.experience_level}
                  onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                >
                  <option value="ENTRY_LEVEL">Mới bắt đầu / Chưa có kinh nghiệm</option>
                  <option value="JUNIOR">Junior (Dưới 1 năm kinh nghiệm)</option>
                  <option value="MID_LEVEL">Middle (1 - 3 năm kinh nghiệm)</option>
                  <option value="SENIOR">Senior (Trên 3 năm kinh nghiệm)</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Hạn chót nhận hồ sơ <span className="text-rose-500">*</span>
              </label>
              <div className="relative max-w-sm">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mô tả công việc & Quyền lợi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={7}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="• Mô tả chi tiết trách nhiệm và công việc hằng ngày...&#10;• Yêu cầu chuyên môn, thái độ làm việc...&#10;• Quyền lợi, chế độ thưởng, đào tạo và cơ hội thăng tiến..."
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* Card 2: Thiết lập Kỹ năng AI Matching */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  2. Kỹ năng yêu cầu (AI Matching)
                </h2>
                <p className="text-xs text-slate-400">
                  Hệ thống AI sẽ dùng danh sách kỹ năng này để đối soát và chấm điểm hồ sơ ứng viên
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1 text-xs font-bold text-emerald-700">
              {jobSkills.length} kỹ năng đã chọn
            </span>
          </div>

          {/* Skill Selector Row */}
          <div className="mt-6 rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
            <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
              <div className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <span>Chọn Kỹ năng</span>
                <SkillPicker
                  key={`new-job-skill-${skillForm.skill_id}`}
                  accent="violet"
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

              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Mức độ ưu tiên
                <select
                  value={skillForm.requirement_type}
                  onChange={(e) =>
                    setSkillForm({
                      ...skillForm,
                      requirement_type: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500"
                >
                  <option value="REQUIRED">Bắt buộc (Required)</option>
                  <option value="PREFERRED">Ưu tiên (Preferred)</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Trình độ tối thiểu
                <select
                  value={skillForm.level}
                  onChange={(e) =>
                    setSkillForm({
                      ...skillForm,
                      level: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500"
                >
                  <option value="BEGINNER">Cơ bản (Beginner)</option>
                  <option value="INTERMEDIATE">Khá (Intermediate)</option>
                  <option value="ADVANCED">Thành thạo (Advanced)</option>
                </select>
              </label>

              <button
                type="button"
                onClick={handleAddSkill}
                disabled={skillForm.skill_id === 0}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40 h-[38px]"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Added Skills List */}
          {jobSkills.length > 0 ? (
            <div className="mt-5 space-y-2.5">
              {jobSkills.map((jobSkill) => {
                const skill = catalog.find(
                  (item) => item.skill_id === jobSkill.skill_id,
                );
                const isRequired = jobSkill.requirement_type === "REQUIRED";

                return (
                  <div
                    key={jobSkill.skill_id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-violet-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700 font-bold text-xs">
                        {skill?.skill_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {skill?.skill_name}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              isRequired
                                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                : "bg-blue-50 text-blue-700 border border-blue-200/60"
                            }`}
                          >
                            {isRequired ? "Bắt buộc" : "Ưu tiên"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Nhóm: {skill?.category || "Chung"} · Trình độ:{" "}
                          <strong className="text-slate-600">{jobSkill.level}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(jobSkill.skill_id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-1" />
              <p className="text-xs font-bold text-slate-700">
                Chưa thêm kỹ năng nào
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Hãy thêm cả kỹ năng bắt buộc và kỹ năng ưu tiên để thuật toán AI xếp hạng ứng viên chuẩn xác nhất.
              </p>
            </div>
          )}
        </section>
      </fieldset>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Link
          href="/recruiter/jobs"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          Hủy bỏ
        </Link>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loadFailed}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-8 py-3 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/35 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Đang đăng tin...</span>
            </>
          ) : pendingJob ? (
            <>
              <Save className="h-4 w-4" />
              <span>Thử lại lưu kỹ năng</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Đăng tin tuyển dụng ngay</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
