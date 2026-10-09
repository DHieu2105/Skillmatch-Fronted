export type JobStatus = "OPEN" | "CLOSED";

export interface Job {
  job_id: number;
  company_id: number;
  company_name: string;

  title: string;
  description: string;
  location: string;
  salary: string;
  job_type: string;
  experience_level: string;
  deadline: string;
  status: JobStatus;
  created_at: string;
  update_at: string;
}