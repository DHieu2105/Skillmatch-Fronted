export interface RecruiterProfile {
  recruiter_id: number;
  user_id: number;
  full_name: string;
  phone: string;
  position: string;
  company_id: number;
}

export interface RecruiterProfileForm {
  full_name: string;
  phone: string;
  position: string;
  company_id: number;
}
