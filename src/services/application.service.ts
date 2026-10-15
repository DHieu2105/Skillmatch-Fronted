import { apiFetch } from "@/lib/api";
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

  getMyApplications(token: string) {
    return apiFetch<StudentApplication[]>(
      "/api/v1/applications/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getRecruiterApplications(token: string) {
    return apiFetch<RecruiterApplication[]>("/api/v1/recruiter/applications", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getRecruiterApplication(token: string, applicationId: number) {
    return apiFetch<RecruiterApplication>(`/api/v1/recruiter/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateStatus(token: string, applicationId: number, status: ApplicationStatus) {
    return apiFetch<Application>(`/api/v1/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },
};
