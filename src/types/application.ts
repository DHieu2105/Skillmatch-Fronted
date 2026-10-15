export type ApplicationStatus =
  | "APPLIED"
  | "REVIEWING"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

export interface ApplicationCreate {
  job_id: number;
  cv_id: number;
  cover_letter: string;
}

export interface Application {
  application_id: number;
  student_id: number;
  job_id: number;
  cv_id: number;
  cover_letter: string | null;
  status: string;
  applied_at: string;
  updated_at: string;
}

export interface StudentApplication extends Application {
  job_title: string;
  company_name: string;
  location: string;
}

export interface RecruiterApplication extends Application {
  student_name: string;
  student_email: string;
  university: string;
  major: string;
  gpa: number;
  graduation_year: number;
  career_goal: string;
  job_title: string;
  cv_file_name: string;
  cv_file_url: string;
}
