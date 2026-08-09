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

export interface Tag {
  id: string;
  userId: string;
  name: string;
  normalizedName: string;
  createdAt: string;
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
  isFavorite?: boolean;
  createdAt: string;
  notes?: Note[] | null;
  tags?: Tag[] | null;
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

// ── Search API ─────────────────────────────────────────────────────────────

export interface SearchRequest {
  query: string;
  limit?: number;
  book_id?: string;
  tag_ids?: string[];
  favorites_only?: boolean;
}

export interface SearchResultBook {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
  isbn?: string | null;
}

export interface SearchResult {
  highlight_id?: string;
  highlight_text: string;
  note_text: string | null;
  is_favorite: boolean;
  /** RRF score — NOT a 0–1 similarity percentage */
  relevance: number;
  book: SearchResultBook;
}
