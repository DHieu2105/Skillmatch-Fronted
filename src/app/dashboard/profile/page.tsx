"use client";

import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
} from "lucide-react";

import { studentService } from "@/services/student.service";
import type { StudentProfileForm } from "@/types/student";

const initialForm: StudentProfileForm = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  university: "",
  major: "",
  gpa: 0,
  graduation_year: new Date().getFullYear(),
  career_goal: "",
};

export default function StudentProfilePage() {
  const [form, setForm] = useState<StudentProfileForm>(initialForm);
  const [profileExists, setProfileExists] = useState(false);
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

    studentService
      .getProfile(token)
      .then((profile) => {
        setProfileExists(true);
        setForm({
          full_name: profile.full_name,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          university: profile.university,
          major: profile.major,
          gpa: profile.gpa,
          graduation_year: profile.graduation_year,
          career_goal: profile.career_goal,
        });
      })
      .catch((error) => {
        if (
          error instanceof Error &&
          error.message === "Student profile not found"
        ) {
          setProfileExists(false);
          return;
        }

        if (error instanceof Error) {
          setError(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Bạn cần đăng nhập để lưu hồ sơ.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (profileExists) {
        await studentService.updateProfile(token, form);
        setSuccess("Cập nhật thông tin hồ sơ thành công!");
      } else {
        await studentService.createProfile(token, form);
        setProfileExists(true);
        setSuccess("Tạo mới hồ sơ sinh viên thành công!");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể lưu hồ sơ. Vui lòng thử lại sau.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {/* Header */}
      <section>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-2">
          <User className="h-3.5 w-3.5 text-violet-600" />
          Hồ sơ ứng viên
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Thông tin cá nhân
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật đầy đủ thông tin học vấn và mục tiêu để nâng cao chất lượng gợi ý công việc từ hệ thống AI.
        </p>
      </section>

      {/* Form Section */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Full name */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Họ và tên
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.full_name}
                onChange={(event) =>
                  setForm({ ...form, full_name: event.target.value })
                }
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
              />
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Ngày sinh
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(event) =>
                  setForm({ ...form, date_of_birth: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Giới tính
            </label>
            <select
              value={form.gender}
              onChange={(event) =>
                setForm({ ...form, gender: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* University */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Trường đại học / Cao đẳng
            </label>
            <div className="relative">
              <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.university}
                onChange={(event) =>
                  setForm({ ...form, university: event.target.value })
                }
                placeholder="Đại học Quốc Gia..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
              />
            </div>
          </div>

          {/* Major */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Chuyên ngành học
            </label>
            <div className="relative">
              <BookOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.major}
                onChange={(event) =>
                  setForm({ ...form, major: event.target.value })
                }
                placeholder="Công nghệ thông tin, Quản trị..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
              />
            </div>
          </div>

          {/* GPA */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Điểm GPA tích lũy (Thang 4)
            </label>
            <div className="relative">
              <Award className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={form.gpa}
                onChange={(event) =>
                  setForm({ ...form, gpa: Number(event.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
              />
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Năm tốt nghiệp dự kiến
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={form.graduation_year}
              onChange={(event) =>
                setForm({
                  ...form,
                  graduation_year: Number(event.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
            />
          </div>
        </div>

        {/* Career goal */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Mục tiêu nghề nghiệp & Giới thiệu ngắn
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={form.career_goal}
              onChange={(event) =>
                setForm({ ...form, career_goal: event.target.value })
              }
              placeholder="Chia sẻ về định hướng sự nghiệp, thế mạnh cá nhân hoặc vị trí mong muốn ứng tuyển..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Đang lưu..." : profileExists ? "Lưu thay đổi" : "Tạo hồ sơ"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
