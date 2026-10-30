"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Phone,
  Globe,
  Mail,
  Briefcase,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { companyService } from "@/services/company.service";
import { recruiterService } from "@/services/recruiter.service";
import type { CompanyForm } from "@/types/company";
import type { RecruiterProfileForm } from "@/types/recruiter";

const initialCompany: CompanyForm = {
  company_name: "",
  description: "",
  email: "",
  phone: "",
  website: "",
};
const initialRecruiter: Omit<RecruiterProfileForm, "company_id"> = {
  full_name: "",
  phone: "",
  position: "",
};

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
        if (!token)
          throw new Error("Bạn cần đăng nhập để quản lý thông tin doanh nghiệp.");
        let profile;
        try {
          profile = await recruiterService.getProfile(token);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Recruiter profile not found"
          )
            return;
          throw error;
        }
        const companyData = await companyService.getCompany(
          token,
          profile.company_id,
        );
        if (!active) return;
        setProfileExists(true);
        setCompanyId(profile.company_id);
        setRecruiter({
          full_name: profile.full_name,
          phone: profile.phone,
          position: profile.position,
        });
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
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải hồ sơ công ty.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn cần đăng nhập để lưu thông tin.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let savedCompanyId = companyId;
      if (savedCompanyId === null) {
        const createdCompany = await companyService.createCompany(
          token,
          company,
        );
        savedCompanyId = createdCompany.company_id;
        setCompanyId(savedCompanyId);
      } else {
        await companyService.updateCompany(token, savedCompanyId, company);
      }
      await recruiterService.saveProfile(token, {
        ...recruiter,
        company_id: savedCompanyId,
      });
      setProfileExists(true);
      setSuccess(
        profileExists
          ? "Cập nhật hồ sơ công ty thành công!"
          : "Khởi tạo thông tin công ty và nhà tuyển dụng thành công!",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể lưu hồ sơ công ty.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Header */}
      <section>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
          <Building2 className="h-3.5 w-3.5 text-amber-600" />
          Hồ sơ doanh nghiệp
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Thông tin công ty
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin thương hiệu công ty và danh tính nhà tuyển dụng để tạo uy tín với ứng viên.
        </p>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
        className="space-y-6"
      >
        <fieldset
          disabled={saving || loadFailed}
          className="space-y-6 disabled:opacity-60"
        >
          {/* Recruiter info */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-amber-600" />
              Thông tin người đại diện tuyển dụng
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={recruiter.full_name}
                  onChange={(event) =>
                    setRecruiter({ ...recruiter, full_name: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={recruiter.phone}
                  onChange={(event) =>
                    setRecruiter({ ...recruiter, phone: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chức vụ / Vị trí
                </label>
                <input
                  type="text"
                  placeholder="HR Manager, Talent Acquisition..."
                  value={recruiter.position}
                  onChange={(event) =>
                    setRecruiter({ ...recruiter, position: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>
            </div>
          </section>

          {/* Company info */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="h-4 w-4 text-amber-600" />
              Thông tin công ty / Tổ chức
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tên công ty
                </label>
                <input
                  type="text"
                  placeholder="Công ty Cổ phần Công nghệ..."
                  value={company.company_name}
                  onChange={(event) =>
                    setCompany({ ...company, company_name: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email liên hệ doanh nghiệp
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={company.email}
                  onChange={(event) =>
                    setCompany({ ...company, email: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Hotline công ty
                </label>
                <input
                  type="tel"
                  placeholder="024 1234 5678"
                  value={company.phone}
                  onChange={(event) =>
                    setCompany({ ...company, phone: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Website chính thức
                </label>
                <input
                  type="text"
                  placeholder="https://company.vn"
                  value={company.website}
                  onChange={(event) =>
                    setCompany({ ...company, website: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Giới thiệu về doanh nghiệp & Văn hóa làm việc
              </label>
              <textarea
                rows={4}
                placeholder="Mô tả môi trường, sứ mệnh, phúc lợi nổi bật để thu hút ứng viên..."
                value={company.description}
                onChange={(event) =>
                  setCompany({ ...company, description: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
              />
            </div>
          </section>
        </fieldset>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || loadFailed}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-amber-500/25 transition hover:shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>
              {saving
                ? "Đang lưu..."
                : profileExists
                  ? "Lưu thay đổi"
                  : "Tạo hồ sơ công ty"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
