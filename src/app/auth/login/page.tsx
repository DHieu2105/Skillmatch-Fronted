"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

function MailIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
      <path d="m3 6 9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
      <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
      {hidden ? (
        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1.1-1.3 2.5-2.6 3.7M6.2 6.2C4.2 7.6 2.9 9.6 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ) : (
        <>
          <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);

      const result = await authService.login({
        email,
        password,
      });

      localStorage.setItem(
        "access_token",
        result.access_token
      );

      const user = await authService.getMe(
        result.access_token
      );

      if (user.role === "STUDENT") {
        router.replace("/dashboard");
      } else if (user.role === "RECRUITER") {
        router.replace("/recruiter/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#f8f9fc]">
      <section className="relative hidden overflow-hidden bg-[#17152d] px-12 py-10 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[56px] border-violet-500/10" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full border-[70px] border-violet-500/10" />
        <div className="relative flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-xl font-black">S</span>
          <span className="text-2xl font-bold tracking-tight">Skill<span className="text-violet-400">Match</span></span>
        </div>
        <div className="relative max-w-lg pb-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#17152d] bg-amber-200 text-xs font-bold text-amber-800">A</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#17152d] bg-sky-200 text-xs font-bold text-sky-800">M</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#17152d] bg-rose-200 text-xs font-bold text-rose-800">K</span>
            </div>
            <p className="text-sm text-slate-300"><span className="font-semibold text-white">10,000+</span> people growing their careers</p>
          </div>
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">Find work that fits <span className="text-violet-400">who you are.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">Connect your skills with meaningful opportunities and build the career you&apos;ve always wanted.</p>
          <div className="mt-10 flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full bg-violet-400" />
            <span className="h-1.5 w-2 rounded-full bg-slate-600" />
            <span className="h-1.5 w-2 rounded-full bg-slate-600" />
          </div>
        </div>
        <p className="relative text-xs text-slate-500">© 2025 SkillMatch. All rights reserved.</p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white">S</span>
              <span className="text-2xl font-bold tracking-tight text-[#17152d]">Skill<span className="text-violet-600">Match</span></span>
            </div>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">Welcome back</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Sign in to your account</h2>
            <p className="mt-3 text-sm text-slate-500">Enter your details to continue your journey with SkillMatch.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">Email address</label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <span className="text-slate-400 group-focus-within:text-violet-500"><MailIcon /></span>
                <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                <button className="text-xs font-semibold text-violet-600 hover:text-violet-700" type="button">Forgot password?</button>
              </div>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <span className="text-slate-400 group-focus-within:text-violet-500"><LockIcon /></span>
                <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" id="password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type={showPassword ? "text" : "password"} value={password} />
                <button aria-label={showPassword ? "Hide password" : "Show password"} className="text-slate-400 hover:text-slate-600" onClick={() => setShowPassword((visible) => !visible)} type="button"><EyeIcon hidden={!showPassword} /></button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
              <input checked={rememberMe} className="h-4 w-4 rounded border-slate-300 accent-violet-600" onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" />
              Remember me
            </label>

            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600" role="alert">{error}</p>}

            <button className="flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <button className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" type="button">
            <span className="text-base font-bold text-[#4285f4]">G</span>
            Continue with Google
          </button>
          <p className="mt-8 text-center text-sm text-slate-500">Don&apos;t have an account? <button className="font-semibold text-violet-600 hover:text-violet-700" type="button">Create an account</button></p>
        </div>
      </section>
    </main>
  );
}