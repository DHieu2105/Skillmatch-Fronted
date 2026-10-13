import { apiFetch } from "@/lib/api";
import type { CV } from "@/types/cv";

export const cvService = {
  getCVs(token: string) {
    return apiFetch<CV[]>("/api/v1/cvs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  uploadCV(token: string, file: File, isDefault: boolean) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("is_default", String(isDefault));

    return apiFetch<CV>("/api/v1/cvs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  setDefaultCV(token: string, cvId: number) {
    return apiFetch<CV>(`/api/v1/cvs/${cvId}/default`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_default: true,
      }),
    });
  },

  deleteCV(token: string, cvId: number) {
    return apiFetch<CV>(`/api/v1/cvs/${cvId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};