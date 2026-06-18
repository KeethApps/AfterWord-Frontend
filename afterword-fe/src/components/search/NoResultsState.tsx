import React from "react";
import { View, Text, Pressable } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../common/Button";

interface NoResultsStateProps {
  hasSuggestions?: boolean;
  onSuggestionPress?: (suggestion: string) => void;
  onClearSearch?: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({ 
  hasSuggestions, 
  onSuggestionPress,
  onClearSearch 
}) => {
  const suggestions = [
    "physics", "science", "brain",
    "thinking", "mindset", "curiosity"
  ];

  if (hasSuggestions) {
    return (
      <View className="flex-1 mt-12">
        <EmptyState
          title="No results found"
          description="Here are some ideas you might like."
          foxVariant="rain"
        >
          <View className="w-full px-4 mt-8">
            <Text className="font-sansBold text-sm text-forest mb-4">
              Suggestions
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => onSuggestionPress?.(suggestion)}
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
  }

  return (
    <View className="flex-1 mt-12">
      <EmptyState
        title="No results found"
        description="Try a different keyword or check your spelling."
        foxVariant="rain"
      >
        <View className="mt-4 w-48 items-center">
          <Button 
            label="Clear search" 
            variant="ghost" 
            onPress={onClearSearch} 
            fullWidth 
          />
        </View>
      </EmptyState>
    </View>
  );
};
