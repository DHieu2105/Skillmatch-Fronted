"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Topbar";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" as const },
  { label: "Find Jobs", href: "/dashboard/jobs", icon: "search" as const },
  { label: "Applications", href: "/dashboard/applications", icon: "briefcase" as const },
  { label: "Recommendations", href: "/dashboard/recommendations", icon: "search" as const }
];

export default function StudentSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-[#17152d] px-5 py-7 text-white">
      <Link className="mb-12 flex items-center gap-2 px-2" href="/dashboard" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-lg font-black">S</span>
        <span className="text-xl font-bold tracking-tight">Skill<span className="text-violet-400">Match</span></span>
      </Link>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
      <nav className="space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`} href={item.href} key={item.href} onClick={onNavigate}>
              <Icon name={item.icon} size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-1">
        <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white" href="/dashboard/profile" onClick={onNavigate}>
          <Icon name="profile" size={19} /> My Profile
        </Link>
        <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white" href="/dashboard/settings" onClick={onNavigate}>
          <Icon name="settings" size={19} /> Settings
        </Link>
        <div className="mt-5 rounded-2xl bg-violet-500/10 p-4">
          <p className="text-sm font-semibold text-violet-200">Complete your profile</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Stand out to recruiters and find your perfect match.</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-3/5 rounded-full bg-violet-400" /></div>
          <p className="mt-2 text-right text-[11px] font-medium text-violet-300">60% complete</p>
        </div>
      </div>
    </aside>
  );
}