import React from "react";
import { supabase } from "../../lib/supabase";

type DailyHighlight = {
  id: string;
  highlight_text: string;
  location: string | null;
  last_surfaced_at: string | null;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
    isbn: string | null;
  };
};

type UseDailyHighlightResult = {
  highlight: DailyHighlight | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

// How many days before a highlight is eligible to be surfaced again
const COOLDOWN_DAYS = 14;

export function useDailyHighlight(): UseDailyHighlightResult {
  const [highlight, setHighlight] = React.useState<DailyHighlight | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchHighlight() {
    setLoading(true);
    setError(null);

    try {
      const cooloffDate = new Date();
      cooloffDate.setDate(cooloffDate.getDate() - COOLDOWN_DAYS);

      // Fetch all eligible highlights (not surfaced recently) with their book.
      // We pull a small candidate pool and pick randomly client-side —
      // avoids a heavy ORDER BY RANDOM() full-table scan on large libraries.
      const { data, error: fetchError } = await supabase
        .from("highlights")
        .select(
          `id, highlight_text, location, last_surfaced_at,
           book:books(id, title, author, cover_image_url, isbn)`
        )
        .or(
          `last_surfaced_at.is.null,last_surfaced_at.lt.${cooloffDate.toISOString()}`
        )
        .limit(50); // candidate pool

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        // All highlights are in cooldown — fall back to the longest-unsurfaced one
        const { data: fallback, error: fallbackError } = await supabase
          .from("highlights")
          .select(
            `id, highlight_text, location, last_surfaced_at,
             book:books(id, title, author, cover_image_url, isbn)`
          )
          .order("last_surfaced_at", { ascending: true, nullsFirst: true })
          .limit(1)
          .single();

        if (fallbackError) throw fallbackError;
        if (!fallback) return;

        await markSurfaced(fallback.id);
        setHighlight(fallback as unknown as DailyHighlight);
        return;
      }

      // Pick randomly from the candidate pool
      const picked = data[Math.floor(Math.random() * data.length)];
      await markSurfaced(picked.id);
      setHighlight(picked as unknown as DailyHighlight);
    } catch (err: any) {
      setError(err.message ?? "Failed to load highlight");
    } finally {
      setLoading(false);
    }
  }

  // Update last_surfaced_at so this highlight goes into cooldown
  async function markSurfaced(id: string) {
    await supabase
      .from("highlights")
      .update({ last_surfaced_at: new Date().toISOString() })
      .eq("id", id);
    // Non-critical — don't throw if this fails
  }

  React.useEffect(() => {
    fetchHighlight();
  }, []);

  return { highlight, loading, error, refresh: fetchHighlight };
}