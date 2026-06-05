import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Book } from '../../types';

export function useBooks(userId: string) {
  return useQuery({
    queryKey: ['books', userId],
    queryFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map snake_case to camelCase
      return data.map((b: any) => ({
        id: b.id,
        userId: b.user_id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        coverImageUrl: b.cover_image_url,
        description: b.description,
        publisher: b.publisher,
        publishDate: b.publish_date,
        enrichmentStatus: b.enrichment_status,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));
    },
    enabled: !!userId,
  });
}

export function useBookById(bookId: string) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async (): Promise<Book> => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        coverImageUrl: data.cover_image_url,
        description: data.description,
        publisher: data.publisher,
        publishDate: data.publish_date,
        enrichmentStatus: data.enrichment_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!bookId,
  });
}

export function useSearchBooks(userId: string, query: string) {
  return useQuery({
    queryKey: ['books', 'search', userId, query],
    queryFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((b: any) => ({
        id: b.id,
        userId: b.user_id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        coverImageUrl: b.cover_image_url,
        description: b.description,
        publisher: b.publisher,
        publishDate: b.publish_date,
        enrichmentStatus: b.enrichment_status,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));
    },
    enabled: !!userId && !!query,
  });
}
