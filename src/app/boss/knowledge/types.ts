import type { Dayjs } from 'dayjs'
import { Knowledge, KnowledgeKind, KnowledgeLevel, Media } from '@prisma/client'

export type KnowledgeWithMedia = Knowledge & {
  media: Media[]
}

export interface KnowledgeFormValues {
  kind: KnowledgeKind
  title: string
  titleFr?: string | null
  issuer?: string | null
  issuerFr?: string | null
  category?: string | null
  categoryFr?: string | null
  description?: string | null
  descriptionFr?: string | null
  url?: string | null
  location?: string | null
  startDate?: Dayjs | string | null
  endDate?: Dayjs | string | null
  validUntil?: Dayjs | string | null
  isCurrent?: boolean
  competencyLevel?: KnowledgeLevel | null
}
