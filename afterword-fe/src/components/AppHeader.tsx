import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
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
      {/* Header Container */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.headerIcons}>
          <Pressable onPress={() => setIsDropdownOpen(true)}>
            <Image
              source={require("../../assets/fox/fox-icon.png")}
              style={styles.avatarImage}
            />
          </Pressable>
        </View>
      </View>

      {/* Backdrop for closing dropdown */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Dropdown Menu */}
        <View style={[styles.dropdown, { top: insets.top + 60 }]}>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => {
              setIsDropdownOpen(false);
              router.push("/profile");
            }}
          >
            <Ionicons name="person-outline" size={18} color={Colors.forest} />
            <Text style={styles.dropdownText}>Profile</Text>
          </Pressable>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => {
              setIsDropdownOpen(false);
              router.push("/settings");
            }}
          >
            <Ionicons name="settings-outline" size={18} color={Colors.forest} />
            <Text style={styles.dropdownText}>Settings</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.s16,
    paddingBottom: Spacing.s16,
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
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    right: Spacing.s16,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 6,
    minWidth: 160,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  dropdownText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
  },
});