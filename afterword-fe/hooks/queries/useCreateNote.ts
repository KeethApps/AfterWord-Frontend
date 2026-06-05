import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      highlightId,
      userId,
      content,
    }: {
      highlightId: string;
      userId: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ highlight_id: highlightId, user_id: userId, content }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the highlights query so notes appear
      queryClient.invalidateQueries({
        queryKey: ['highlights'],
      });
    },
  });
}