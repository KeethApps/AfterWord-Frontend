import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { useTags } from "../../../hooks/queries/tags";
import { Tag } from "../../../types";

export type HighlightsSort = "Most Recent" | "Oldest";

interface HighlightsFiltersProps {
  activeSort: HighlightsSort;
  onSortChange: (sort: HighlightsSort) => void;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export const HighlightsFilters: React.FC<HighlightsFiltersProps> = ({
  activeSort,
  onSortChange,
  selectedTagIds,
  onTagsChange,
  expanded,
  onToggleExpanded,
}) => {
  const { data: tags = [] } = useTags();

  const toggleTag = (tagId: string) => {
    onTagsChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };

  const activeCount = (activeSort === "Oldest" ? 1 : 0) + selectedTagIds.length;

  return (
    <View style={styles.container}>
      {/* Header row — always visible, matches Manage Tags */}
      <Pressable onPress={onToggleExpanded} style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="options-outline" size={16} color={Colors.forest} />
          <Text style={styles.title}>Sort & Filter</Text>
          {activeCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeCount}</Text>
            </View>
          )}
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.slate} />
      </Pressable>

      {/* Expanded body */}
      {expanded && (
        <View style={styles.body}>
          {/* Sort */}
          <Text style={styles.sublabel}>Sort by</Text>
          <View style={styles.sortRow}>
            <Pressable
              onPress={() => onSortChange("Most Recent")}
              style={[styles.sortOption, activeSort === "Most Recent" && styles.sortOptionActive]}
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
              style={[styles.sortOption, activeSort === "Oldest" && styles.sortOptionActive]}
            >
              <Ionicons
                name="arrow-up"
                size={13}
                color={activeSort === "Oldest" ? Colors.cream : Colors.forest}
              />
              <Text
                style={[styles.sortOptionText, activeSort === "Oldest" && styles.sortOptionTextActive]}
              >
                Oldest first
              </Text>
            </Pressable>
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <Text style={[styles.sublabel, { marginTop: 16 }]}>Tags</Text>
              <View style={styles.tagWrap}>
                {tags.map((tag: Tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                      style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={11} color={Colors.cream} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                        {tag.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Clear */}
          {activeCount > 0 && (
            <Pressable
              onPress={() => {
                onSortChange("Most Recent");
                onTagsChange([]);
              }}
              style={styles.clearRow}
              hitSlop={8}
            >
              <Ionicons name="close-circle-outline" size={14} color={Colors.slate} />
              <Text style={styles.clearText}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
// Deliberately mirrors the Manage Tags card: same radius, border, and spacing
// so the two collapsible sections read as one family on the page.

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.forest,
  },
  countBadge: {
    backgroundColor: Colors.forest,
    borderRadius: 99,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.cream,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 14,
  },
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
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#EEF5EE",
  },
  tagChipSelected: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  tagChipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.forest,
  },
  tagChipTextSelected: {
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