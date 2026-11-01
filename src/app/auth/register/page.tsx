"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/animation";

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
  Zap,
  Check,
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

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Initialize Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined" || !googleClientId) return;

    function initGoogle() {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
      }
    }

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId, role]);

  const handleGoogleCredentialResponse = async (response: {
    credential: string;
  }) => {
    try {
      setIsSubmitting(true);
      setError("");
      const result = await authService.googleLogin(response.credential, role);

      localStorage.removeItem("access_token");
      sessionStorage.setItem("access_token", result.access_token);

      const user = await authService.getMe(result.access_token);
      if (user.role === "STUDENT") {
        router.replace("/dashboard");
      } else if (user.role === "RECRUITER") {
        router.replace("/recruiter/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đăng ký bằng Google thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUpClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Open Google Account Chooser popup directly in standard OAuth popup window
      const width = 520;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        "https://accounts.google.com/AccountChooser",
        "GoogleSignUp",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`,
      );

      setError(
        "Đang mở cửa sổ Google. Để hoàn tất đăng ký tự động bằng tài khoản Google đã chọn, bạn hãy cấu hình GOOGLE_CLIENT_ID vào file .env nhé!",
      );
    }
  };

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
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <main className="flex min-h-screen bg-[#f5f6fb]">
        {/* Left Hero Panel (Nimbus Purple Ambient Mesh) */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#160627] via-[#2d0c43] via-[#451252] to-[#1a072c] px-12 py-12 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-20">
          {/* Glowing Orbs */}
          <div className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full bg-fuchsia-600/25 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-28 -left-28 h-[480px] w-[480px] rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <Link href="/" className="relative flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-indigo-500 shadow-lg shadow-purple-600/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                Skill<span className="bg-gradient-to-r from-fuchsia-400 to-pink-300 bg-clip-text text-transparent">Match</span>
              </span>
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-pink-300">
                AI 2.0
              </span>
            </div>
          </Link>

          {/* Center Pitch & Visual Highlights */}
          <div className="relative max-w-lg space-y-7 my-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-bold text-fuchsia-300 backdrop-blur-md shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-pink-400" />
              <span>Nền tảng Hướng nghiệp & Tuyển dụng Thông minh</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight leading-[1.15] sm:text-5xl">
              Kỹ năng mở lối.{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Cơ hội trong tay.
              </span>
            </h1>

            <p className="text-sm text-purple-200/80 leading-relaxed font-normal">
              Gia nhập cộng đồng hàng nghìn sinh viên và doanh nghiệp hàng đầu để bứt phá sự nghiệp ngay hôm nay.
            </p>

            {/* Feature List */}
            <div className="space-y-3 pt-2 text-sm text-purple-100/90 font-medium">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Khớp nối kỹ năng chính xác theo thời gian thực</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Quản lý hồ sơ ứng tuyển minh bạch, thông minh</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Hỗ trợ tạo CV chuyên nghiệp tích hợp trí tuệ nhân tạo</span>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-purple-300/70 mt-0.5 font-medium">Miễn phí trải nghiệm</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">10K+</p>
                <p className="text-xs text-purple-300/70 mt-0.5 font-medium">Hồ sơ đã tạo</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-xs text-purple-300/70 mt-0.5 font-medium">Nhà tuyển dụng</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="relative text-xs text-purple-300/60 font-medium">
            © {new Date().getFullYear()} SkillMatch Platform. Powered by AI Intelligence.
          </p>
        </section>

        {/* Right Form Panel */}
        <section className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.gentle}
            className="w-full max-w-[460px] rounded-3xl border border-white bg-white/95 p-8 sm:p-10 shadow-xl shadow-purple-950/5 backdrop-blur-xl"
          >
            {/* Mobile brand header */}
            <Link href="/" className="mb-7 flex w-fit items-center gap-2.5 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-indigo-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Skill<span className="text-purple-600">Match</span>
              </span>
            </Link>

            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-100/80 mb-2">
                <Sparkles className="h-3 w-3 text-purple-600" />
                Khởi đầu sự nghiệp
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                Tạo tài khoản mới
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                Chọn vai trò của bạn để nhận không gian làm việc chuyên biệt.
              </p>
            </div>

            {/* Google Sign Up Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={springs.snappy}
              type="button"
              onClick={handleGoogleSignUpClick}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng ký nhanh với Google</span>
            </motion.button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Hoặc với email
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Role Selection Cards */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bạn tham gia với tư cách
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Student Role Card */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springs.snappy}
                    onClick={() => setRole("STUDENT")}
                    className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-center transition-colors ${
                      role === "STUDENT"
                        ? "border-purple-600 bg-purple-50/60 shadow-md shadow-purple-600/10"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {role === "STUDENT" && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                        role === "STUDENT"
                          ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${role === "STUDENT" ? "text-purple-900" : "text-slate-800"}`}>
                        Sinh viên / Ứng viên
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Tìm việc & Tạo CV
                      </span>
                    </div>
                  </motion.button>

                  {/* Recruiter Role Card */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springs.snappy}
                    onClick={() => setRole("RECRUITER")}
                    className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-center transition-colors ${
                      role === "RECRUITER"
                        ? "border-pink-600 bg-pink-50/60 shadow-md shadow-pink-600/10"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {role === "RECRUITER" && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                        role === "RECRUITER"
                          ? "bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-sm"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${role === "RECRUITER" ? "text-pink-900" : "text-slate-800"}`}>
                        Nhà tuyển dụng
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Đăng tin & Tuyển dụng
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="email">
                  Địa chỉ Email
                </label>
                <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
                  <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
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
                <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
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
                    className="text-slate-400 hover:text-slate-600 transition p-1"
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
                  Xác nhận lại mật khẩu
                </label>
                <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
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

              {/* Error Message with AnimatePresence */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={springs.snappy}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-bold text-rose-700 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={springs.snappy}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5c1363] via-[#7d1470] to-[#b3196b] text-sm font-bold text-white shadow-lg shadow-purple-900/20 hover:opacity-95 hover:shadow-xl hover:shadow-purple-900/30 disabled:cursor-not-allowed disabled:opacity-60"
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
              </motion.button>
            </form>

            {/* Login Link */}
            <p className="mt-7 text-center text-xs sm:text-sm text-slate-500 font-medium">
              Đã có tài khoản?{" "}
              <Link
                className="font-bold text-purple-700 hover:text-pink-600 transition underline underline-offset-4"
                href="/auth/login"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
