import { apiFetch } from "@/lib/api";
import type { JobSkill, JobSkillCreate } from "@/types/job-skill";

export const jobSkillService = {
  addSkill(token: string, jobId: number, data: JobSkillCreate) {
    return apiFetch<JobSkill>(`/api/v1/jobs/${jobId}/skills`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  getSkills(token: string, jobId: number) {
    return apiFetch<JobSkill[]>(`/api/v1/jobs/${jobId}/skills`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateSkill(token: string, jobId: number, skillId: number, data: JobSkillCreate) {
    return apiFetch<JobSkill>(`/api/v1/jobs/${jobId}/skills/${skillId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  deleteSkill(token: string, jobId: number, skillId: number) {
    return apiFetch<{ message: string }>(`/api/v1/jobs/${jobId}/skills/${skillId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
