import React from "react";
import { ScrollView, View, StyleSheet, ViewStyle, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padded?: boolean;
}

export function ScreenContainer({
  children,
  style,
  scrollable = true,
  padded = true,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  
  // The absolute mobile navbar is approx 90px tall (72px pill + 16px bottom padding).
  // We add this to the contentContainerStyle paddingBottom so you can scroll to the very end.
  const bottomPadding = Platform.OS === 'web' ? 40 : Math.max(insets.bottom, 16) + 80;

  const inner = (
    <View style={[styles.inner, padded && styles.padded, style]}>
      {children}
    </View>
  );

  if (!scrollable) {
    return (
      <View style={[styles.container, { paddingBottom: bottomPadding }]}>
        {inner}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  padded: {
    padding: Platform.OS === 'web' ? 40 : 20,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
  },
});
