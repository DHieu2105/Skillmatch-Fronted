"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Star,
  Eye,
  AlertCircle,
  FileCheck,
} from "lucide-react";

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
      setError("Hệ thống chỉ hỗ trợ định dạng tệp PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("Kích thước tệp CV không được vượt quá 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Bạn cần đăng nhập để tải CV lên.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await cvService.uploadCV(token, selectedFile, makeDefault);
      setSelectedFile(null);
      setMakeDefault(false);
      setSuccess("Tải lên CV thành công! AI đang tiến hành trích xuất kỹ năng.");
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
      setError("Bạn cần đăng nhập để thực hiện.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await cvService.setDefaultCV(token, cvId);
      setSuccess("Đã đặt làm CV mặc định.");
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
      setError("Bạn cần đăng nhập để thực hiện.");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa CV này không?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await cvService.deleteCV(token, cvId);
      setSuccess("Đã xóa CV thành công.");
      await loadCVs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Header */}
      <section>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-2">
          <FileText className="h-3.5 w-3.5 text-violet-600" />
          Hồ sơ nghề nghiệp
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Quản lý CV của tôi
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tải lên và quản lý các bản CV dùng để ứng tuyển và kích hoạt thuật toán gợi ý việc làm từ AI.
        </p>
      </section>

      {/* Upload Box */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Tải lên CV mới</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Định dạng PDF tiêu chuẩn, dung lượng tối đa 10 MB.
        </p>

        <div className="mt-5">
          <label className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center transition hover:border-violet-400 hover:bg-violet-50/20 cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm transition group-hover:scale-110">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {selectedFile ? selectedFile.name : "Nhấp để chọn tệp PDF hoặc kéo thả vào đây"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {selectedFile
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                : "Hỗ trợ tệp tin định dạng .pdf"}
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={makeDefault}
              onChange={(event) => setMakeDefault(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Đặt làm CV mặc định cho hệ thống AI Matching
          </label>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {uploading ? "Đang tải lên..." : "Tải lên CV"}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </section>

      {/* CVs List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Danh sách CV của bạn</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            CV mặc định sẽ tự động được sử dụng khi gợi ý việc làm và nộp nhanh.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : cvs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có CV nào được tải lên</p>
            <p className="mt-1 text-xs text-slate-400">
              Hãy tải lên bản CV đầu tiên để bắt đầu nhận các cơ hội việc làm tốt nhất!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => (
              <div
                key={cv.cv_id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{cv.file_name}</span>
                      {cv.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                          <Star className="h-3 w-3 fill-emerald-600" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/cv/${cv.cv_id}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
                    >
                      <Eye className="h-3.5 w-3.5" /> Xem nội dung CV
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!cv.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(cv.cv_id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Star className="h-3.5 w-3.5 text-slate-400" />
                      Đặt làm mặc định
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(cv.cv_id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
