import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Note } from '../../types';

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ highlightId, userId, content }: { highlightId: string, userId: string, content: string }): Promise<Note> => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          highlight_id: highlightId,
          user_id: userId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        highlightId: data.highlight_id,
        userId: data.user_id,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
      const { data, error } = await supabase
        .from('notes')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        highlightId: data.highlight_id,
        userId: data.user_id,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.highlightId] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, highlightId }: { noteId: string, highlightId: string }): Promise<void> => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.highlightId] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}
