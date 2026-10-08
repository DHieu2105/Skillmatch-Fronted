"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type IconName =
  | "bell"
  | "briefcase"
  | "building"
  | "chevron"
  | "grid"
  | "help"
  | "logout"
  | "menu"
  | "profile"
  | "search"
  | "settings";

export function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    briefcase: <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 7h16v13H4zM4 12h16M10 12v2h4v-2" />,
    building: <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2 21h20M8 7h2M8 11h2M8 15h2M12 7h2M12 11h2M12 15h2" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    help: <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20" />,
    logout: <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-4M15 21h4a2 2 0 0 0 2-2" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    profile: <path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />,
    search: <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />,
    settings: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.6 1.3Z" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const initials = user?.email?.slice(0, 1).toUpperCase() ?? "U";

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.replace("/auth/login");
  }

  return (
    <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <div className="flex items-center gap-4">
        <button
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Icon name="menu" />
        </button>
        <div className="hidden w-72 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-400 sm:flex">
          <Icon name="search" size={18} />
          <span>Search anything...</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button aria-label="Help" className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block" type="button">
          <Icon name="help" size={19} />
        </button>
        <button aria-label="Notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button">
          <Icon name="bell" size={19} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-white" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-32 truncate text-sm font-semibold text-slate-800">{user?.email ?? "My account"}</p>
            <p className="text-xs text-slate-400">{user?.role === "RECRUITER" ? "Recruiter" : "Student"}</p>
          </div>
          <button aria-label="Log out" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500" onClick={handleLogout} type="button">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}