import { apiFetch } from "@/lib/api";
import type { Job } from "@/types/job";

export const jobService = {
  getJobs(token: string) {
    return apiFetch<Job[]>("/api/v1/jobs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};