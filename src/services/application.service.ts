import { apiFetch } from "@/lib/api";
import type {
  Application,
  ApplicationCreate,
  StudentApplication,
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
};