export const USER_UPDATED_EVENT = "skillmatch:user-updated";

export function notifyUserUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_UPDATED_EVENT));
  }
}

