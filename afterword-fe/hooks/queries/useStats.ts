// hooks/queries/stats.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../useAuth";

interface LibraryStats {
  books: number;
  highlights: number;
  notes: number;
  authors: number;
}

export function useLibraryStats() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["library-stats", userId],
    enabled: !!userId,

    queryFn: async (): Promise<LibraryStats> => {
      const [
        booksResult,
        highlightsResult,
        notesResult,
        authorsResult,
      ] = await Promise.all([
        supabase
          .from("books")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),

        supabase
          .from("highlights")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),

        supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),

        // Fetch authors for distinct count
        supabase
          .from("books")
          .select("author")
          .eq("user_id", userId),
      ]);

      if (booksResult.error) throw booksResult.error;
      if (highlightsResult.error) throw highlightsResult.error;
      if (notesResult.error) throw notesResult.error;
      if (authorsResult.error) throw authorsResult.error;

      const authors = new Set(
        (authorsResult.data ?? [])
          .map((b) => b.author)
          .filter(Boolean)
      ).size;

      return {
        books: booksResult.count ?? 0,
        highlights: highlightsResult.count ?? 0,
        notes: notesResult.count ?? 0,
        authors,
      };
    },

    staleTime: 1000 * 60 * 5, // 5 min
  });
}