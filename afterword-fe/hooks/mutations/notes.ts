import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Note } from '../../types';

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

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ highlightId, userId, content }: { highlightId: string, userId?: string, content: string }): Promise<Note> => {
      const { data, error } = await supabase.functions.invoke('manage-highlight', {
        body: {
          action: 'create_note',
          highlight_id: highlightId,
          content,
        },
      });

      if (error || data?.error) {
        const message = await extractEdgeFunctionError(error, data);
        throw new Error(message);
      }
      
      const n = data.note;
      return {
        id: n.id,
        highlightId: n.highlight_id,
        userId: n.user_id,
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.highlightId] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string, content: string }): Promise<Note> => {
      const { data, error } = await supabase.functions.invoke('manage-highlight', {
        body: {
          action: 'update_note',
          note_id: noteId,
          content,
        },
      });

      if (error || data?.error) {
        const message = await extractEdgeFunctionError(error, data);
        throw new Error(message);
      }
      
      const n = data.note;
      return {
        id: n.id,
        highlightId: n.highlight_id,
        userId: n.user_id,
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.highlightId] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, highlightId }: { noteId: string, highlightId: string }): Promise<void> => {
      const { data, error } = await supabase.functions.invoke('manage-highlight', {
        body: {
          action: 'delete_note',
          note_id: noteId,
        },
      });

      if (error || data?.error) {
        const message = await extractEdgeFunctionError(error, data);
        throw new Error(message);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.highlightId] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}
