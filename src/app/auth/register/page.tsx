"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types/auth";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có tối thiểu 6 ký tự.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await authService.register({ email, password, role });
      router.replace("/auth/login?registered=true");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tạo tài khoản. Vui lòng thử lại sau.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#f8f9fc]">
      {/* Left Pitch Panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#121026] via-[#1b173d] to-[#251e54] px-12 py-12 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex w-fit items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-600/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Skill<span className="text-violet-400">Match</span>
          </span>
        </Link>

        <div className="relative max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            Nền tảng hướng nghiệp thế hệ mới
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl">
            Kỹ năng mở lối.{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Chúng tôi dẫn đường.
            </span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Tạo tài khoản SkillMatch để khám phá các cơ hội nghề nghiệp tương thích hoặc tìm kiếm những nhân tài nổi bật cho doanh nghiệp.
          </p>

          <div className="space-y-3 pt-4 border-t border-white/[0.08] text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Gợi ý việc làm theo kỹ năng chính xác đến từng từ khóa</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Theo dõi tiến độ ứng tuyển trực quan theo thời gian thực</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Hệ sinh thái kết nối đôi bên: Ứng viên & Nhà tuyển dụng</span>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-slate-400">
          © {new Date().getFullYear()} SkillMatch Inc. All rights reserved.
        </p>
      </section>

      {/* Right Form Panel */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-[460px]">
          {/* Mobile brand header */}
          <Link href="/" className="mb-8 flex w-fit items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Skill<span className="text-violet-600">Match</span>
            </span>
          </Link>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Tạo tài khoản mới
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Chọn vai trò của bạn để bắt đầu trải nghiệm phù hợp.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection Cards */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Bạn tham gia với tư cách
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-center transition ${
                    role === "STUDENT"
                      ? "border-violet-600 bg-violet-50/70 text-violet-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      role === "STUDENT"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Sinh viên</span>
                    <span className="text-[11px] text-slate-500 block">Tìm việc & tạo CV</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("RECRUITER")}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-center transition ${
                    role === "RECRUITER"
                      ? "border-amber-500 bg-amber-50/70 text-amber-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      role === "RECRUITER"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Tuyển dụng</span>
                    <span className="text-[11px] text-slate-500 block">Đăng tin & tìm talent</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="email">
                Địa chỉ email
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="password">
                Mật khẩu
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="text-slate-400 hover:text-slate-600 transition"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                  id="confirmPassword"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>Hoàn tất đăng ký</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <Link className="font-semibold text-violet-600 hover:text-violet-700 transition" href="/auth/login">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
