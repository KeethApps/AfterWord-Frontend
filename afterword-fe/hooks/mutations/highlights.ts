import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Highlight } from '../../types';

export function useUploadHighlights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, highlights }: { userId: string, highlights: Partial<Highlight>[] }): Promise<void> => {
      const { data, error } = await supabase.functions.invoke('manage-highlight', {
        body: {
          action: 'batch_upsert',
          highlights,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to upload highlights');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['highlights', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

/**
 * Toggle the is_favorite field on a highlight.
 * Performs an optimistic update for a snappy UI.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      highlightId,
      isFavorite,
      accessToken,
    }: {
      highlightId: string;
      isFavorite: boolean;
      accessToken: string;
    }) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action: 'update',
            highlight_id: highlightId,
            is_favorite: isFavorite,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update favorite');
      return result;
    },
    onMutate: async ({ highlightId, isFavorite }) => {
      // Cancel any in-flight highlight queries
      await queryClient.cancelQueries({ queryKey: ['highlights'] });

      // Snapshot previous data
      const previousData = queryClient.getQueriesData({ queryKey: ['highlights'] });

      // Optimistically update all cached highlight lists
      queryClient.setQueriesData({ queryKey: ['highlights'] }, (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((h: any) =>
            h.id === highlightId ? { ...h, isFavorite } : h
          );
        }
        return old;
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

/**
 * Update the full set of tags on a highlight (replaces, does not diff client-side —
 * the edge function performs the diff on the server).
 */
export function useUpdateHighlightTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      highlightId,
      tagIds,
      accessToken,
    }: {
      highlightId: string;
      tagIds: string[];
      accessToken: string;
    }) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action: 'update',
            highlight_id: highlightId,
            tag_ids: tagIds,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update tags');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
