"use client";

import { useEffect, useState } from "react";

import { notificationService } from "@/services/notification.service";
import { notifyNotificationsUpdated } from "@/lib/notification-events";

import type { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setError("You must be signed in.");
        setLoading(false);
      });
      return;
    }

    notificationService
      .getNotifications(token)
      .then(setNotifications)
      .catch((error) => {
        if (error instanceof Error) {
          setError(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRead = async (
    notificationId: number,
  ) => {
    const token =
      localStorage.getItem("access_token");

    if (!token) return;

    try {
      const updated =
        await notificationService.markAsRead(
          token,
          notificationId,
        );

      setNotifications((current) =>
        current.map((notification) =>
          notification.notification_id ===
          notificationId
            ? updated
            : notification,
        ),
      );
      notifyNotificationsUpdated();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const handleReadAll = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) return;

    setMarkingAll(true);

    try {
      await notificationService.markAllAsRead(
        token,
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
      notifyNotificationsUpdated();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading notifications...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Updates
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAll}
            onClick={handleReadAll}
            className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 disabled:opacity-50"
          >
            {markingAll
              ? "Marking..."
              : "Mark all as read"}
          </button>
        )}
      </section>

      {error && (
        <p
          role="alert"
          className="text-sm text-rose-600"
        >
          {error}
        </p>
      )}

      {notifications.length === 0 &&
      !error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-slate-900">
            No notifications
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Updates about your applications will
            appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(
            (notification) => (
              <button
                key={
                  notification.notification_id
                }
                type="button"
                onClick={() =>
                  !notification.is_read &&
                  handleRead(
                    notification.notification_id,
                  )
                }
                className={`w-full rounded-2xl border p-5 text-left shadow-sm transition ${
                  notification.is_read
                    ? "border-slate-200 bg-white"
                    : "border-violet-200 bg-violet-50/50"
                }`}
              >
                <div className="flex gap-4">
                  {!notification.is_read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                  )}

                  <div>
                    <p className="font-semibold text-slate-900">
                      {notification.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(
                        notification.created_at,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
