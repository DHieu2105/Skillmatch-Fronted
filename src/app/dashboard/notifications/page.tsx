"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
} from "lucide-react";

import { notificationService } from "@/services/notification.service";
import { notifyNotificationsUpdated } from "@/lib/notification-events";
import type { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setError("Bạn cần đăng nhập để xem thông báo.");
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

  const handleRead = async (notificationId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const updated = await notificationService.markAsRead(
        token,
        notificationId,
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.notification_id === notificationId
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
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setMarkingAll(true);

    try {
      await notificationService.markAllAsRead(token);

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

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-2">
            <Bell className="h-3.5 w-3.5 text-violet-600" />
            Cập nhật hệ thống
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Thông báo của bạn
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo mới chưa đọc.`
              : "Bạn đã xem hết tất cả thông báo."}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAll}
            onClick={handleReadAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            <span>{markingAll ? "Đang xử lý..." : "Đánh dấu tất cả là đã đọc"}</span>
          </button>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      <section className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Inbox className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-900">Chưa có thông báo nào</h3>
            <p className="mt-1 text-sm text-slate-400">
              Các thông tin cập nhật về đơn ứng tuyển và hoạt động sẽ được gửi tới bạn tại đây.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.notification_id}
              type="button"
              onClick={() =>
                !notification.is_read && handleRead(notification.notification_id)
              }
              className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 flex items-start gap-4 ${
                notification.is_read
                  ? "border-slate-200/90 bg-white shadow-sm hover:border-slate-300"
                  : "border-violet-200 bg-violet-50/40 shadow-sm hover:bg-violet-50/70"
              }`}
            >
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  notification.is_read
                    ? "bg-slate-100 text-slate-400"
                    : "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <span className="shrink-0 h-2 w-2 rounded-full bg-violet-600" />
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                  {notification.message}
                </p>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(notification.created_at).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </section>
    </div>
  );
}
