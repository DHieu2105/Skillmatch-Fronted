"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  ChevronDown,
  Info,
  Check,
  Building,
  School,
  Clock,
  Flame,
  Layers,
  Sparkle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { studentService } from "@/services/student.service";
import { authService } from "@/services/auth.service";
import { notifyUserUpdated } from "@/lib/auth-events";
import { springs, staggerContainer, fadeInUp, dropdownVariants } from "@/lib/animation";
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

type TabKey = "ALL" | "PERSONAL" | "EDUCATION" | "CAREER";

const tabList: { key: TabKey; label: string; icon: typeof User; desc: string }[] = [
  { key: "ALL", label: "Tất cả", icon: Sparkles, desc: "Toàn bộ thông tin hồ sơ" },
  { key: "PERSONAL", label: "Cá nhân & Ảnh", icon: User, desc: "Họ tên, ngày sinh, avatar" },
  { key: "EDUCATION", label: "Học vấn & GPA", icon: GraduationCap, desc: "Trường, chuyên ngành, điểm số" },
  { key: "CAREER", label: "Mục tiêu sự nghiệp", icon: Target, desc: "Định hướng & giới thiệu" },
];

const genderOptions = [
  { value: "MALE", label: "Nam", icon: "👨" },
  { value: "FEMALE", label: "Nữ", icon: "👩" },
  { value: "OTHER", label: "Khác", icon: "🌈" },
];

const quickGpaPresets = [3.0, 3.2, 3.5, 3.8, 4.0];
const quickGradYears = [2025, 2026, 2027, 2028];
const quickGoals = [
  "Software Engineer (Frontend / Backend)",
  "Fullstack Web Developer",
  "AI & Data Engineer",
  "Mobile App Developer (Flutter / React Native)",
  "Product Manager & Business Analyst",
];

