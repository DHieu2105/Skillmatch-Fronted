"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import CVViewer from "@/components/cv/CVViewer";
import { cvService } from "@/services/cv.service";

import type { CV } from "@/types/cv";

export default function StudentCVViewerPage() {
  const params = useParams<{ cv_id: string }>();
  const cvId = Number(params.cv_id);

  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCV() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) throw new Error("You must be signed in.");
        if (!Number.isInteger(cvId) || cvId <= 0) {
          throw new Error("Invalid CV.");
        }

        const cvs = await cvService.getCVs(token);
        const selectedCV = cvs.find((item) => item.cv_id === cvId);

        if (!selectedCV) throw new Error("CV not found.");
        if (active) setCV(selectedCV);
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

    void loadCV();

    return () => {
      active = false;
    };
  }, [cvId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading CV...</p>;
  }

  if (error || !cv) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/cv"
          className="text-sm font-semibold text-violet-600"
        >
          &larr; Back to My CV
        </Link>
        <p role="alert" className="text-sm text-rose-600">
          {error || "CV not found."}
        </p>
      </div>
    );
  }

  return (
    <CVViewer
      backHref="/dashboard/cv"
      backLabel="Back to My CV"
      fileName={cv.file_name}
      fileUrl={cv.file_url}
    />
  );
}
