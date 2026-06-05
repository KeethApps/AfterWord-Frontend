import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Note } from '../../types';

export function useNotesByHighlight(highlightId: string) {
  return useQuery({
    queryKey: ['notes', highlightId],
    queryFn: async (): Promise<Note[]> => {
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
    enabled: !!highlightId,
  });
}
