import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { CollapsibleCard } from "../common/CollapsibleCard";

export type SearchSort = "Most Recent" | "Oldest";

interface SearchFiltersProps {
  activeSort: SearchSort;
  onSortChange: (sort: SearchSort) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * Collapsible Sort & Filter card for the Search page.
 * Same visual style as HighlightsFilters — sort only, no tags section.
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeSort,
  onSortChange,
  expanded,
  onToggleExpanded,
}) => {
  const activeCount = activeSort === "Oldest" ? 1 : 0;

  return (
    <CollapsibleCard
      icon="options-outline"
      title="Sort & Filter"
      badgeCount={activeCount}
      expanded={expanded}
      onToggle={onToggleExpanded}
    >
      {/* Sort */}
      <Text style={styles.sublabel}>Sort by</Text>
      <View style={styles.sortRow}>
        <Pressable
          onPress={() => onSortChange("Most Recent")}
          style={[
            styles.sortOption,
            activeSort === "Most Recent" && styles.sortOptionActive,
          ]}
        >
          <Ionicons
            name="arrow-down"
            size={13}
            color={activeSort === "Most Recent" ? Colors.cream : Colors.forest}
          />
          <Text
            style={[
              styles.sortOptionText,
              activeSort === "Most Recent" && styles.sortOptionTextActive,
            ]}
          >
            Latest first
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onSortChange("Oldest")}
          style={[
            styles.sortOption,
            activeSort === "Oldest" && styles.sortOptionActive,
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={13}
            color={activeSort === "Oldest" ? Colors.cream : Colors.forest}
          />
          <Text
            style={[
              styles.sortOptionText,
              activeSort === "Oldest" && styles.sortOptionTextActive,
            ]}
          >
            Oldest first
          </Text>
        </Pressable>
      </View>

      {/* Clear */}
      {activeCount > 0 && (
        <Pressable
          onPress={() => onSortChange("Most Recent")}
          style={styles.clearRow}
          hitSlop={8}
        >
          <Ionicons name="close-circle-outline" size={14} color={Colors.slate} />
          <Text style={styles.clearText}>Clear filters</Text>
        </Pressable>
      )}
    </CollapsibleCard>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sublabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11.5,
    color: Colors.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  sortOptionActive: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  sortOptionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.forest,
  },
  sortOptionTextActive: {
    color: Colors.cream,
  },
  clearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  clearText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
    color: Colors.slate,
  },
});
