import React from "react";
import { View, Text, Pressable } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Colors } from "../../../constants/theme";

interface SearchEmptyStateProps {
  onSuggestionPress: (suggestion: string) => void;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ onSuggestionPress }) => {
  const suggestions = [
    "habits", "mindset", "productivity",
    "discipline", "leadership", "focus"
  ];

  return (
    <View className="flex-1 mt-12">
      <EmptyState
        title="What are you looking for?"
        description="Search by keyword, topic, book, author, or even an idea."
        foxVariant="telescope"
      >
        <View className="w-full px-4 mt-8">
          <Text className="font-sansBold text-sm text-forest mb-4 text-center">
            Try searching for
          </Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => onSuggestionPress(suggestion)}
                className="px-4 py-2 bg-white border border-mist rounded-full"
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Text className="font-sans text-sm text-forest">
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </EmptyState>
    </View>
  );
};
