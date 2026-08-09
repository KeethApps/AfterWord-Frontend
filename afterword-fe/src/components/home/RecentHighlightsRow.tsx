import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useHighlights } from "../../../hooks/queries/highlights";
import { HighlightCard } from "../shared/HighlightCard";
import { SectionHeader } from "../common/SectionHeader";
import { HighlightWithBook } from "../../../types";

export const RecentHighlightsRow: React.FC = () => {
  const router = useRouter();
  const { data: highlights = [] } = useHighlights();

  const recent = highlights.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <View className="mb-8">
      <SectionHeader
        title="Recent Highlights"
        action={
          <Pressable onPress={() => router.push("/highlights")}>
            <Text className="font-sans text-sm text-forest">View all</Text>
          </Pressable>
        }
      />
      <View className="mt-2">
        {recent.map((item: HighlightWithBook) => (
          <View key={item.id} className="mb-4">
            <HighlightCard highlight={item} />
          </View>
        ))}
      </View>
    </View>
  );
};
