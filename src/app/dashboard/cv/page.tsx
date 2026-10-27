"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";

import { cvService } from "@/services/cv.service";
import type { CV } from "@/types/cv";

export default function CVPage() {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [makeDefault, setMakeDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCVs = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await cvService.getCVs(token);
      setCVs(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    cvService
      .getCVs(token)
      .then((data) => {
        setCVs(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("CV file must be 10 MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in to upload a CV.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await cvService.uploadCV(token, selectedFile, makeDefault);
      setSelectedFile(null);
      setMakeDefault(false);
      setSuccess("CV uploaded successfully.");
      await loadCVs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (cvId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in to update your CV.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await cvService.setDefaultCV(token, cvId);
      setSuccess("Default CV updated.");
      await loadCVs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const handleDelete = async (cvId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be signed in to delete a CV.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await cvService.deleteCV(token, cvId);
      setSuccess("CV removed from your list.");
      await loadCVs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading CVs...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Career Documents
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">My CV</h1>

        <p className="mt-2 text-sm text-slate-500">
          Upload and manage the CVs used for job applications and
          recommendations.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Upload CV</h2>

        <p className="mt-1 text-sm text-slate-500">
          PDF only, maximum file size 10 MB.
        </p>

        <div className="mt-5">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600"
          />
        </div>

        {selectedFile && (
          <p className="mt-3 text-sm text-slate-600">
            Selected: {selectedFile.name}
          </p>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={makeDefault}
            onChange={(event) => setMakeDefault(event.target.checked)}
          />
          Set as default CV
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload CV"}
        </button>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        {success && (
          <p className="mt-4 text-sm text-emerald-600">{success}</p>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Your CVs</h2>

          <p className="mt-1 text-sm text-slate-500">
            The default CV is used for recommendations. You can switch the
            default between your uploaded CVs at any time.
          </p>
        </div>

        {cvs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-slate-900">No CV uploaded yet</p>

            <p className="mt-2 text-sm text-slate-500">
              Upload your first CV to start receiving recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cvs.map((cv) => (
              <div
                key={cv.cv_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">{cv.file_name}</p>

                      {cv.is_default && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Default
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/cv/${cv.cv_id}`}
                      className="mt-2 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700"
                    >
                      View CV
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!cv.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(cv.cv_id)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(cv.cv_id)}
                      className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
