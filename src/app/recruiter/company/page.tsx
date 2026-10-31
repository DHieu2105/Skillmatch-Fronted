"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Phone,
  Globe,
  Mail,
  Briefcase,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  X,
  Users,
  Layers,
  Sparkles,
  Navigation,
  Gift,
  Check,
  ShieldCheck,
} from "lucide-react";
import { notifyUserUpdated } from "@/lib/auth-events";
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
  address: "",
  google_map_url: "",
  company_size: "",
  industry: "",
  benefits: "",
};

const initialRecruiter: Omit<RecruiterProfileForm, "company_id"> = {
  full_name: "",
  phone: "",
  position: "",
};

type SectionKey = "recruiter" | "branding" | "location" | "about";

const popularIndustries = [
  "Công nghệ thông tin / Phần mềm",
  "Thương mại điện tử / Bán lẻ",
  "Tài chính - Ngân hàng / Fintech",
  "Marketing & Truyền thông số",
  "Giáo dục & Đào tạo (EdTech)",
  "Logistics & Vận tải",
  "Sản xuất & Công nghiệp",
  "Y tế & Sức khỏe",
];

const popularSizes = [
  "Dưới 20 nhân viên",
  "20 - 50 nhân viên",
  "50 - 150 nhân viên",
  "150 - 500 nhân viên",
  "Trên 500 nhân viên",
];

const presetBenefits = [
  "Lương tháng 13",
  "Bảo hiểm sức khỏe VIP",
  "Cấp MacBook / Laptop",
  "Du lịch hằng năm",
  "Giờ làm linh hoạt (Hybrid)",
  "Thưởng hiệu quả dự án",
  "Trợ cấp ăn trưa & gửi xe",
  "Đào tạo & chứng chỉ quốc tế",
];

