import { apiFetch } from "@/lib/api";
import type { RecruiterProfile, RecruiterProfileForm } from "@/types/recruiter";

export const recruiterService = {
  getProfile(token: string) {
    return apiFetch<RecruiterProfile>("/api/v1/recruiters/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  saveProfile(token: string, data: RecruiterProfileForm) {
    return apiFetch<RecruiterProfile>("/api/v1/recruiters/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
};
