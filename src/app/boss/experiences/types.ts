import { Experience, Company } from '@prisma/client';

export type ExperienceWithCompany = Experience & { company: Company };

export interface ExperienceFormData {
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  companyId: string;
}

export type TableColumnRender = (_: unknown, record: ExperienceWithCompany) => React.ReactNode;
