import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FolioFox } from "@/src/components/FolioFox";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.wrapper}>
        <View style={styles.content}>
          <FolioFox variant="sad" size={180} style={styles.fox} />

          <Text style={styles.errorCode}>404 Not Found</Text>
          <Text style={styles.title}>Lost in the Library?</Text>
          <Text style={styles.description}>
            We couldn&apos;t find the page you were looking for. The bookmarks might
            have been moved or the page deleted.
          </Text>

          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    maxWidth: 400,
    width: "100%",
  },
  fox: {
    marginBottom: Spacing.s24,
  },
  errorCode: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.gold,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: Spacing.s8,
  },
  wrapper: {
  flex: 1,
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
},
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 26,
    color: Colors.forest,
    textAlign: "center",
    marginBottom: Spacing.s12,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.s32,
  },
  button: {
    backgroundColor: Colors.forest,
    paddingVertical: Spacing.s14,
    paddingHorizontal: Spacing.s24,
    borderRadius: 9999,
    shadowColor: Colors.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: Fonts.sansBold,
    color: Colors.cream,
    fontSize: 14,
  },
});
