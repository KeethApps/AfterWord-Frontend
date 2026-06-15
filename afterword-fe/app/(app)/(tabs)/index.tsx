import React from "react";
import { ScrollView, ActivityIndicator, View, Text } from "react-native";
import { useRouter, Href } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { 
  GreetingHeader, 
  DailyHighlightCard, 
  LibraryStatsRow, 
  RecentlyUploadedRow, 
  HomeEmptyState,
  HomeSearchBar,
  KnowledgeGraph
} from "../../../src/components/home";
import { AppHeader } from "../../../src/components/AppHeader";
import { useBooks } from "../../../hooks/queries/books";
import { useHighlights } from "../../../hooks/queries/highlights";
import { useAllNotes } from "../../../hooks/queries/notes";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth()
  const { data: books, isLoading: loadingBooks } = useBooks();
  const { data: highlights, isLoading: loadingHighlights } = useHighlights();
  const { data: notes, isLoading: loadingNotes } = useAllNotes();

  const isLoading = loadingBooks || loadingHighlights || loadingNotes;
  // Show content only if there are books or highlights
  const hasContent = (books?.length ?? 0) > 0 || (highlights?.length ?? 0) > 0 || (notes?.length ?? 0) > 0;

  const authorCount = new Set((books || []).map(b => b.author)).size;

  return (
    <ScreenContainer padded={false}>
      <AppHeader title="AfterWord" subtitle="" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        <GreetingHeader hasContent={true} userName={user?.user_metadata?.first_name || 'there'} hour={new Date().getHours()} />
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2F4F4F" />
          </View>
        ) : hasContent ? (
          <>
            {/* Two-column layout for Daily Highlight and Knowledge Map on desktop, stacked on mobile */}
            <View className="flex-col md:flex-row gap-6 mb-6">
              <View className="flex-1">
                <DailyHighlightCard />
              </View>

              <KnowledgeGraph onHighlightSelect={(id) => router.push(`/highlights/${id}` as Href)} />
            </View>

            <LibraryStatsRow
              bookCount={books?.length || 0}
              highlightCount={highlights?.length || 0}
              noteCount={notes?.length || 0}
              authorCount={authorCount}
              onViewAll={() => router.push("/library")}
            />
            
            <RecentlyUploadedRow />
          </>
        ) : (
          <HomeEmptyState />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}