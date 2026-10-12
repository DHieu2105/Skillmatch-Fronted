import { apiFetch } from "@/lib/api";
import type { Recommendation } from "@/types/recommendation";

export const recommendationService = {
  getRecommendations(token: string) {
    return apiFetch<Recommendation[]>(
      "/api/v1/recommendations",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  generateRecommendations(token: string) {
    return apiFetch<Recommendation[]>(
      "/api/v1/recommendations/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};