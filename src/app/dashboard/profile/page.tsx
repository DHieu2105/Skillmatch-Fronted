"use client";

import { useEffect, useState } from "react";

import { studentService } from "@/services/student.service";
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

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

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

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in to save your profile.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (profileExists) {
        await studentService.updateProfile(token, form);
        setSuccess("Profile updated successfully.");
      } else {
        await studentService.createProfile(token, form);
        setProfileExists(true);
        setSuccess("Profile created successfully.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <p className="text-sm font-semibold text-violet-600">Student Profile</p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Profile</h1>

        <p className="mt-2 text-sm text-slate-500">
          Keep your information updated to improve job recommendations.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(event) =>
                setForm({ ...form, full_name: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(event) =>
                setForm({ ...form, date_of_birth: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(event) =>
                setForm({ ...form, gender: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              University
            </label>
            <input
              type="text"
              value={form.university}
              onChange={(event) =>
                setForm({ ...form, university: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Major
            </label>
            <input
              type="text"
              value={form.major}
              onChange={(event) =>
                setForm({ ...form, major: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              GPA
            </label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.01"
              value={form.gpa}
              onChange={(event) =>
                setForm({ ...form, gpa: Number(event.target.value) })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Graduation Year
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Career Goal
          </label>
          <textarea
            rows={5}
            value={form.career_goal}
            onChange={(event) =>
              setForm({ ...form, career_goal: event.target.value })
            }
            placeholder="Describe your career goals..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          />
        </div>

        {error && <p className="mt-5 text-sm text-rose-600">{error}</p>}

        {success && (
          <p className="mt-5 text-sm text-emerald-600">{success}</p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : profileExists
                ? "Save Changes"
                : "Create Profile"}
          </button>
        </div>
      </section>
    </div>
  );
}
