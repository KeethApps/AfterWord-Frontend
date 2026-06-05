import React from "react";
import { View, Text } from "react-native";
import { SectionHeader } from "../../components/common/SectionHeader";

export interface LibraryStatsProps {
  bookCount: number;
  highlightCount: number;
  noteCount: number;
  authorCount: number;
  onViewAll?: () => void;
}

export const LibraryStatsRow: React.FC<LibraryStatsProps> = ({
  bookCount,
  highlightCount,
  noteCount,
  authorCount,
  onViewAll,
}) => (
  <View className="mb-8">
    <SectionHeader 
      title="Library Overview" 
      action={onViewAll ? <Text className="font-sans text-sm text-forest" onPress={onViewAll}>View all</Text> : undefined} 
    />
    <View className="flex-row justify-between items-center bg-surface p-4 rounded-xl shadow-sm border border-mist mt-4">
      <StatBox label="Books" value={bookCount} />
      <StatBox label="Highlights" value={highlightCount} />
      <StatBox label="Notes" value={noteCount} />
      <StatBox label="Authors" value={authorCount} />
    </View>
  </View>
);

const StatBox: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View className="items-center flex-1">
    <Text className="font-sansBold text-lg text-forest">{value.toLocaleString()}</Text>
    <Text className="font-sans text-xs text-slate mt-1">{label}</Text>
  </View>
);
