 "use client";

import { useState } from "react";
import StudentSidebar from "@/components/layout/StudentSidebar";
import Topbar from "@/components/layout/Topbar";
import RoleGuard from "@/components/auth/RoleGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRole="STUDENT">
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f8f9fc]">
      <div className={`fixed inset-0 z-40 bg-slate-950/50 transition lg:hidden ${sidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <StudentSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      <div className="flex min-w-0 w-full flex-1 flex-col lg:pl-[260px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-5 sm:p-8">{children}</main>
      </div>
    </div>
    </RoleGuard>
  );
}