export default function StudentProfilePage() {
  const [form, setForm] = useState<StudentProfileForm>(initialForm);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setGenderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

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
          full_name: profile.full_name || "",
          date_of_birth: profile.date_of_birth || "",
          gender: profile.gender || "",
          university: profile.university || "",
          major: profile.major || "",
          gpa: profile.gpa || 0,
          graduation_year: profile.graduation_year || new Date().getFullYear(),
          career_goal: profile.career_goal || "",
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

  // Calculate profile completeness score
  const completionStats = useMemo(() => {
    const fields = [
      Boolean(form.full_name?.trim()),
      Boolean(form.date_of_birth?.trim()),
      Boolean(form.gender?.trim()),
      Boolean(form.university?.trim()),
      Boolean(form.major?.trim()),
      form.gpa > 0,
      Boolean(form.graduation_year),
      Boolean(form.career_goal?.trim()),
      Boolean(avatarUrl),
    ];
    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    return { completed, total: fields.length, percentage };
  }, [form, avatarUrl]);

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

    const token = sessionStorage.getItem("access_token");
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
    const token = sessionStorage.getItem("access_token");

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
      : "A"
  )?.toUpperCase() ?? "A";

  const selectedGenderLabel =
    genderOptions.find((g) => g.value === form.gender)?.label || "Chọn giới tính";

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-slate-200/80" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-4xl space-y-7 pb-16"
    >
      {/* 1. Hero Profile Banner */}
      <motion.section
        variants={fadeInUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#20083c] via-[#5c1363] to-[#7d1470] p-6 text-white shadow-xl shadow-purple-950/15 sm:p-8"
      >
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 h-44 w-44 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-pink-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-pink-300" />
              <span>Hồ sơ thông minh AI Matching</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Hồ sơ ứng viên
            </h1>
            <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-white/80">
              Chọn từng mục bên dưới để thay đổi thông tin tương ứng. Hồ sơ hoàn thiện giúp tăng tỷ lệ AI đề xuất cho nhà tuyển dụng.
            </p>
          </div>

          {/* Profile Strength Meter */}
          <div className="flex shrink-0 flex-col gap-2 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/80">Độ hoàn thiện hồ sơ</span>
              <span className="font-extrabold text-amber-300">
                {completionStats.percentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionStats.percentage}%` }}
                transition={springs.smooth}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400"
              />
            </div>
            <p className="text-[10px] text-white/70">
              {completionStats.percentage >= 80
                ? "✨ Tối ưu chuẩn AI matching"
                : "💡 Bổ sung thêm để tăng tỉ lệ ứng tuyển"}
            </p>
          </div>
        </div>
      </motion.section>

      {/* 2. Interactive Section Switcher (Mục thay đổi tabs with sliding pill) */}
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center justify-center gap-2 rounded-xl px-3.5 py-3 text-xs font-bold transition-colors ${
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-profile-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-600/25"
                    transition={springs.smooth}
                  />
                )}
                <Icon className={`relative z-10 h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span className="relative z-10 truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Tab Content Area with Smooth Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
          transition={springs.gentle}
          className="space-y-7"
        >
          {/* TAB: PERSONAL OR ALL (Avatar & Basic Info) */}
          {(activeTab === "ALL" || activeTab === "PERSONAL") && (
            <>
              {/* Avatar Section */}
              <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Ảnh đại diện</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ảnh đại diện sẽ hiển thị trên góc phải thanh điều hướng và hồ sơ gửi tới nhà tuyển dụng.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 border border-violet-100">
                    Chuẩn tỷ lệ 1:1
                  </span>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Avatar frame */}
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="relative h-28 w-28 overflow-hidden rounded-3xl ring-4 ring-violet-500/15 shadow-xl transition-transform duration-300 group-hover:scale-105">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={form.full_name || "Avatar"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#5c1363] via-[#7d1470] to-[#b3196b] text-4xl font-extrabold text-white">
                          {initials}
                        </div>
                      )}

                      {/* Hover backdrop overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-bold">Thay ảnh</span>
                      </div>
                    </div>

                    {/* Quick camera floating pill */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springs.snappy}
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/35 border-2 border-white pointer-events-none"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </motion.div>
                  </div>

                  {/* Upload actions and guidelines */}
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={springs.snappy}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/35 transition-all disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Đang tải lên...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-4 w-4" />
                            <span>Tải ảnh lên</span>
                          </>
                        )}
                      </motion.button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          Chọn ảnh khác
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        PNG, JPG, WEBP
                      </span>
                      <span>•</span>
                      <span>Tối đa 5MB</span>
                      <span>•</span>
                      <span>Khuyến nghị hình vuông</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Basic Info Fields */}
              <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Thông tin cá nhân cơ bản</h3>
                    <p className="text-[11px] text-slate-400">Họ tên, ngày sinh và giới tính</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                      <User className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(event) =>
                          setForm({ ...form, full_name: event.target.value })
                        }
                        placeholder="Nguyễn Văn A"
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ngày sinh
                    </label>
                    <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                      <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                      <input
                        type="date"
                        value={form.date_of_birth}
                        onChange={(event) =>
                          setForm({ ...form, date_of_birth: event.target.value })
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none font-semibold"
                      />
                    </div>
                  </div>

                  {/* Custom Animated Gender Selector */}
                  <div className="relative" ref={genderDropdownRef}>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Giới tính
                    </label>
                    <button
                      type="button"
                      onClick={() => setGenderDropdownOpen((prev) => !prev)}
                      className="group flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100/70 focus:border-violet-600 focus:bg-white focus:ring-4 focus:ring-violet-600/10"
                    >
                      <span className={form.gender ? "text-slate-900" : "text-slate-400"}>
                        {selectedGenderLabel}
                      </span>
                      <motion.div
                        animate={{ rotate: genderDropdownOpen ? 180 : 0 }}
                        transition={springs.snappy}
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                      </motion.div>
                    </button>

                    {/* Animated Popover */}
                    <AnimatePresence>
                      {genderDropdownOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
                        >
                          {genderOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, gender: option.value });
                                setGenderDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                                form.gender === option.value
                                  ? "bg-violet-50 text-violet-700 font-extrabold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                              </span>
                              {form.gender === option.value && (
                                <Check className="h-4 w-4 text-violet-600" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* TAB: EDUCATION OR ALL */}
          {(activeTab === "ALL" || activeTab === "EDUCATION") && (
            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Học vấn & Thành tích đào tạo</h3>
                  <p className="text-[11px] text-slate-400">Trường, chuyên ngành và kết quả học tập</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* University */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Trường đại học / Cao đẳng <span className="text-rose-500">*</span>
                  </label>
                  <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                    <School className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                    <input
                      type="text"
                      value={form.university}
                      onChange={(event) =>
                        setForm({ ...form, university: event.target.value })
                      }
                      placeholder="Ví dụ: Đại học Bách Khoa Hà Nội..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-semibold"
                    />
                  </div>
                </div>

                {/* Major */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Chuyên ngành học <span className="text-rose-500">*</span>
                  </label>
                  <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                    <BookOpen className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                    <input
                      type="text"
                      value={form.major}
                      onChange={(event) =>
                        setForm({ ...form, major: event.target.value })
                      }
                      placeholder="Ví dụ: Khoa học máy tính, IT..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-semibold"
                    />
                  </div>
                </div>

                {/* GPA */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Điểm GPA tích lũy (Thang 4)
                    </label>
                    {form.gpa >= 3.6 ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Xuất sắc
                      </span>
                    ) : form.gpa >= 3.2 ? (
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                        Giỏi
                      </span>
                    ) : null}
                  </div>
                  <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                    <Award className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={form.gpa === 0 ? "" : form.gpa}
                      onChange={(event) =>
                        setForm({ ...form, gpa: Number(event.target.value) })
                      }
                      placeholder="3.5"
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-semibold"
                    />
                    <span className="text-xs font-bold text-slate-400">/ 4.0</span>
                  </div>

                  {/* Quick GPA Presets */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh:</span>
                    {quickGpaPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm({ ...form, gpa: preset })}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
                          form.gpa === preset
                            ? "bg-violet-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {preset.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Năm tốt nghiệp dự kiến
                  </label>
                  <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                    <Clock className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={form.graduation_year || ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          graduation_year: Number(event.target.value),
                        })
                      }
                      placeholder="2027"
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-semibold"
                    />
                  </div>

                  {/* Quick Year Presets */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Năm:</span>
                    {quickGradYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setForm({ ...form, graduation_year: year })}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
                          form.graduation_year === year
                            ? "bg-violet-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: CAREER OR ALL */}
          {(activeTab === "ALL" || activeTab === "CAREER") && (
            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-pink-700">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mục tiêu nghề nghiệp & Giới thiệu ngắn</h3>
                  <p className="text-[11px] text-slate-400">Mô tả định hướng và thế mạnh để tạo ấn tượng tốt nhất</p>
                </div>
              </div>

              {/* Quick Goal suggestion pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Gợi ý định hướng phổ biến:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickGoals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          career_goal: form.career_goal
                            ? `${form.career_goal}\n• Mục tiêu: ${g}`
                            : `Định hướng nghề nghiệp: ${g}`,
                        })
                      }
                      className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 active:scale-95"
                    >
                      + {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-600/10">
                <textarea
                  rows={4}
                  value={form.career_goal}
                  onChange={(event) =>
                    setForm({ ...form, career_goal: event.target.value })
                  }
                  placeholder="Ví dụ: Định hướng trở thành Software Engineer chuyên về Frontend/Fullstack. Có đam mê xây dựng giao diện tối ưu trải nghiệm người dùng và tiếp thu công nghệ mới..."
                  className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium leading-relaxed"
                />
                <div className="flex justify-end pt-2 text-[11px] text-slate-400 font-medium">
                  {form.career_goal.length} ký tự
                </div>
              </div>
            </section>
          )}

          {/* Feedback Alerts with AnimatePresence */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={springs.snappy}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-bold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={springs.snappy}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action Save Bar */}
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-slate-900">
                Sẵn sàng lưu thông tin?
              </p>
              <p className="text-[11px] text-slate-400">
                Dữ liệu được lưu trữ bảo mật và đồng bộ tức thì trên nền tảng.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#5c1363] via-[#7d1470] to-[#b3196b] px-7 py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu thông tin...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{profileExists ? "Lưu thay đổi hồ sơ" : "Tạo mới hồ sơ"}</span>
                </>
              )}
            </motion.button>
          </section>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
