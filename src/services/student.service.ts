import { apiFetch } from "@/lib/api";

import type {
  ProfileCompletion,
  StudentProfile,
  StudentProfileForm,
} from "@/types/student";

export const studentService = {
  getProfile(token: string) {
    return apiFetch<StudentProfile>("/api/v1/students/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createProfile(token: string, data: StudentProfileForm) {
    return apiFetch<StudentProfile>("/api/v1/students/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateProfile(token: string, data: StudentProfileForm) {
    return apiFetch<StudentProfile>("/api/v1/students/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  getProfileCompletion(token: string) {
    return apiFetch<ProfileCompletion>(
      "/api/v1/students/profile/completion",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};
