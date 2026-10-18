"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import CVViewer from "@/components/cv/CVViewer";
import { applicationService } from "@/services/application.service";

import type { RecruiterApplication } from "@/types/application";

export default function RecruiterCVViewerPage() {
  const params = useParams<{ application_id: string }>();
  const applicationId = Number(params.application_id);

  const [application, setApplication] =
    useState<RecruiterApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplication() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) throw new Error("You must be signed in.");
        if (!Number.isInteger(applicationId) || applicationId <= 0) {
          throw new Error("Invalid application.");
        }

        const data = await applicationService.getRecruiterApplication(
          token,
          applicationId,
        );

        if (active) setApplication(data);
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error ? error.message : "Unable to load CV.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadApplication();

    return () => {
      active = false;
    };
  }, [applicationId]);

  const applicationHref = `/recruiter/applications/${applicationId}`;

  if (loading) {
    return <p className="text-sm text-slate-500">Loading CV...</p>;
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <Link
          href="/recruiter/applications"
          className="text-sm font-semibold text-amber-600"
        >
          &larr; Back to applications
        </Link>
        <p role="alert" className="text-sm text-rose-600">
          {error || "CV not found."}
        </p>
      </div>
    );
  }

  return (
    <CVViewer
      backHref={applicationHref}
      backLabel="Back to application"
      fileName={application.cv_file_name}
      fileUrl={application.cv_file_url}
      ownerName={application.student_name}
    />
  );
}
