import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { Button } from "../common/Button";

interface HighlightsFilterSheetProps {
  onClose: () => void;
  onClearAll: () => void;
  onApplyFilters: (sort: string) => void;
  currentSort: string;
}

export const HighlightsFilterSheet: React.FC<HighlightsFilterSheetProps> = ({
  onClose,
  onClearAll,
  onApplyFilters,
  currentSort,
}) => {
  const [activeSort, setActiveSort] = useState(currentSort);

  const sortOptions = [
    { label: "Most Recent", icon: "time-outline" as const },
    { label: "Oldest", icon: "hourglass-outline" as const },
    { label: "Book (A-Z)", icon: "text-outline" as const },
    { label: "Book (Z-A)", icon: "text" as const },
  ];

  return (
    <View className="flex-1 bg-[#FDFBF7] rounded-t-3xl pt-3 px-4 pb-8 shadow-lg mt-auto" style={{ maxHeight: '80%' }}>
      {/* Handle */}
      <View className="items-center mb-4">
        <View className="w-12 h-1 bg-[#E2DFD2] rounded-full" />
      </View>

      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="font-serifBold text-2xl text-forest">Filters</Text>
        <Pressable 
          onPress={onClose}
          className="w-8 h-8 rounded-full bg-mist items-center justify-center"
        >
          <Ionicons name="close" size={20} color={Colors.forest} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Sort By */}
        <View className="mb-8">
          <Text className="font-sansBold text-sm text-forest mb-4">Sort by</Text>
          <View className="flex-row flex-wrap gap-3">
            {sortOptions.map((opt) => {
              const isActive = activeSort === opt.label;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setActiveSort(opt.label)}
                  className={`w-[47%] aspect-[4/3] rounded-2xl border items-center justify-center p-3 ${
                    isActive ? "bg-forest border-forest" : "bg-white border-[#E2DFD2]"
                  }`}
                >
                  <Ionicons 
                    name={opt.icon} 
                    size={24} 
                    color={isActive ? Colors.white : Colors.forest} 
                    style={{ marginBottom: 8 }}
                  />
                  <Text className={`font-sans text-xs text-center ${isActive ? "text-white" : "text-forest"}`}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="pt-4 border-t border-mist flex-row items-center justify-between">
        <Pressable onPress={onClearAll} className="px-4 py-3">
          <Text className="font-sans text-sm text-forest opacity-80">Clear all</Text>
        </Pressable>
        <View className="flex-1 ml-4">
          <Button 
            label="Apply filters" 
            onPress={() => onApplyFilters(activeSort)} 
            fullWidth 
          />
        </View>
      </View>
    </View>
  );
};
