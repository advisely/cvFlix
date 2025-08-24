export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  experienceId: string | null;
  educationId: string | null;
  skillId: string | null;
  certificationId: string | null;
  highlightId: string | null;
  highlightHomepageId: string | null;
  highlightCardId: string | null;
  createdAt: Date;
}

export interface MediaApiResponse {
  id: string;
  url: string;
  type: string;
  experienceId?: string | null;
  educationId?: string | null;
  skillId?: string | null;
  certificationId?: string | null;
  highlightId?: string | null;
  highlightHomepageId?: string | null;
  highlightCardId?: string | null;
  createdAt: Date;
}

export interface HighlightWithMedia {
  id: string;
  title: string;
  titleFr: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    nameFr: string;
    logoUrl?: string | null;
  };
  description?: string | null;
  descriptionFr?: string | null;
  startDate: string;
  createdAt: string;
  media: MediaItem[];           // Legacy field for backward compatibility
  homepageMedia: MediaItem[];   // New field for homepage hero display
  cardMedia: MediaItem[];       // New field for popup card display
}

// Helper type for components that need to distinguish media types
export interface HighlightMedia {
  homepage?: MediaItem;         // Primary media for homepage hero
  card?: MediaItem[];          // Media array for popup card
  legacy?: MediaItem[];        // Legacy media for backward compatibility
}
