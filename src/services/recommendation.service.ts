import { apiFetch } from "@/lib/api";
import { cleanJobTitle } from "@/lib/format";
import type { Recommendation } from "@/types/recommendation";

export const recommendationService = {
  async getRecommendations(token: string) {
    const data = await apiFetch<Recommendation[]>(
      "/api/v1/recommendations",
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

  async generateRecommendations(token: string) {
    const data = await apiFetch<Recommendation[]>(
      "/api/v1/recommendations/generate",
      {
        method: "POST",
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
};
