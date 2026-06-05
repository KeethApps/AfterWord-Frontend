import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types/models';

export function useBooks(userId: string) {
  return useQuery({
    queryKey: ['books', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Book[];
    },
    enabled: !!userId,
  });
}

export function useBookById(bookId: string) {
  return useQuery({
    queryKey: ['books', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) throw error;
      return data as Book;
    },
    enabled: !!bookId,
  });
}

export function useSearchBooks(userId: string, query: string) {
  return useQuery({
    queryKey: ['books', userId, 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`) // Case-insensitive search
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Book[];
    },
    enabled: !!userId && !!query,
  });
}