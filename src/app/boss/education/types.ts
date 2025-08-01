import { Education } from '@prisma/client';

export interface EducationFormData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
}

export type TableColumnRender = (_: unknown, record: Education) => React.ReactNode;
