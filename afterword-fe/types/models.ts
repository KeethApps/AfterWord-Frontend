export type EnrichmentStatus = 'unenriched' | 'pending' | 'completed' | 'failed';

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  isbn?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
  enrichmentStatus: EnrichmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  userId: string;
  highlightText: string;
  location?: string | null;
  pageNumber?: number | null;
  embedding?: string | null;
  embeddingModel?: string | null;
  lastSurfacedAt?: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  highlightId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightWithBook extends Highlight {
  book?: Book | null;
}
