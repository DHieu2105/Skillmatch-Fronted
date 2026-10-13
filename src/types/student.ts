export interface StudentProfile {
  student_id: number;
  user_id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  university: string;
  major: string;
  gpa: number;
  graduation_year: number;
  career_goal: string;
}

export interface StudentProfileForm {
  full_name: string;
  date_of_birth: string;
  gender: string;
  university: string;
  major: string;
  gpa: number;
  graduation_year: number;
  career_goal: string;
}

export interface ProfileCompletion {
  percentage: number;
  profile_fields_completed: number;
  profile_fields_total: number;
  has_cv: boolean;
  has_skills: boolean;
}
