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
};