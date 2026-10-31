"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { authService } from "@/services/auth.service";
import {
  Mail,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb] p-6 sm:p-12">
      {/* Background Ambient Glow */}
      <div className="fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[460px] rounded-3xl border border-white bg-white/95 p-8 sm:p-10 shadow-2xl shadow-purple-950/5 backdrop-blur-xl">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 transition mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại trang Đăng nhập</span>
        </Link>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5c1363] via-[#7d1470] to-[#b3196b] text-white shadow-md shadow-purple-900/20 mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Quên mật khẩu?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            Đừng lo lắng! Nhập địa chỉ email tài khoản của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu mới.
          </p>
        </div>

        {isSent ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">
                Đã gửi email khôi phục!
              </h3>
              <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam).
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Gửi lại email khác
              </button>

              <Link
                href="/auth/login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5c1363] via-[#7d1470] to-[#b3196b] text-xs font-bold text-white shadow-md shadow-purple-900/20 transition hover:opacity-95"
              >
                <span>Về trang Đăng nhập</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4.5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="email">
                Địa chỉ Email đã đăng ký
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 transition focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-600/10">
                <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
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
                  <span>Gửi link đặt lại mật khẩu</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

