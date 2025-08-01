import { Skill } from '@prisma/client';

export interface SkillFormData {
  name: string;
  category: string;
}

export type TableColumnRender = (_: unknown, record: Skill) => React.ReactNode;
