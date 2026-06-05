import React from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "../../../constants/theme";
import { HighlightWithBook } from "../../../types";
import { BookCover } from "../shared/BookCover";

export interface HighlightGridCardProps {
  highlight: HighlightWithBook;
  onPress?: () => void;
}

export const HighlightGridCard: React.FC<HighlightGridCardProps> = ({ highlight, onPress }) => {
  const { book } = highlight;
  
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 border border-border flex-1 mx-2 mb-4 h-48"
      style={({ pressed }) => pressed && { opacity: 0.8 }}
    >
      <View className="flex-row items-start mb-3">
        <View className="shadow-sm mr-3">
          <BookCover
            title={book?.title || 'Unknown'}
            author={book?.author || 'Unknown'}
            isbn={book?.isbn}
            coverImageUrl={book?.coverImageUrl}
            className="w-10 h-14 rounded-sm"
          />
        </View>
        <View className="flex-1 pr-2">
          <Text className="font-sansBold text-xs text-forest" numberOfLines={2}>
            {book?.title || 'Unknown Book'}
          </Text>
          <Text className="font-sans text-[10px] text-slate" numberOfLines={1}>
            {book?.author || 'Unknown'}
          </Text>
        </View>
      </View>

      <Text className="font-serif text-sm text-forest leading-relaxed flex-1" numberOfLines={4}>
        "{highlight.highlightText}"
      </Text>

      {highlight.pageNumber && (
        <Text className="font-sans text-[10px] text-slate mt-2">
          Page {highlight.pageNumber}
        </Text>
      )}
    </Pressable>
  );
};
