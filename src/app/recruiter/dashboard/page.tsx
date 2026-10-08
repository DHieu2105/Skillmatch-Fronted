"use client";

import RoleGuard from "@/components/auth/RoleGuard";

export default function RecruiterDashboardPage() {
  return (
    <RoleGuard allowedRole="RECRUITER">
      <div>
        <h1>Recruiter Dashboard</h1>
      </div>
    </RoleGuard>
  );
}