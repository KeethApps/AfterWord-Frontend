import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { BookCover } from "../shared/BookCover";

interface BookResultRowProps {
  title: string;
  author: string;
  highlightsCount?: number;
  coverImageUrl?: string | null;
  isbn?: string | null;
  onPress: () => void;
}

export const BookResultRow: React.FC<BookResultRowProps> = ({
  title,
  author,
  highlightsCount,
  coverImageUrl,
  isbn,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl p-3 mb-3 border border-border"
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      <View className="shadow-sm w-12 mr-3">
        <BookCover 
          title={title} 
          author={author} 
          isbn={isbn} 
          coverImageUrl={coverImageUrl} 
          className="w-12 h-18" 
        />
      </View>

      <View className="flex-1 justify-center">
        <Text className="font-serifBold text-sm text-forest mb-1" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-sans text-xs text-slate mb-1" numberOfLines={1}>
          {author}
        </Text>
        {highlightsCount !== undefined && (
          <Text className="font-sans text-[10px] text-forest opacity-80 uppercase tracking-wide">
            {highlightsCount} {highlightsCount === 1 ? 'highlight' : 'highlights'}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.slate} />
    </Pressable>
  );
};
