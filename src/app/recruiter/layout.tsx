 "use client";

import { useState } from "react";
import RecruiterSidebar from "@/components/layout/RecruiterSidebar";
import Topbar from "@/components/layout/Topbar";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <div className={`fixed inset-0 z-40 bg-slate-950/50 transition lg:hidden ${sidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <RecruiterSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}