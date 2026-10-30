"use client";

import { useState } from "react";
import RecruiterSidebar from "@/components/layout/RecruiterSidebar";
import Topbar from "@/components/layout/Topbar";
import RoleGuard from "@/components/auth/RoleGuard";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRole="RECRUITER">
      <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f5f6fb]">
        {/* Mobile drawer backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition lg:hidden ${
            sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <RecruiterSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        {/* Topbar with Nimbus Work-style purple gradient & tabs */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
