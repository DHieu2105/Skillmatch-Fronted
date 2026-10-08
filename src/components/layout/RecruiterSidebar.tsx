"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Topbar";

const navigation = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: "grid" as const },
  { label: "Post a Job", href: "/recruiter/jobs/new", icon: "briefcase" as const },
  { label: "Manage Jobs", href: "/recruiter/jobs", icon: "building" as const },
  { label: "Applications", href: "/recruiter/applications", icon: "profile" as const },
];

export default function RecruiterSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-[#17152d] px-5 py-7 text-white">
      <Link className="mb-12 flex items-center gap-2 px-2" href="/recruiter/dashboard" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-lg font-black">S</span>
        <span className="text-xl font-bold tracking-tight">Skill<span className="text-violet-400">Match</span></span>
      </Link>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Recruiter workspace</p>
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
        <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white" href="/recruiter/company" onClick={onNavigate}>
          <Icon name="building" size={19} /> Company Profile
        </Link>
        <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white" href="/recruiter/settings" onClick={onNavigate}>
          <Icon name="settings" size={19} /> Settings
        </Link>
        <div className="mt-5 rounded-2xl bg-violet-500/10 p-4">
          <p className="text-sm font-semibold text-violet-200">Need a hand?</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Our support team is here to help you hire better.</p>
          <Link className="mt-3 inline-block text-xs font-semibold text-violet-300 hover:text-violet-200" href="/recruiter/support">Contact support →</Link>
        </div>
      </div>
    </aside>
  );
}