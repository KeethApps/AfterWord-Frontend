import React from "react";
import { View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../common/Button";

interface HighlightsEmptyStateProps {
  type: "empty" | "no-notes" | "filtered-empty" | "search-empty";
  onActionPress?: () => void;
}

export const HighlightsEmptyState: React.FC<HighlightsEmptyStateProps> = ({
  type,
  onActionPress,
}) => {
  if (type === "empty") {
    return (
      <View className="flex-1 justify-center mt-12">
        <EmptyState
          title="No highlights yet"
          description="Upload your Kindle highlights to see your saved ideas here."
          foxVariant="sleeping"
        >
          <View className="mt-6 w-56">
            <Button
              label="Upload Highlights"
              onPress={onActionPress}
              fullWidth
            />
            {/* <Button
              label="Learn how it works"
              variant="ghost"
              onPress={() => {}}
              fullWidth
            /> */}
          </View>
        </EmptyState>
      </View>
    );
  }

  if (type === "no-notes") {
    return (
      <View className="flex-1 justify-center mt-12">
        <EmptyState
          title="No notes yet"
          description="Add notes to your highlights to capture your thoughts."
          foxVariant="notebook"
        />
      </View>
    );
  }

  if (type === "filtered-empty") {
    return (
      <View className="flex-1 justify-center mt-12">
        <EmptyState
          title="No highlights match this filter"
          description="Try adjusting or clearing your filters."
          foxVariant="plant"
        >
          <View className="mt-6 w-48">
            <Button
              label="Clear filters"
              variant="secondary"
              onPress={onActionPress}
              fullWidth
            />
          </View>
        </EmptyState>
      </View>
    );
  }

  if (type === "search-empty") {
    return (
      <View className="flex-1 justify-center mt-12">
        <EmptyState
          title="No highlights found"
          description="Try a different keyword or check your spelling."
          foxVariant="telescope"
        >
          <View className="mt-6 w-48">
            <Button
              label="Clear search"
              variant="secondary"
              onPress={onActionPress}
              fullWidth
            />
          </View>
        </EmptyState>
      </View>
    );
  }

  return null;
};
