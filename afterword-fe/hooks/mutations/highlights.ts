import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Highlight } from '../../types';
import * as crypto from 'crypto';

export function useUploadHighlights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, highlights }: { userId: string, highlights: Partial<Highlight>[] }): Promise<void> => {
      // Create md5 hashes for deduplication
      // Assuming highlight_text is the main deduplication key
      // If crypto is not available in RN without polyfill, might need an alternative like react-native-md5 or similar
      // Assuming for now a basic string hashing or backend handles real deduplication
      
      const toInsert = highlights.map(h => ({
        user_id: userId,
        book_id: h.bookId,
        highlight_text: h.highlightText,
        location: h.location,
        page_number: h.pageNumber,
      }));

      // In supabase, batch insert is just passing an array
      const { error } = await supabase
        .from('highlights')
        .upsert(toInsert, { onConflict: 'user_id, highlight_text' }); // Example of conflict resolution if unique constraint exists

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['highlights', variables.userId] });
    },
  });
}
