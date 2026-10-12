export interface Recommendation {
  recommendation_id: number;
  student_id: number;
  job_id: number;

  job_title: string;
  company_name: string;
  location: string;

  score: number;
  reason: string;
  matching_method: string;
  created_at: string;
  matched_skills: string[];
  missing_skills: string[];
}