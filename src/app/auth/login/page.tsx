"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/animation";
import { authService } from "@/services/auth.service";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: {
    credential: string;
  }) => {
    try {
      setIsSubmitting(true);
      setError("");
      const result = await authService.googleLogin(response.credential);

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
          : "Đăng nhập Google thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignInClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Open Google Account Chooser popup directly in a standard OAuth-sized popup window
      const width = 520;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        "https://accounts.google.com/AccountChooser",
        "GoogleSignIn",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`,
      );

      setError(
        "Đang mở cửa sổ Google. Để hoàn tất đăng nhập tự động bằng tài khoản Google đã chọn, bạn hãy cấu hình GOOGLE_CLIENT_ID vào file .env nhé!",
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      const result = await authService.login({
        email,
        password,
      });

      localStorage.removeItem("access_token");
      sessionStorage.setItem("access_token", result.access_token);

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
          <div className="relative flex items-center gap-3">
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
          </div>

          {/* Center Pitch & Visual Showcase */}
          <div className="relative max-w-lg space-y-7 my-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-bold text-fuchsia-300 backdrop-blur-md shadow-sm">
              <Zap className="h-3.5 w-3.5 text-pink-400" />
              <span>Nền tảng Tuyển dụng & Hướng nghiệp AI</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight leading-[1.15] sm:text-5xl">
              Kết nối kỹ năng với{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                cơ hội nghề nghiệp
              </span>{" "}
              chuẩn xác nhất.
            </h1>

            <p className="text-sm text-purple-200/80 leading-relaxed font-normal">
              Hệ thống tự động phân tích CV, tính điểm tương thích theo thời gian thực và giúp nhà tuyển dụng tìm đúng nhân tài trong tích tắc.
            </p>

            {/* Floating Glassmorphic Mini-Card Mockup */}
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4.5 backdrop-blur-xl shadow-2xl shadow-purple-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white font-black text-xs shadow-md">
                    AI
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Đối soát Hồ sơ Thông minh</p>
                    <p className="text-[11px] text-purple-200/70">Frontend Developer Intern</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
                  98% Match
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-purple-200">
                  React.js
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-purple-200">
                  TypeScript
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-purple-200">
                  Tailwind CSS
                </span>
                <span className="rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 px-2.5 py-1 text-[11px] font-bold text-pink-300">
                  +4 Kỹ năng
                </span>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-black text-white">96%</p>
                <p className="text-xs text-purple-300/70 mt-0.5 font-medium">Độ chuẩn xác</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">10K+</p>
                <p className="text-xs text-purple-300/70 mt-0.5 font-medium">Ứng viên tin cậy</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-xs text-purple-300/70 mt-0.5 font-medium">Doanh nghiệp</p>
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
            className="w-full max-w-[440px] rounded-3xl border border-white bg-white/95 p-8 sm:p-10 shadow-xl shadow-purple-950/5 backdrop-blur-xl"
          >
            {/* Mobile brand header */}
            <div className="mb-7 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-indigo-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Skill<span className="text-purple-600">Match</span>
              </span>
            </div>

            <div className="mb-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-100/80 mb-2">
                <Sparkles className="h-3 w-3 text-purple-600" />
                Chào mừng bạn trở lại
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                Đăng nhập tài khoản
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                Nhập email và mật khẩu hoặc tiếp tục qua tài khoản Google.
              </p>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={springs.snappy}
              type="button"
              onClick={handleGoogleSignInClick}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập với Google</span>
            </motion.button>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Hoặc với email
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="password">
                    Mật khẩu
                  </label>
                  {/* Quên mật khẩu link */}
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-bold text-purple-600 hover:text-pink-600 transition underline underline-offset-2"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                    id="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
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
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Register Link */}
            <p className="mt-7 text-center text-xs sm:text-sm text-slate-500 font-medium">
              Chưa có tài khoản?{" "}
              <Link
                className="font-bold text-purple-700 hover:text-pink-600 transition underline underline-offset-4"
                href="/auth/register"
              >
                Đăng ký tài khoản mới
              </Link>
            </p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
