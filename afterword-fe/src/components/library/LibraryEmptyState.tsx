import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../common/Button";

export type LibraryEmptyStateType = 
  | "empty" 
  | "no-search" 
  | "no-filter" 
  | "uploading" 
  | "ready";

interface LibraryEmptyStateProps {
  type: LibraryEmptyStateType;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  uploadProgress?: number;
}

export const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ 
  type, 
  onClearSearch, 
  onClearFilters,
  uploadProgress = 37 // Mock progress for demonstration
}) => {
  const router = useRouter();

  switch (type) {
    case "empty":
      return (
        <EmptyState
          title="Your library is empty"
          description="Upload your Kindle highlights to see your books and ideas here."
          foxVariant="reading"
        >
          <View className="mt-4 w-64 items-center gap-y-4">
            <Button label="Upload Highlights" onPress={() => router.push("/upload")} fullWidth />
            {/* <Button label="Learn how it works" variant="ghost" onPress={() => {}} fullWidth /> */}
          </View>
        </EmptyState>
      );
    case "no-search":
      return (
        <EmptyState
          title="No results found"
          description="Try a different keyword or check your spelling."
          foxVariant="rain"
        >
          <View className="mt-4 w-64 items-center">
            <Button label="Clear search" variant="ghost" onPress={onClearSearch} fullWidth />
          </View>
        </EmptyState>
      );
    case "no-filter":
      return (
        <EmptyState
          title="No books match this filter"
          description="Try adjusting your filters or clearing them to see more."
          foxVariant="sad"
        >
          <View className="mt-4 w-64 items-center">
            <Button label="Clear filters" variant="ghost" onPress={onClearFilters} fullWidth />
          </View>
        </EmptyState>
      );
    case "uploading":
      return (
        <EmptyState
          title="Building your library..."
          description="We're importing and organizing your highlights. This may take a few minutes."
          foxVariant="laptop"
        >
          <View className="mt-6 w-72 items-center">
            {/* Mock Progress Bar */}
            <View className="w-full h-2 bg-mist rounded-full overflow-hidden mb-2">
              <View className="h-full bg-forest rounded-full" style={{ width: `${uploadProgress}%` }} />
            </View>
            <View className="w-full flex-row justify-between mb-4">
              <Text className="font-sans text-xs text-slate">You can close the app and we'll notify you when it's done.</Text>
              <Text className="font-sansBold text-xs text-forest">{uploadProgress}%</Text>
            </View>
          </View>
        </EmptyState>
      );
    case "ready":
      return (
        <EmptyState
          title="Ready when you are"
          description="Your ideas are waiting. Upload your My Clippings.txt file to get started."
          foxVariant="happy"
        >
          <View className="mt-4 w-64 items-center gap-y-4">
            <Button label="Upload Highlights" onPress={() => router.push("/upload")} fullWidth />
            <Button label="Learn more" variant="ghost" onPress={() => {}} fullWidth />
          </View>
        </EmptyState>
      );
  }
};
