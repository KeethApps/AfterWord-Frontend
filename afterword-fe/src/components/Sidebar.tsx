/**
 * Sidebar — persistent left navigation for AfterWord desktop layout.
 * Matches the dark forest-green sidebar from the mockup.
 */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "../theme";
import { FolioFox } from "./FolioFox";

interface NavItem {
  label: string;
  route: string;
  icon: string; // emoji / unicode icon — no icon lib dependency
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home",     route: "/",        icon: "⌂"  },
  { label: "Library",  route: "/library", icon: "📚" },
  { label: "Search",   route: "/search",  icon: "🔍" },
  { label: "Upload",   route: "/upload",  icon: "↑"  },
  { label: "Settings", route: "/settings",icon: "⚙"  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) => {
    if (route === "/") return pathname === "/" || pathname === "/index";
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.sidebar}>
      {/* Logo / Brand */}
      <View style={styles.logoArea}>
        <FolioFox size={48} variant="reading" />
        <View style={styles.logoText}>
          <Text style={styles.logoTitle}>AfterWord</Text>
          <Text style={styles.logoTagline}>Remember What You Read</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Navigation */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={({ hovered, pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                (hovered && !active) && styles.navItemHovered,
                pressed && styles.navItemPressed,
              ]}
              accessibilityRole="link"
              accessibilityLabel={item.label}
            >
              <Text style={[styles.navIcon, active && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
              {active && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Bottom spacer + version */}
      <View style={styles.sidebarFooter}>
        <View style={styles.divider} />
        <Text style={styles.versionText}>v1.0.0 — Preview</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: spacing.sidebarWidth,
    height: "100%" as any,
    backgroundColor: colors.sidebarBg,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    flexDirection: "column",
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    flexShrink: 0,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  logoText: {
    flexDirection: "column",
  },
  logoTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  logoTagline: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.sidebarText,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
  },
  nav: {
    flex: 1,
    paddingTop: spacing[2],
    paddingHorizontal: spacing[3],
    gap: spacing[1],
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    gap: spacing[3],
    position: "relative",
  },
  navItemActive: {
    backgroundColor: colors.sidebarActiveBg,
  },
  navItemHovered: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  navItemPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
    transform: [{ scale: 0.98 }],
  },
  navIcon: {
    fontSize: 16,
    color: colors.sidebarText,
    width: 20,
    textAlign: "center",
  },
  navIconActive: {
    color: colors.amber,
  },
  navLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.sidebarText,
    fontWeight: "400",
    flex: 1,
  },
  navLabelActive: {
    color: colors.sidebarActiveText,
    fontWeight: "600",
  },
  activeIndicator: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.amber,
    position: "absolute",
    right: 0,
    top: "50%" as any,
    transform: [{ translateY: -10 }],
  },
  sidebarFooter: {
    paddingBottom: spacing[2],
  },
  versionText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    marginTop: spacing[2],
    letterSpacing: 0.5,
  },
});
