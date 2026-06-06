import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { FolioFox } from "../FolioFox";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { useProfile } from "@/hooks/auth/useProfile";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GreetingHeaderProps {
  hasContent: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getSubtext(hasContent: boolean): string {
  return hasContent
    ? "Let's revisit something meaningful."
    : "Let's build your library of ideas.";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function NameSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeleton, { opacity }]} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  hasContent,
}) => {
  const { profile, isLoading } = useProfile();
  const hour = new Date().getHours();

  // Fade + slide in once name is ready
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  const foxVariant = hasContent ? "waving" : "sad";
  const firstName = profile?.displayName?.split(" ")[0] ?? null;

  return (
    <View style={styles.container}>

      <View style={styles.row}>
        <View style={styles.foxWrap}>
          <FolioFox variant={foxVariant} size={120} />
          </View>
        {/* Left: greeting text */}
        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{getGreeting(hour)},</Text>

          {/* Name or skeleton */}
          {isLoading ? (
            <NameSkeleton />
          ) : (
            <Animated.Text
              style={[
                styles.name,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }],
                },
              ]}
            >
              {firstName ?? "Reader"}
            </Animated.Text>
          )}

          <Animated.Text
            style={[
              styles.subtext,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            {getSubtext(hasContent)}
          </Animated.Text>
        </View>

      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.s24,
    marginTop: Spacing.s24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textBlock: {
    flex: 1,
    paddingRight: Spacing.s12,
    gap: 4,
  },
  greeting: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginBottom: 2,
  },
  name: {
    fontFamily: Fonts.serifBold,
    fontSize: 34,
    color: Colors.forest,
    lineHeight: 40,
  },
  subtext: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    lineHeight: 20,
    marginTop: 6,
  },
  foxWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.s16,
  },
  skeleton: {
    height: 40,
    width: 140,
    borderRadius: 8,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
});