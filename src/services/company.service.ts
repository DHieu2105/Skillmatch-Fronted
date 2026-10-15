import { apiFetch } from "@/lib/api";
import type { Company, CompanyForm } from "@/types/company";

export const companyService = {
  createCompany(token: string, data: CompanyForm) {
    return apiFetch<Company>("/api/v1/companies", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  getCompany(token: string, companyId: number) {
    return apiFetch<Company>(`/api/v1/companies/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateCompany(token: string, companyId: number, data: CompanyForm) {
    return apiFetch<Company>(`/api/v1/companies/${companyId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
};
