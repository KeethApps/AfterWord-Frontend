import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Tag } from '../../types';
import { useAuth } from '../useAuth';

/**
 * Fetch all tags belonging to the current user.
 */
export function useTags() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['tags', userId],
    queryFn: async (): Promise<Tag[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('tags')
        .select('id, user_id, name, normalized_name, created_at')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        name: t.name,
        normalizedName: t.normalized_name,
        createdAt: t.created_at,
      }));
    },
    enabled: !!userId,
  });
}

/**
 * Fetch the tag_ids attached to a specific highlight.
 */
export function useHighlightTagIds(highlightId: string) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['highlight-tags', highlightId, userId],
    queryFn: async (): Promise<string[]> => {
      if (!userId || !highlightId) return [];
      const { data, error } = await supabase
        .from('highlight_tags')
        .select('tag_id')
        .eq('highlight_id', highlightId)
        .eq('user_id', userId);

      if (error) throw error;
      return (data ?? []).map((r: any) => r.tag_id);
    },
    enabled: !!userId && !!highlightId,
  });
}
