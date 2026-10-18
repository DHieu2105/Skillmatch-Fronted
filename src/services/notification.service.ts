import { apiFetch } from "@/lib/api";
import type { Notification } from "@/types/notification";

export const notificationService = {
  getNotifications(token: string) {
    return apiFetch<Notification[]>(
      "/api/v1/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  markAsRead(
    token: string,
    notificationId: number,
  ) {
    return apiFetch<Notification>(
      `/api/v1/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  markAllAsRead(token: string) {
    return apiFetch<Notification[]>(
      "/api/v1/notifications/read-all",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};
