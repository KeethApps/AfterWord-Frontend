import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";

export type SortOption = "recently_read" | "most_highlights" | "title_asc" | "title_desc";
export type ViewMode = "list" | "grid";

interface LibraryFiltersProps {
  sortMode: SortOption;
  onSortModeChange: (mode: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClearAll: () => void;
}

export const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  sortMode,
  onSortModeChange,
  viewMode,
  onViewModeChange,
  onClearAll,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const renderSortPill = (label: string, value: SortOption) => {
    const isActive = sortMode === value;
    return (
      <Pressable
        onPress={() => onSortModeChange(value)}
        className={`px-4 py-2 rounded-full border mr-2 mb-3 ${
          isActive ? "bg-forest border-forest" : "bg-white border-mist"
        }`}
      >
        <Text className={`font-sans text-sm ${isActive ? "text-white" : "text-forest"}`}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderViewPill = (label: string, value: ViewMode) => {
    const isActive = viewMode === value;
    return (
      <Pressable
        onPress={() => onViewModeChange(value)}
        className={`px-6 py-2 rounded-full border mr-2 ${
          isActive ? "bg-primary border-primary" : "bg-white border-mist"
        }`}
      >
        <Text className={`font-sans text-sm ${isActive ? "text-white" : "text-forest"}`}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderFilterRow = (label: string, sectionKey: string) => {
    const isExpanded = expandedSection === sectionKey;
    return (
      <View className="border-b border-mist">
        <Pressable 
          className="flex-row items-center justify-between py-4"
          onPress={() => toggleSection(sectionKey)}
        >
          <Text className="font-sans text-base text-forest">{label}</Text>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-forward"} size={20} color={Colors.slate} />
        </Pressable>
        {isExpanded && (
          <View className="pb-4 pt-2 px-2">
            <Text className="font-sans text-sm text-slate italic">
              Filter options will appear here.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-6">
      {/* Header */}
      <View className="flex-row justify-between items-end mb-6">
        <Text className="font-sansBold text-xs text-slate uppercase tracking-wider">
          Filters
        </Text>
        <Pressable onPress={onClearAll}>
          <Text className="font-sans text-sm text-primary">Clear all</Text>
        </Pressable>
      </View>

      {/* Sort By */}
      <View className="mb-8">
        <Text className="font-sansBold text-sm text-forest mb-4">Sort by</Text>
        <View className="flex-row flex-wrap">
          {renderSortPill("Recently Read", "recently_read")}
          {renderSortPill("Most Highlights", "most_highlights")}
          {renderSortPill("Title (A-Z)", "title_asc")}
          {renderSortPill("Title (Z-A)", "title_desc")}
        </View>
      </View>

      {/* Filter By */}
      <View className="mb-8">
        <Text className="font-sansBold text-sm text-forest mb-2">Filter by</Text>
        {renderFilterRow("Author", "author")}
      </View>

      {/* View Mode */}
      <View className="mb-8">
        <Text className="font-sansBold text-sm text-forest mb-4">View</Text>
        <View className="flex-row">
          {renderViewPill("List View", "list")}
          {renderViewPill("Grid View", "grid")}
        </View>
      </View>
    </ScrollView>
  );
};
