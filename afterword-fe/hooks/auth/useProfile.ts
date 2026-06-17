import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../useAuth";

interface Profile {
  displayName: string | null;
}

interface UseProfileResult {
  profile: Profile | null;
  isLoading: boolean;
}

/**
 * Fetches the current user's profile from Supabase using React Query.
 * Tries `profiles` table first (display_name column), falls back
 * to the auth user's metadata/email if no profile row exists.
 */
export function useProfile(): UseProfileResult {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery<Profile | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!user) return null;

      // Try profiles table for a display name (ignores error if table doesn't exist)
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      const displayName =
        profileRow?.display_name ??
        user.user_metadata?.display_name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0] ??
        null;

      return { displayName };
    },
    enabled: !!userId,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
  };
}