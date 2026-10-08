"use client";

import RoleGuard from "@/components/auth/RoleGuard";

export default function StudentDashboardPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <div>
        <h1>Student Dashboard</h1>
      </div>
    </RoleGuard>
  );
}