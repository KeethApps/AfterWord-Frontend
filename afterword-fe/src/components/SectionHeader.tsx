import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

export function SectionHeader({
  title,
  onViewAll,
  viewAllLabel = "View all",
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onViewAll && (
        <Pressable
          onPress={onViewAll}
          style={({ hovered }) => [styles.viewAll, hovered && styles.viewAllHovered]}
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>{viewAllLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.s16,
  },
  title: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.forest,
  },
  viewAll: {
    paddingVertical: Spacing.s4,
    paddingHorizontal: Spacing.s8,
    borderRadius: 6,
  },
  viewAllHovered: {
    backgroundColor: Colors.mist,
  },
  viewAllText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    fontWeight: "500",
  },
});
