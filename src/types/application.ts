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