import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { Colors } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  accent?: boolean; // amber left bar highlight
}

export function Card({
  children,
  style,
  onPress,
  elevated = false,
  accent = false,
}: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        accent && styles.cardAccented, // extra left padding to clear the bar
        style,
      ]}
    >
      {/* Gold accent bar — absolutely positioned so it doesn't affect border */}
      {accent && <View style={styles.accentBar} />}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ hovered }: any) => [
          styles.pressable,
          hovered && styles.pressableHovered,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  } as ViewStyle,
  cardAccented: {
    // Shift content right so it doesn't sit behind the 3px bar
    paddingLeft: 6,
  } as ViewStyle,
  accentBar: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderRadius: 2,
    backgroundColor: Colors.gold,
    opacity: 0.65,
  } as ViewStyle,
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  } as ViewStyle,
  pressable: {
    borderRadius: 16,
  },
  pressableHovered: {
    transform: [{ translateY: -1 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
});