import { Experience, Company, Media } from '@prisma/client';

export type ExperienceWithCompany = Experience & {
  company: Company;
  media?: Media[];
  homepageMedia?: Media[];
  cardMedia?: Media[];
};

export interface ExperienceFormData {
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  companyId: string;
}

export type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  experienceId: string;
};

export interface MediaApiResponse {
  id: string;
  url: string;
  type: string;
  experienceId: string | null;
  educationId: string | null;
  createdAt: Date;
}

export type TableColumnRender = (_: unknown, record: ExperienceWithCompany) => React.ReactNode;
