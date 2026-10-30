"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      const result = await authService.login({
        email,
        password,
      });

      localStorage.setItem("access_token", result.access_token);

      const user = await authService.getMe(result.access_token);

      if (user.role === "STUDENT") {
        router.replace("/dashboard");
      } else if (user.role === "RECRUITER") {
        router.replace("/recruiter/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#f8f9fc]">
      {/* Left Hero Panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#121026] via-[#1b173d] to-[#251e54] px-12 py-12 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-600/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Skill<span className="text-violet-400">Match</span>
          </span>
        </div>

        {/* Center Pitch */}
        <div className="relative max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            AI-Powered Career Intelligence
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl">
            Tìm kiếm công việc đúng với{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              năng lực của bạn.
            </span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Kết nối kỹ năng thực tế với hàng nghìn cơ hội nghề nghiệp thông qua mô hình phân tích và đối sánh AI thông minh.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
            <div>
              <p className="text-2xl font-bold text-white">95%</p>
              <p className="text-xs text-slate-400 mt-0.5">Độ chuẩn xác</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-slate-400 mt-0.5">Sinh viên tin dùng</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-slate-400 mt-0.5">Nhà tuyển dụng</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-slate-400">
          © {new Date().getFullYear()} SkillMatch Inc. All rights reserved.
        </p>
      </section>

      {/* Right Form Panel */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand header */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Skill<span className="text-violet-600">Match</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Đăng nhập tài khoản
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Nhập email và mật khẩu để tiếp tục vào hệ thống.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="password">
                  Mật khẩu
                </label>
              </div>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
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
                  <span>Đăng nhập</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link className="font-semibold text-violet-600 hover:text-violet-700 transition" href="/auth/register">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