export default function RecruiterCompanyPage() {
  const [company, setCompany] = useState<CompanyForm>(initialCompany);
  const [recruiter, setRecruiter] = useState(initialRecruiter);
  const [backupCompany, setBackupCompany] = useState<CompanyForm>(initialCompany);
  const [backupRecruiter, setBackupRecruiter] = useState(initialRecruiter);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
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
          ) {
            setProfileExists(false);
            return;
          }
          throw error;
        }

        const companyData = await companyService.getCompany(
          token,
          profile.company_id,
        );

        if (!active) return;
        setProfileExists(true);
        notifyUserUpdated();
        setCompanyId(profile.company_id);

        const loadedRecruiter = {
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          position: profile.position || "",
        };

        const loadedCompany = {
          company_name: companyData.company_name || "",
          description: companyData.description || "",
          email: companyData.email || "",
          phone: companyData.phone || "",
          website: companyData.website || "",
          address: companyData.address || "",
          google_map_url: companyData.google_map_url || "",
          company_size: companyData.company_size || "",
          industry: companyData.industry || "",
          benefits: companyData.benefits || "",
        };

        setRecruiter(loadedRecruiter);
        setCompany(loadedCompany);
        setBackupRecruiter(loadedRecruiter);
        setBackupCompany(loadedCompany);
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

  const handleStartEdit = (section: SectionKey) => {
    setError("");
    setSuccess("");
    setBackupCompany({ ...company });
    setBackupRecruiter({ ...recruiter });
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setCompany({ ...backupCompany });
    setRecruiter({ ...backupRecruiter });
    setEditingSection(null);
    setError("");
  };

  const handleSaveSection = async (section: SectionKey) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn cần đăng nhập để lưu thông tin.");
      return;
    }

    setSavingSection(section);
    setError("");
    setSuccess("");

    try {
      let savedCompanyId = companyId;

      // If company doesn't exist yet, create company first
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

      // Always ensure recruiter profile is synced
      await recruiterService.saveProfile(token, {
        ...recruiter,
        company_id: savedCompanyId,
      });

      setProfileExists(true);
      notifyUserUpdated();
      setBackupCompany({ ...company });
      setBackupRecruiter({ ...recruiter });
      setEditingSection(null);

      const sectionNames: Record<SectionKey, string> = {
        recruiter: "thông tin người đại diện",
        branding: "thương hiệu & thông tin công ty",
        location: "địa điểm & bản đồ",
        about: "giới thiệu & văn hóa đãi ngộ",
      };

      setSuccess(`Cập nhật ${sectionNames[section]} thành công!`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu thông tin. Vui lòng thử lại.",
      );
    } finally {
      setSavingSection(null);
    }
  };

  const toggleBenefit = (item: string) => {
    const currentList = company.benefits
      ? company.benefits.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let updatedList: string[];
    if (currentList.includes(item)) {
      updatedList = currentList.filter((s) => s !== item);
    } else {
      updatedList = [...currentList, item];
    }
    setCompany({ ...company, benefits: updatedList.join(", ") });
  };

  // Google Maps address for iframe embed
  const mapSearchQuery = company.address?.trim() || company.company_name?.trim();
  const mapEmbedUrl = mapSearchQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";

  const directMapUrl =
    company.google_map_url?.trim() ||
    (mapSearchQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`
      : "");

  const benefitsList = company.benefits
    ? company.benefits.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">
      {/* 1. Page Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 mb-2 border border-amber-200/60">
            <Building2 className="h-3.5 w-3.5 text-amber-600" />
            <span>Hồ sơ & Thương hiệu tuyển dụng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Thông tin công ty
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Cung cấp đầy đủ vị trí địa chỉ, giới thiệu và người đại diện giúp nâng cao uy tín với ứng viên.
          </p>
        </div>
      </section>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: THÔNG TIN NGƯỜI ĐẠI DIỆN TUYỂN DỤNG              */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md shadow-amber-500/25">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Người đại diện tuyển dụng
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin cá nhân liên hệ trực tiếp với ứng viên
              </p>
            </div>
          </div>

          {editingSection !== "recruiter" ? (
            <button
              type="button"
              onClick={() => handleStartEdit("recruiter")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingSection === "recruiter"}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveSection("recruiter")}
                disabled={savingSection === "recruiter"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:shadow-lg disabled:opacity-50"
              >
                {savingSection === "recruiter" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>

        {/* View mode */}
        {editingSection !== "recruiter" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Họ và tên
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {recruiter.full_name || <span className="text-slate-400 italic">Chưa cập nhật</span>}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Số điện thoại
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Phone className="h-3.5 w-3.5 text-amber-600" />
                <span>{recruiter.phone || <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Chức vụ / Vị trí
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                <span>{recruiter.position || <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Edit mode */
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={recruiter.full_name}
                onChange={(e) => setRecruiter({ ...recruiter, full_name: e.target.value })}
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
                onChange={(e) => setRecruiter({ ...recruiter, phone: e.target.value })}
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
                onChange={(e) => setRecruiter({ ...recruiter, position: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: THÔNG TIN CÔNG TY & THƯƠNG HIỆU                   */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/25">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Thương hiệu & Thông tin doanh nghiệp
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tên công ty, quy mô, lĩnh vực và các kênh liên hệ
              </p>
            </div>
          </div>

          {editingSection !== "branding" ? (
            <button
              type="button"
              onClick={() => handleStartEdit("branding")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingSection === "branding"}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveSection("branding")}
                disabled={savingSection === "branding"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition hover:shadow-lg disabled:opacity-50"
              >
                {savingSection === "branding" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>

        {/* View mode */}
        {editingSection !== "branding" ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-purple-50/30 to-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-xl font-black text-white shadow-md shadow-violet-500/20">
                  {company.company_name?.slice(0, 2).toUpperCase() || "CO"}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {company.company_name || <span className="text-slate-400 italic">Tên công ty chưa đặt</span>}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      <Layers className="h-3 w-3" />
                      {company.industry || "Chưa chọn ngành"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      <Users className="h-3 w-3" />
                      {company.company_size || "Quy mô chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Email liên hệ
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                  <Mail className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <a href={`mailto:${company.email}`} className="truncate hover:text-violet-600">
                    {company.email || <span className="text-slate-400 italic font-normal">Chưa có email</span>}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hotline công ty
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Phone className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <a href={`tel:${company.phone}`} className="hover:text-violet-600">
                    {company.phone || <span className="text-slate-400 italic font-normal">Chưa có hotline</span>}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Website chính thức
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                  <Globe className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  {company.website ? (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-violet-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{company.website}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic font-normal">Chưa có website</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit mode */
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tên công ty / Doanh nghiệp
                </label>
                <input
                  type="text"
                  placeholder="Công ty Cổ phần Công nghệ ABC..."
                  value={company.company_name}
                  onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Lĩnh vực hoạt động
                </label>
                <select
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
                >
                  {popularIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quy mô nhân sự
                </label>
                <select
                  value={company.company_size}
                  onChange={(e) => setCompany({ ...company, company_size: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
                >
                  {popularSizes.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email liên hệ doanh nghiệp
                </label>
                <input
                  type="email"
                  placeholder="tuyendung@abc.com"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
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
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Website chính thức
                </label>
                <input
                  type="text"
                  placeholder="https://abc.com"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: ĐỊA CHỈ & VỊ TRÍ GOOGLE MAPS                      */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-pink-500/25">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Địa điểm làm việc & Bản đồ Google Maps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vị trí chính xác giúp ứng viên thuận tiện di chuyển khi đi phỏng vấn
              </p>
            </div>
          </div>

          {editingSection !== "location" ? (
            <button
              type="button"
              onClick={() => handleStartEdit("location")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingSection === "location"}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveSection("location")}
                disabled={savingSection === "location"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-pink-500/25 transition hover:shadow-lg disabled:opacity-50"
              >
                {savingSection === "location" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>

        {/* View mode */}
        {editingSection !== "location" ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Địa chỉ trụ sở công ty
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {company.address || (
                      <span className="text-slate-400 italic font-normal">
                        Chưa có địa chỉ. Bấm &quot;Chỉnh sửa&quot; để thêm địa chỉ và tự động kích hoạt Google Maps.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {directMapUrl && (
                <a
                  href={directMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Chỉ đường trên Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Interactive Google Map Preview */}
            {mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner bg-slate-100 relative">
                <iframe
                  title="Bản đồ Google Maps trụ sở công ty"
                  src={mapEmbedUrl}
                  className="h-64 sm:h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400">
                <Navigation className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Chưa có vị trí bản đồ</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Điền địa chỉ hoặc link Google Maps để nhúng bản đồ trực tiếp tại đây.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Edit mode */
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Địa chỉ trụ sở cụ thể
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ví dụ: Tòa nhà Keangnam, Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội"
                  value={company.address || ""}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-medium"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                💡 Hệ thống sẽ tự động tìm kiếm và nhúng bản đồ Google Maps tương ứng với địa chỉ bạn nhập.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Link Google Maps tùy chọn (Nút chỉ đường)
              </label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... (tùy chọn)"
                  value={company.google_map_url || ""}
                  onChange={(e) => setCompany({ ...company, google_map_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-medium"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Nếu công ty bạn đã có ghim riêng trên Google Maps, dán liên kết chia sẻ từ Google Maps vào đây.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: GIỚI THIỆU & VĂN HÓA, PHÚC LỢI                   */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-7 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Giới thiệu, Văn hóa & Đãi ngộ nổi bật
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Môi trường làm việc và các chính sách giữ chân nhân tài
              </p>
            </div>
          </div>

          {editingSection !== "about" ? (
            <button
              type="button"
              onClick={() => handleStartEdit("about")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingSection === "about"}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveSection("about")}
                disabled={savingSection === "about"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg disabled:opacity-50"
              >
                {savingSection === "about" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>

        {/* View mode */}
        {editingSection !== "about" ? (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Giới thiệu doanh nghiệp & Tầm nhìn
              </p>
              <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {company.description || (
                  <span className="text-slate-400 italic">
                    Chưa có bài giới thiệu. Bấm &quot;Chỉnh sửa&quot; để viết đôi lời về môi trường và cơ hội làm việc tại công ty.
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Phúc lợi & Chế độ đãi ngộ
              </p>
              {benefitsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {benefitsList.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200/60"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                      {benefit}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa chọn phúc lợi nổi bật. Bấm &quot;Chỉnh sửa&quot; để chọn các chế độ đãi ngộ.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Edit mode */
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mô tả giới thiệu doanh nghiệp
              </label>
              <textarea
                rows={5}
                placeholder="Mô tả về lịch sử, sứ mệnh, môi trường làm việc và cơ hội thăng tiến cho nhân sự..."
                value={company.description}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 leading-relaxed"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Phúc lợi đãi ngộ (Bấm chọn nhanh hoặc nhập cách nhau bởi dấu phẩy)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {presetBenefits.map((item) => {
                  const isSelected = benefitsList.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleBenefit(item)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : <span>+</span>}
                      {item}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="Nhập thêm phúc lợi khác (cách nhau bởi dấu phẩy)..."
                value={company.benefits || ""}
                onChange={(e) => setCompany({ ...company, benefits: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
