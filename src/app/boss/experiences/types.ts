import { Experience, Company, Media } from '@prisma/client';

export type ExperienceWithCompany = Experience & {
  company: Company;
  media?: Media[];
  homepageMedia?: Media[];
  cardMedia?: Media[];
  dateRanges?: ExperienceDateRange[];
};

export interface ExperienceDateRange {
  id: string;
  startDate: string;
  endDate: string | null;
  experienceId?: string;
  isCurrent?: boolean;
  error?: string;
}

export interface ExperienceFormData {
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  companyId: string;
  dateRanges: ExperienceDateRange[];
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
