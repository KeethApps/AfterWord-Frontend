import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Book } from '../../types';
import { useAuth } from '../useAuth';

async function extractEdgeFunctionError(error: any, data: any): Promise<string> {
  if (data?.error && typeof data.error === 'string') {
    return data.error;
  }
  if (error) {
    if ('context' in error && error.context && typeof error.context.json === 'function') {
      try {
        const errBody = await error.context.json();
        if (errBody?.error) return errBody.error;
      } catch (_) {}
    }
    return error.message || 'Edge function error';
  }
  return 'Unknown error occurred';
}

export function useBooks() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['books', userId],
    queryFn: async (): Promise<Book[]> => {
      if (!userId) return [];

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
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['book', bookId, userId],
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
    enabled: !!bookId && !!userId,
  });
}

export function useSearchBooks(query: string) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['books', 'search', query, userId],
    queryFn: async (): Promise<Book[]> => {
      if (!userId) return [];

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
    enabled: !!query && !!userId,
  });
}

export type CreateBookInput = {
  title: string;
  author?: string;
  isbn?: string;
  cover_image_url?: string;
  description?: string;
  genre?: string;
  publisher?: string;
  publish_date?: string;
  enrichment_status?: string;
};

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookInput): Promise<Book> => {
      const { data, error } = await supabase.functions.invoke('manage-book', {
        body: {
          action: 'create',
          ...input,
        },
      });

      if (error || data?.error) {
        const message = await extractEdgeFunctionError(error, data);
        throw new Error(message);
      }

      const b = data.book;
      return {
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
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library_stats'] });
    },
  });
}

export type UpdateBookInput = {
  bookId: string;
  updates: {
    title?: string;
    author?: string;
    isbn?: string;
    cover_image_url?: string;
    description?: string;
    genre?: string;
    publisher?: string;
    publish_date?: string;
    enrichment_status?: string;
  };
};

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, updates }: UpdateBookInput): Promise<Book> => {
      const { data, error } = await supabase.functions.invoke('manage-book', {
        body: {
          action: 'update',
          book_id: bookId,
          updates,
        },
      });

      if (error || data?.error) {
        const message = await extractEdgeFunctionError(error, data);
        throw new Error(message);
      }

      const b = data.book;
      return {
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
      };
    },
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['library_stats'] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-book', {
        body: {
          action: 'delete',
          book_id: bookId,
        },
      });

      if (error || data?.error) {
        const message = await extractEdgeFunctionError(error, data);
        throw new Error(message);
      }
    },
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['library_stats'] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}
