import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Highlight, HighlightWithBook } from '../../types';

export function useHighlights(filters?: { bookId?: string, hasNotes?: boolean }) {
  return useQuery({
    queryKey: ['highlights', filters],
    queryFn: async (): Promise<HighlightWithBook[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      let query = supabase
        .from('highlights')
        .select(`
          *,
          books (*),
          notes (*)
        `)
        .eq('user_id', session.user.id);

      if (filters?.bookId) {
        query = query.eq('book_id', filters.bookId);
      }
      
      // If hasNotes is needed, we'd need a more complex query or a view, 
      // but assuming standard simple filters for now as requested.

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((h: any) => ({
        id: h.id,
        bookId: h.book_id,
        userId: h.user_id,
        highlightText: h.highlight_text,
        location: h.location,
        pageNumber: h.page_number,
        embedding: h.embedding,
        embeddingModel: h.embedding_model,
        lastSurfacedAt: h.last_surfaced_at,
        createdAt: h.created_at,
        notes: h.notes ?? [],
        book: h.books ? {
          id: h.books.id,
          userId: h.books.user_id,
          title: h.books.title,
          author: h.books.author,
          isbn: h.books.isbn,
          coverImageUrl: h.books.cover_image_url,
          description: h.books.description,
          publisher: h.books.publisher,
          publishDate: h.books.publish_date,
          enrichmentStatus: h.books.enrichment_status,
          createdAt: h.books.created_at,
          updatedAt: h.books.updated_at,
        } : null
      }));
    },
  });
}

export function useHighlightsByBook(bookId: string) {
  return useQuery({
    queryKey: ['highlights', 'book', bookId],
    queryFn: async (): Promise<Highlight[]> => {
      const { data, error } = await supabase
        .from('highlights')
        .select('*, notes(*)')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((h: any) => ({
        id: h.id,
        bookId: h.book_id,
        userId: h.user_id,
        highlightText: h.highlight_text,
        location: h.location,
        pageNumber: h.page_number,
        embedding: h.embedding,
        embeddingModel: h.embedding_model,
        lastSurfacedAt: h.last_surfaced_at,
        createdAt: h.created_at,
        notes: h.notes ?? [],
      }));
    },
    enabled: !!bookId,
  });
}

export function useSearchHighlights(userId: string, query: string) {
  return useQuery({
    queryKey: ['highlights', 'search', userId, query],
    queryFn: async (): Promise<HighlightWithBook[]> => {
      const { data, error } = await supabase
        .from('highlights')
        .select(`
          *,
          books (*),
          notes (*)
        `)
        .eq('user_id', userId)
        .ilike('highlight_text', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((h: any) => ({
        id: h.id,
        bookId: h.book_id,
        userId: h.user_id,
        highlightText: h.highlight_text,
        location: h.location,
        pageNumber: h.page_number,
        embedding: h.embedding,
        embeddingModel: h.embedding_model,
        lastSurfacedAt: h.last_surfaced_at,
        createdAt: h.created_at,
        notes: h.notes ?? [],
        book: h.books ? {
          id: h.books.id,
          userId: h.books.user_id,
          title: h.books.title,
          author: h.books.author,
          isbn: h.books.isbn,
          coverImageUrl: h.books.cover_image_url,
          description: h.books.description,
          publisher: h.books.publisher,
          publishDate: h.books.publish_date,
          enrichmentStatus: h.books.enrichment_status,
          createdAt: h.books.created_at,
          updatedAt: h.books.updated_at,
        } : null
      }));
    },
    enabled: !!userId && !!query,
  });
}
