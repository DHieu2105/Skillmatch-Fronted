import { apiFetch } from "@/lib/api";

import type {
  SkillCreate,
  SkillUpdate,
  Skill,
  StudentSkill,
} from "@/types/skill";

const endpoint = "/api/v1/skills";

export const skillService = {
  getCatalog(token: string) {
    return apiFetch<Skill[]>(`${endpoint}/catalog`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getMySkills(token: string) {
    return apiFetch<StudentSkill[]>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  addSkill(token: string, data: SkillCreate) {
    return apiFetch<StudentSkill>(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateSkill(token: string, skillId: number, data: SkillUpdate) {
    return apiFetch<StudentSkill>(`${endpoint}/${skillId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  deleteSkill(token: string, skillId: number) {
    return apiFetch<StudentSkill>(`${endpoint}/${skillId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
