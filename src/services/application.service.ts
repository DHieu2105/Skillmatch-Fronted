import { apiFetch } from "@/lib/api";
import { cleanJobTitle } from "@/lib/format";
import type {
  Application,
  ApplicationCreate,
  StudentApplication,
  RecruiterApplication,
  ApplicationStatus,
} from "@/types/application";

export const applicationService = {
  apply(token: string, data: ApplicationCreate) {
    return apiFetch<Application>("/api/v1/applications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async getMyApplications(token: string) {
    const data = await apiFetch<StudentApplication[]>(
      "/api/v1/applications/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data.map((item) => ({
      ...item,
      job_title: cleanJobTitle(item.job_title),
    }));
  },

  async getRecruiterApplications(token: string) {
    const data = await apiFetch<RecruiterApplication[]>("/api/v1/recruiter/applications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.map((item) => ({
      ...item,
      job_title: cleanJobTitle(item.job_title),
    }));
  },

  async getRecruiterApplication(token: string, applicationId: number) {
    const data = await apiFetch<RecruiterApplication>(`/api/v1/recruiter/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      ...data,
      job_title: cleanJobTitle(data.job_title),
    };
  },

  updateStatus(token: string, applicationId: number, status: ApplicationStatus) {
    return apiFetch<Application>(`/api/v1/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },
};
