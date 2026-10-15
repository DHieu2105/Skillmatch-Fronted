"use client";

import { useEffect, useState } from "react";
import { companyService } from "@/services/company.service";
import { recruiterService } from "@/services/recruiter.service";
import type { CompanyForm } from "@/types/company";
import type { RecruiterProfileForm } from "@/types/recruiter";

const initialCompany: CompanyForm = {
  company_name: "", description: "", email: "", phone: "", website: "",
};
const initialRecruiter: Omit<RecruiterProfileForm, "company_id"> = {
  full_name: "", phone: "", position: "",
};
const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400";

export default function RecruiterCompanyPage() {
  const [company, setCompany] = useState<CompanyForm>(initialCompany);
  const [recruiter, setRecruiter] = useState(initialRecruiter);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Please sign in to manage your company profile.");
        let profile;
        try {
          profile = await recruiterService.getProfile(token);
        } catch (error) {
          if (error instanceof Error && error.message === "Recruiter profile not found") return;
          throw error;
        }
        const companyData = await companyService.getCompany(token, profile.company_id);
        if (!active) return;
        setProfileExists(true);
        setCompanyId(profile.company_id);
        setRecruiter({ full_name: profile.full_name, phone: profile.phone, position: profile.position });
        setCompany({
          company_name: companyData.company_name,
          description: companyData.description,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website,
        });
      } catch (error) {
        if (!active) return;
        setLoadFailed(true);
        setError(error instanceof Error ? error.message : "Unable to load company profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please sign in to manage your company profile.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let savedCompanyId = companyId;
      if (savedCompanyId === null) {
        const createdCompany = await companyService.createCompany(token, company);
        savedCompanyId = createdCompany.company_id;
        setCompanyId(savedCompanyId);
      } else {
        await companyService.updateCompany(token, savedCompanyId, company);
      }
      await recruiterService.saveProfile(token, { ...recruiter, company_id: savedCompanyId });
      setProfileExists(true);
      setSuccess(profileExists ? "Profile updated successfully." : "Company and recruiter profile created successfully.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading company profile...</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section>
        <p className="text-sm font-semibold text-amber-600">Recruiter Setup</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Company Profile</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your company and recruiter information.</p>
      </section>
      <form onSubmit={(event) => { event.preventDefault(); void handleSave(); }} className="space-y-7">
        <fieldset disabled={saving || loadFailed} className="space-y-7 disabled:opacity-60">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Recruiter Information</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {([
                ["full_name", "Full name", "text"],
                ["phone", "Phone", "tel"],
                ["position", "Position", "text"],
              ] as const).map(([field, label, type]) => (
                <label key={field} className="space-y-2 text-sm text-slate-600">
                  <span>{label}</span>
                  <input type={type} placeholder={label} value={recruiter[field]}
                    onChange={(event) => setRecruiter({ ...recruiter, [field]: event.target.value })}
                    className={inputClass} />
                </label>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Company Information</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {([
                ["company_name", "Company name", "text"],
                ["email", "Company email", "email"],
                ["phone", "Phone", "tel"],
                ["website", "Website", "text"],
              ] as const).map(([field, label, type]) => (
                <label key={field} className="space-y-2 text-sm text-slate-600">
                  <span>{label}</span>
                  <input type={type} placeholder={label} value={company[field]}
                    onChange={(event) => setCompany({ ...company, [field]: event.target.value })}
                    className={inputClass} />
                </label>
              ))}
            </div>
            <label className="mt-5 block space-y-2 text-sm text-slate-600">
              <span>Company description</span>
              <textarea rows={5} placeholder="Company description" value={company.description}
                onChange={(event) => setCompany({ ...company, description: event.target.value })}
                className={inputClass} />
            </label>
          </section>
        </fieldset>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        {success && <p role="status" className="text-sm text-emerald-600">{success}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving || loadFailed}
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60">
            {saving ? "Saving..." : profileExists ? "Save Changes" : "Create Company"}
          </button>
        </div>
      </form>
    </div>
  );
}
