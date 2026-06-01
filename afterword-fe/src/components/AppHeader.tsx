import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({
  title,
  subtitle,
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.s16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  titleArea: {
    flexDirection: "column",
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.forest,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginTop: 2,
  },
});
