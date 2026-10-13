import { apiFetch } from "@/lib/api";

import type {
  SkillCreate,
  SkillUpdate,
  StudentSkill,
} from "@/types/skill";

const endpoint = "/api/v1/skills/skills";

export const skillService = {
  getStudentSkills(token: string) {
    return apiFetch<StudentSkill[]>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  addStudentSkill(token: string, data: SkillCreate) {
    return apiFetch<StudentSkill>(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateStudentSkill(
    token: string,
    skillId: number,
    data: SkillUpdate,
  ) {
    return apiFetch<StudentSkill>(`${endpoint}/${skillId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  deleteStudentSkill(token: string, skillId: number) {
    return apiFetch<StudentSkill>(`${endpoint}/${skillId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getMySkills(token: string) {
    return this.getStudentSkills(token);
  },

  addSkill(token: string, data: SkillCreate) {
    return this.addStudentSkill(token, data);
  },

  updateSkill(token: string, skillId: number, data: SkillUpdate) {
    return this.updateStudentSkill(token, skillId, data);
  },

  deleteSkill(token: string, skillId: number) {
    return this.deleteStudentSkill(token, skillId);
  },
};
