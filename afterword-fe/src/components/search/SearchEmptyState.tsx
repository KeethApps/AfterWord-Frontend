import React from "react";
import { View, Text, Pressable } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Colors } from "../../../constants/theme";

import { FolioFox } from "../../components/FolioFox";

interface SearchEmptyStateProps {
  onSuggestionPress: (suggestion: string) => void;
  children?: React.ReactNode;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ onSuggestionPress, children }) => {
  const suggestions = [
    "linguistics", "social", "amaze", "Gandalf",
  ];

  return (
    <View className="flex-1 mt-4">
      <View className="px-2 mb-8">
        <Text className="font-sansBold text-xs text-slate uppercase tracking-widest mb-4">
          TRY SEARCHING
        </Text>
        <View className="flex-row flex-wrap gap-2">
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

      {children}

      <View className="mt-8 bg-cream p-6 rounded-3xl items-center justify-between mb-6">
        <View className="mr-4">
          <FolioFox size={150} variant="reading" />
        </View>
        <View className="" style={{alignItems: "center"}}>
          <Text className="font-serifBold text-lg text-forest mb-1">
            Search your second brain
          </Text>
          <Text className="font-sans text-sm text-slate">
            Every highlight is a thought worth revisiting.
          </Text>
        </View>
      </View>
    </View>
  );
};
