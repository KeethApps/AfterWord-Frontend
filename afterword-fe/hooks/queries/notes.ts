import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Note } from '../../types';
import { useAuth } from '../useAuth';


export function useNotesByHighlight(highlightId: string) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['notes', highlightId, userId],
    queryFn: async (): Promise<Note[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('highlight_id', highlightId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map((n: any) => ({
        id: n.id,
        highlightId: n.highlight_id,
        userId: n.user_id,
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }));
    },
    enabled: !!highlightId && !!userId,
  });
}

export function useAllNotes() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['notes', 'all', userId],
    queryFn: async (): Promise<Note[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((n: any) => ({
        id: n.id,
        highlightId: n.highlight_id,
        userId: n.user_id,
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }));
    },
    enabled: !!userId,
  });
}
