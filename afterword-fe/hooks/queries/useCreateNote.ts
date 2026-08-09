import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      highlightId,
      content,
    }: {
      highlightId: string;
      userId?: string;
      content: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('manage-highlight', {
        body: {
          action: 'create_note',
          highlight_id: highlightId,
          content,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to create note');
      }
      return data.note;
    },
    onSuccess: () => {
      // Invalidate the highlights query so notes appear
      queryClient.invalidateQueries({
        queryKey: ['highlights'],
      });
    },
  });
}