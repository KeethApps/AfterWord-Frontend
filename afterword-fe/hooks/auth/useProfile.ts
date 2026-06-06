import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Profile {
  displayName: string | null;
}

interface UseProfileResult {
  profile: Profile | null;
  isLoading: boolean;
}

/**
 * Fetches the current user's profile from Supabase.
 * Tries `profiles` table first (display_name column), falls back
 * to the auth user's email prefix if no profile row exists.
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Try profiles table for a display name
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        const displayName =
          profileRow?.display_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          null;

        setProfile({ displayName });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { profile, isLoading };
}