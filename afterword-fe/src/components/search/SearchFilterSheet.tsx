import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { Button } from "../common/Button";

interface SearchFilterSheetProps {
  onClearAll: () => void;
  onApplyFilters: () => void;
  activeContentType: string;
  onContentTypeChange: (type: string) => void;
}

export const SearchFilterSheet: React.FC<SearchFilterSheetProps> = ({
  onClearAll,
  onApplyFilters,
  activeContentType,
  onContentTypeChange,
}) => {
  const contentTypes = ["All", "Quotes", "Books", "Authors", "Topics", "Notes"];

  const renderFilterRow = (label: string, value: string) => {
    return (
      <Pressable className="flex-row items-center justify-between py-4 border-b border-mist">
        <Text className="font-sansBold text-sm text-forest">{label}</Text>
        <View className="flex-row items-center">
          <Text className="font-sans text-sm text-slate mr-2">{value}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.slate} />
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-6">
      {/* Header */}
      <View className="flex-row justify-between items-end mb-8">
        <Text className="font-serifBold text-2xl text-forest">Filters</Text>
        <Pressable onPress={onClearAll}>
          <Text className="font-sans text-sm text-primary mb-1">Clear all</Text>
        </Pressable>
      </View>

      {/* Content Type */}
      <View className="mb-6">
        <Text className="font-sansBold text-sm text-forest mb-4">Content type</Text>
        <View className="flex-row flex-wrap gap-2">
          {contentTypes.map((type) => {
            const isActive = activeContentType === type;
            return (
              <Pressable
                key={type}
                onPress={() => onContentTypeChange(type)}
                className={`px-5 py-2 rounded-full border ${
                  isActive ? "bg-primary border-primary" : "bg-white border-mist"
                }`}
              >
                <Text className={`font-sans text-sm ${isActive ? "text-white" : "text-forest"}`}>
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Expandable Filters */}
      <View className="mb-8">
        {renderFilterRow("Book", "All Books")}
        {renderFilterRow("Author", "All Authors")}
        {renderFilterRow("Date highlighted", "Any time")}
      </View>

      <Button 
        label="Apply filters" 
        onPress={onApplyFilters} 
        fullWidth 
      />
      <View className="h-10" />
    </ScrollView>
  );
};
