"use client";

import { useEffect, useRef, useState } from "react";
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
  Camera,
  UploadCloud,
  Loader2,
} from "lucide-react";

import { studentService } from "@/services/student.service";
import { authService } from "@/services/auth.service";
import { notifyUserUpdated } from "@/lib/auth-events";
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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    // Load user avatar
    authService
      .getMe(token)
      .then((user) => {
        if (user.avatar_url) {
          setAvatarUrl(user.avatar_url);
        }
      })
      .catch(() => {});

    // Load student profile
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP,...)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn cần đăng nhập để tải ảnh lên.");
      return;
    }

    setUploadingAvatar(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.uploadAvatar(token, file);
      setAvatarUrl(response.avatar_url);
      setSuccess("Tải lên ảnh đại diện thành công!");
      notifyUserUpdated();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể tải ảnh lên. Vui lòng thử lại.");
      }
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      notifyUserUpdated();
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

  const initials = (
    form.full_name?.trim()
      ? form.full_name.trim().split(" ").pop()?.slice(0, 1)
      : "T"
  )?.toUpperCase() ?? "T";

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
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          <User className="h-3.5 w-3.5 text-violet-600" />
          Hồ sơ ứng viên
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Thông tin cá nhân
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật đầy đủ thông tin học vấn và ảnh đại diện để cá nhân hóa giao diện và nâng cao chất lượng gợi ý công việc từ hệ thống AI.
        </p>
      </section>

      {/* Avatar Section */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-1">Ảnh đại diện</h2>
        <p className="text-xs text-slate-500 mb-5">
          Ảnh đại diện sẽ hiển thị trên góc phải thanh điều hướng và hồ sơ của bạn.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={form.full_name || "Avatar"}
                className="h-24 w-24 rounded-2xl object-cover shadow-md ring-4 ring-violet-500/20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-3xl font-bold text-white shadow-md shadow-violet-500/20">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 hover:scale-105 disabled:opacity-50"
              title="Tải ảnh mới"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4 text-violet-600" />
                    <span>Tải ảnh lên</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Hỗ trợ PNG, JPG, WEBP. Dung lượng tối đa 5MB.
            </p>
          </div>
        </div>
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
