export interface Company {
  company_id: number;
  company_name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address?: string | null;
  google_map_url?: string | null;
  logo_url?: string | null;
  company_size?: string | null;
  industry?: string | null;
  benefits?: string | null;
}

export interface CompanyForm {
  company_name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address?: string;
  google_map_url?: string;
  logo_url?: string;
  company_size?: string;
  industry?: string;
  benefits?: string;
}
