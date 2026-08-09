import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";

interface CollapsibleCardProps {
  /** Icon name from Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  /** Optional badge count shown in the header */
  badgeCount?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Reusable collapsible section card.
 * Used by Sort & Filter and Manage Tags panels.
 * Matches the white-card / border / rounded-12 design token.
 */
export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  icon,
  title,
  badgeCount,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <View style={styles.container}>
      {/* Header row — always visible */}
      <Pressable onPress={onToggle} style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name={icon} size={16} color={Colors.forest} />
          <Text style={styles.title}>{title}</Text>
          {badgeCount != null && badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.slate}
        />
      </Pressable>

      {/* Expanded body */}
      {expanded && (
        <View style={styles.body}>{children}</View>
      )}
    </View>
  );
};

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
  badge: {
    backgroundColor: Colors.forest,
    borderRadius: 99,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.cream,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 14,
  },
});
