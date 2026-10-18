export const NOTIFICATIONS_UPDATED_EVENT =
  "skillmatch:notifications-updated";

export function notifyNotificationsUpdated() {
  window.dispatchEvent(
    new Event(NOTIFICATIONS_UPDATED_EVENT),
  );
}
