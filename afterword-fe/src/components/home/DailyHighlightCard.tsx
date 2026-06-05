import React from "react";
import { View, Text } from "react-native";
import { HighlightCard } from "../../components/shared/HighlightCard";
import { useHighlights } from "../../../hooks/queries/highlights";

export const DailyHighlightCard: React.FC = () => {
  const { data: highlights, isLoading } = useHighlights();
  
  if (isLoading) {
    return null; // Or a skeleton
  }
  
  const latest = highlights?.[0] || {
    id: "mock-1",
    bookId: "mock-book-1",
    userId: "mock-user-1",
    highlightText: "You do not rise to the level of your goals. You fall to the level of your systems.",
    createdAt: new Date().toISOString(),
    book: {
      id: "mock-book-1",
      userId: "mock-user-1",
      title: "Atomic Habits",
      author: "James Clear",
      enrichmentStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  if (!latest) return null;

  return (
    <View className="mb-8">
      <Text className="font-sansBold text-sm text-forest mb-3">Today's highlight</Text>
      <HighlightCard
        highlight={latest}
        onShare={() => {/* share logic */}}
      />
    </View>
  );
};
