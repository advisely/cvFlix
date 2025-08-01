import { Certification } from '@prisma/client';

export interface CertificationFormData {
  name: string;
  issuer: string;
  issueDate: string;
}

export type TableColumnRender = (_: unknown, record: Certification) => React.ReactNode;
