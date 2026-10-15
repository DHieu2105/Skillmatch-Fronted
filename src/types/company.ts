export interface Company {
  company_id: number;
  company_name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
}

export interface CompanyForm {
  company_name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
}
