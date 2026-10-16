"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types/auth";

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="19"
      viewBox="0 0 24 24"
      width="19"
    >
      <path
        d="m3 6 9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="19"
      viewBox="0 0 24 24"
      width="19"
    >
      <rect
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="10"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="19"
      viewBox="0 0 24 24"
      width="19"
    >
      {hidden ? (
        <path
          d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1.1-1.3 2.5-2.6 3.7M6.2 6.2C4.2 7.6 2.9 9.6 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ) : (
        <>
          <path
            d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

const inputClass =
  "min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400";

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
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await authService.register({ email, password, role });
      router.replace("/auth/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#f8f9fc]">
      <section className="relative hidden overflow-hidden bg-[#17152d] px-12 py-10 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[56px] border-violet-500/10" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full border-[70px] border-violet-500/10" />

        <Link
          href="/"
          className="relative flex w-fit items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-xl font-black">
            S
          </span>
          <span className="text-2xl font-bold tracking-tight">
            Skill<span className="text-violet-400">Match</span>
          </span>
        </Link>

        <div className="relative max-w-lg pb-8">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
            Your next chapter starts here
          </p>
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Skills open doors. We help you find the right one.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            Create your SkillMatch account to discover opportunities or find
            the people who can move your company forward.
          </p>

          <div className="mt-10 grid gap-3 text-sm text-slate-300">
            <p>✓ Personalized job recommendations</p>
            <p>✓ Simple application tracking</p>
            <p>✓ One workspace for candidates and recruiters</p>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          © 2026 SkillMatch. All rights reserved.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[460px]">
          <Link
            href="/"
            className="mb-10 flex w-fit items-center gap-2 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white">
              S
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#17152d]">
              Skill<span className="text-violet-600">Match</span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
              Join SkillMatch
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create your account
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Choose how you want to use SkillMatch and enter your details.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">
                I want to join as
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(["STUDENT", "RECRUITER"] as const).map((item) => (
                  <label
                    key={item}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                      role === item
                        ? "border-violet-500 bg-violet-50 text-violet-700 ring-4 ring-violet-500/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      checked={role === item}
                      className="sr-only"
                      name="role"
                      onChange={() => setRole(item)}
                      type="radio"
                      value={item}
                    />
                    {item === "STUDENT" ? "Student" : "Recruiter"}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <span className="text-slate-400 group-focus-within:text-violet-500">
                  <MailIcon />
                </span>
                <input
                  autoComplete="email"
                  className={inputClass}
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <span className="text-slate-400 group-focus-within:text-violet-500">
                  <LockIcon />
                </span>
                <input
                  autoComplete="new-password"
                  className={inputClass}
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  <EyeIcon hidden={!showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="confirm-password"
              >
                Confirm password
              </label>
              <div className="group flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                <span className="text-slate-400 group-focus-within:text-violet-500">
                  <LockIcon />
                </span>
                <input
                  autoComplete="new-password"
                  className={inputClass}
                  id="confirm-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                />
              </div>
            </div>

            {error && (
              <p
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
