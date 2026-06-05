import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { Button } from "../common/Button";

interface HighlightsFilterSheetProps {
  onClearAll: () => void;
  onApplyFilters: () => void;
}

export const HighlightsFilterSheet: React.FC<HighlightsFilterSheetProps> = ({
  onClearAll,
  onApplyFilters,
}) => {
  const [activeSort, setActiveSort] = useState("Most Recent");
  const [activeDate, setActiveDate] = useState("All Time");

  const sortOptions = ["Most Recent", "Oldest", "Book (A-Z)", "Book (Z-A)"];
  const dateOptions = ["All Time", "This Year", "This Month", "Custom"];

  const renderFilterRow = (label: string, value?: string) => {
    return (
      <Pressable className="flex-row items-center justify-between py-4 border-b border-mist">
        <Text className="font-sansBold text-sm text-forest">{label}</Text>
        <View className="flex-row items-center">
          {value && <Text className="font-sans text-sm text-slate mr-2">{value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={Colors.slate} />
        </View>
      </Pressable>
    );
  };

  const renderPills = (
    title: string,
    options: string[],
    active: string,
    onSelect: (val: string) => void
  ) => (
    <View className="mb-6">
      <Text className="font-sansBold text-sm text-forest mb-4">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = active === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onSelect(opt)}
              className={`px-4 py-2 rounded-full border ${
                isActive ? "bg-primary border-primary" : "bg-white border-mist"
              }`}
            >
              <Text className={`font-sans text-xs ${isActive ? "text-white" : "text-forest"}`}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-6">
      {/* Header */}
      <View className="flex-row justify-between items-end mb-8">
        <Text className="font-serifBold text-2xl text-forest">Filters</Text>
        <Pressable onPress={onClearAll}>
          <Text className="font-sans text-sm text-primary mb-1">Clear all</Text>
        </Pressable>
      </View>

      {/* Sort By */}
      {renderPills("Sort by", sortOptions, activeSort, setActiveSort)}

      {/* Filter By Expandables */}
      <View className="mb-6">
        <Text className="font-sansBold text-sm text-forest mb-2">Filter by</Text>
        {renderFilterRow("Book")}
        {renderFilterRow("Author")}
        {renderFilterRow("Tags / Topics")}
        {renderFilterRow("Has Notes")}
      </View>

      {/* Date */}
      {renderPills("Date", dateOptions, activeDate, setActiveDate)}

      <Button 
        label="Apply filters" 
        onPress={onApplyFilters} 
        fullWidth 
      />
      <View className="h-10" />
    </ScrollView>
  );
};
