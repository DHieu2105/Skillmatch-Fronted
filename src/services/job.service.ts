import { apiFetch } from "@/lib/api";
import type { Job, JobCreate, JobUpdate, JobStatus } from "@/types/job";

export const jobService = {
  getJobs(token: string) {
    return apiFetch<Job[]>("/api/v1/jobs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  searchJobs(
    token: string,
    filters: {
      title?: string;
      location?: string;
      job_type?: string;
      experience_level?: string;
    },
  ) {
    const params = new URLSearchParams();

    if (filters.title) {
      params.append("title", filters.title);
    }

    if (filters.location) {
      params.append("location", filters.location);
    }

    if (filters.job_type) {
      params.append("job_type", filters.job_type);
    }

    if (filters.experience_level) {
      params.append("experience_level", filters.experience_level);
    }

    return apiFetch<Job[]>(
      `/api/v1/jobs/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getJobById(token: string, jobId: number) {
    return apiFetch<Job>(`/api/v1/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createJob(token: string, data: JobCreate) {
    return apiFetch<Job>("/api/v1/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateJob(token: string, jobId: number, data: JobUpdate) {
    return apiFetch<Job>(`/api/v1/jobs/${jobId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  updateJobStatus(token: string, jobId: number, status: JobStatus) {
    return apiFetch<Job>(`/api/v1/jobs/${jobId}/status?status=${status}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deleteJob(token: string, jobId: number) {
    return apiFetch<{ message: string }>(`/api/v1/jobs/${jobId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
