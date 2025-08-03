export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  highlightId: string;
}

export interface MediaApiResponse {
  id: string;
  url: string;
  type: string;
  highlightId?: string;
}

export interface HighlightWithMedia {
  id: string;
  title: string;
  company: string;
  startDate: string;
  createdAt: string;
  media: MediaItem[];
}
