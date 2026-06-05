import React from "react";
import { ScrollView, ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { 
  GreetingHeader, 
  DailyHighlightCard, 
  LibraryStatsRow, 
  RecentlyUploadedRow, 
  HomeEmptyState,
  HomeSearchBar
} from "../../../src/components/home";
import { AppHeader } from "../../../src/components/AppHeader";
import { useBooks } from "../../../hooks/queries/books";
import { useHighlights } from "../../../hooks/queries/highlights";

export default function HomeScreen() {
  const router = useRouter();

  const { data: books, isLoading: loadingBooks } = useBooks();
  const { data: highlights, isLoading: loadingHighlights } = useHighlights();

  const isLoading = loadingBooks || loadingHighlights;
  
  // Force hasContent to true for now so the user can preview the populated UI components
  // instead of the empty state, since the database is currently empty.
  const hasContent = true;

  return (
    <ScreenContainer padded={false}>
      <AppHeader title="AfterWord" subtitle="For the Words Worth Revisiting." />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        <GreetingHeader userName="Keerthana" hour={new Date().getHours()} />
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2F4F4F" />
          </View>
        ) : hasContent ? (
          <>
            <DailyHighlightCard />
            <LibraryStatsRow
              bookCount={books?.length || 37}
              highlightCount={highlights?.length || 1248}
              noteCount={82}
              authorCount={12}
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