"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import type { FormEvent } from "react";
import { authService } from "@/services/auth.service";
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-[460px] rounded-3xl border border-white bg-white/95 p-8 sm:p-10 shadow-2xl shadow-purple-950/5 backdrop-blur-xl">
      <div className="mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5c1363] via-[#7d1470] to-[#b3196b] text-white shadow-md shadow-purple-900/20 mb-4">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Đặt lại mật khẩu mới
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium">
          Vui lòng nhập mật khẩu mới để bảo vệ tài khoản của bạn.
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-900">
              Đổi mật khẩu thành công!
            </h3>
            <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
              Mật khẩu mới của bạn đã được cập nhật. Bạn có thể đăng nhập vào hệ thống ngay bây giờ.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5c1363] via-[#7d1470] to-[#b3196b] text-xs font-bold text-white shadow-md shadow-purple-900/20 transition hover:opacity-95"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form className="space-y-4.5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="newPassword">
              Mật khẩu mới
            </label>
            <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
              <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                id="newPassword"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                type={showPassword ? "text" : "password"}
                value={newPassword}
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

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="confirmPassword">
              Xác nhận lại mật khẩu mới
            </label>
            <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
              <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                id="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5c1363] via-[#7d1470] to-[#b3196b] text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all duration-200 hover:opacity-95 hover:shadow-xl hover:shadow-purple-900/30 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>Xác nhận mật khẩu mới</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb] p-6 sm:p-12">
      <div className="fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-center font-bold text-slate-500">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

