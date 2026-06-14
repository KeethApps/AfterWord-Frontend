import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts, Spacing } from "../../constants/theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Click-away backdrop */}
      {isDropdownOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsDropdownOpen(false)}
        />
      )}

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.s12,
          },
        ]}
      >
        {/* Title */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>{title}</Text>

          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Avatar + Dropdown */}
        <View style={styles.avatarContainer}>
          <Pressable
            onPress={() => setIsDropdownOpen((prev) => !prev)}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Image
              source={require("../../assets/crane/crane-icon.png")}
              style={styles.avatarImage}
            />
          </Pressable>

          {isDropdownOpen && (
            <View style={styles.dropdown}>
              <Pressable
                style={({ pressed }) => [
                  styles.dropdownItem,
                  pressed && styles.dropdownItemPressed,
                ]}
                onPress={() => {
                  setIsDropdownOpen(false);
                  router.push("/settings");
                }}
              >
                <Ionicons
                  name="settings-outline"
                  size={18}
                  color={Colors.forest}
                />

                <Text style={styles.dropdownText}>
                  Settings
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: Spacing.s20,
    paddingBottom: Spacing.s16,

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,

    backgroundColor: Colors.cream,

    zIndex: 50,
  },

  titleArea: {
    flex: 1,
    paddingRight: Spacing.s16,
  },

  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.forest,
  },

  subtitle: {
    marginTop: 2,

    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },

  avatarContainer: {
    position: "relative",
    zIndex: 60,
  },

  avatarButton: {
    borderRadius: 999,
  },

  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 999,

    borderWidth: 1,
    borderColor: Colors.border,

    backgroundColor: Colors.white,
  },

  dropdown: {
    position: "absolute",
    top: 62,
    right: 0,

    width: 180,

    backgroundColor: Colors.white,

    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,

    paddingVertical: 6,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,

    elevation: 12,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",

    gap: 12,

    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 12,
    marginHorizontal: 6,
  },

  dropdownItemPressed: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  dropdownText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
  },
});