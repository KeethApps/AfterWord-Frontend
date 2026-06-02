import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Fonts, Spacing } from "../../constants/theme";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
};

type ToggleRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavRow({ icon, label, onPress }: NavRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.forest} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.slate} style={{ opacity: 0.5 }} />
    </Pressable>
  );
}

function ToggleRow({ icon, label, description, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.forest} />
      </View>
      <View style={styles.toggleInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && <Text style={styles.rowDesc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.forest }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

function RowDivider() {
  return <View style={styles.divider} />;
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [dailyHighlight, setDailyHighlight] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/(auth)/sign-in");
  }

  const userEmail = user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "?";
  const displayName = userEmail.split("@")[0] || "Reader";

return (
  <ScreenContainer padded={false}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: Math.max(insets.bottom, 32) },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.s12,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={Colors.forest}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.pageTitle}>Settings</Text>

          <Text style={styles.pageSubtitle}>
            Personalise your reading sanctuary
          </Text>
        </View>
      </View>

      <View style={styles.inner}>
        {/* ── Profile hero ─────────────────────────────────────────────── */}
        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInitial}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {displayName}
            </Text>

            <Text style={styles.profileEmail}>
              {userEmail}
            </Text>
          </View>
        </View>

        {/* ── Folio Banner ─────────────────────────────────────────────── */}
        <Pressable style={styles.bannerCard}>
          <View
            style={[
              styles.bannerBlob,
              styles.bannerBlobAmber,
            ]}
          />

          <View
            style={[
              styles.bannerBlob,
              styles.bannerBlobTeal,
            ]}
          />

          <View style={styles.bannerContent}>
            <Text style={styles.bannerEyebrow}>
              Your reading companion
            </Text>

            <Text style={styles.bannerTitle}>
              Folio is here to help
            </Text>

            <Text style={styles.bannerSub}>
              Build your personal archive of ideas,
              insights, and forgotten passages.
            </Text>
          </View>

          <Text style={styles.bannerMonogram}>
            AW
          </Text>
        </Pressable>

          {/* ── Account ──────────────────────────────────────────────────── */}
          <SectionLabel title="Account" />
          <View style={styles.card}>
            <NavRow icon="person-outline" label="Manage profile" />
            <RowDivider />
            <NavRow icon="cloud-upload-outline" label="Export data" />
            <RowDivider />
            <NavRow icon="cloud-download-outline" label="Import data" />
          </View>

          {/* ── Preferences ──────────────────────────────────────────────── */}
          <SectionLabel title="Preferences" />
          <View style={styles.card}>
            <ToggleRow
              icon="sunny-outline"
              label="Daily highlight"
              description="Show a random highlight on the home screen."
              value={dailyHighlight}
              onToggle={setDailyHighlight}
            />
            <RowDivider />
            <ToggleRow
              icon="wifi-outline"
              label="Offline mode"
              description="Keep your library available without internet."
              value={offlineMode}
              onToggle={setOfflineMode}
            />
            <RowDivider />
            <ToggleRow
              icon="bar-chart-outline"
              label="Analytics"
              description="Share anonymous usage data to help improve the app."
              value={analytics}
              onToggle={setAnalytics}
            />
          </View>

          {/* ── Support ──────────────────────────────────────────────────── */}
          <SectionLabel title="Support" />
          <View style={styles.card}>
            <NavRow icon="help-circle-outline" label="Help & support" />
            <RowDivider />
            <NavRow icon="bug-outline" label="Report a bug" />
            <RowDivider />
            <NavRow icon="document-text-outline" label="Privacy policy" />
            <RowDivider />
            <NavRow icon="reader-outline" label="Terms of service" />
          </View>

          {/* ── About ────────────────────────────────────────────────────── */}
          <SectionLabel title="About" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.forest} />
              </View>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>v1.0.0 Preview</Text>
            </View>
          </View>

          {/* ── Sign out ─────────────────────────────────────────────────── */}
          <Pressable
            style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color="#C0392B" />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: Spacing.s20,
    paddingBottom: Spacing.s20,

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,

    backgroundColor: Colors.cream,

    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.white,

    borderWidth: 1,
    borderColor: Colors.border,

    marginRight: Spacing.s16,
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 30,
    color: Colors.forest,
  },

  pageSubtitle: {
    marginTop: 2,

    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },

  // ── Content Wrapper ─────────────────────────────────────────────────────
  inner: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s24,

    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },

  // ── Profile Hero ────────────────────────────────────────────────────────
  profileHero: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.white,

    borderWidth: 1,
    borderColor: Colors.border,

    borderRadius: 24,

    padding: Spacing.s20,

    marginBottom: Spacing.s24,
  },

  profileInfo: {
    flex: 1,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,

    backgroundColor: Colors.forest,

    alignItems: "center",
    justifyContent: "center",

    marginRight: Spacing.s16,

    borderWidth: 3,
    borderColor: Colors.amber,
  },

  avatarText: {
    fontFamily: Fonts.serifBold,
    fontSize: 30,
    color: Colors.amber,
  },

  profileName: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.forest,

    marginBottom: 2,
  },

  profileEmail: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },

  // ── Banner Card ─────────────────────────────────────────────────────────
  bannerCard: {
    backgroundColor: Colors.forest,

    borderRadius: 24,

    overflow: "hidden",

    padding: Spacing.s24,

    marginBottom: Spacing.s24,

    minHeight: 140,

    justifyContent: "center",

    position: "relative",
  },

  bannerBlob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.16,
  },

  bannerBlobAmber: {
    width: 140,
    height: 120,

    backgroundColor: Colors.amber,

    right: -20,
    top: -30,
  },

  bannerBlobTeal: {
    width: 90,
    height: 80,

    backgroundColor: "#4a9b8a",

    right: 50,
    bottom: -20,
  },

  bannerContent: {
    flex: 1,
    zIndex: 1,
  },

  bannerEyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 11,

    color: Colors.amber,

    letterSpacing: 1,
    textTransform: "uppercase",

    marginBottom: 6,

    opacity: 0.9,
  },

  bannerTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,

    color: Colors.white,

    marginBottom: 8,
  },

  bannerSub: {
    fontFamily: Fonts.sans,
    fontSize: 14,

    color: "rgba(255,255,255,0.72)",

    lineHeight: 22,

    maxWidth: "85%",
  },

  bannerMonogram: {
    position: "absolute",

    right: 12,
    bottom: -12,

    fontFamily: Fonts.serifBold,
    fontSize: 92,

    color: "rgba(255,255,255,0.05)",

    zIndex: 0,

    userSelect: "none",
  } as any,

  // ── Section Labels ──────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,

    color: Colors.slate,

    letterSpacing: 1,
    textTransform: "uppercase",

    marginTop: Spacing.s24,
    marginBottom: Spacing.s10,

    paddingHorizontal: Spacing.s4,

    opacity: 0.7,
  },

  // ── Card Containers ─────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,

    borderRadius: 20,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  // ── Rows ────────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: Spacing.s18,
    paddingVertical: Spacing.s18,

    gap: Spacing.s14,

    backgroundColor: Colors.white,
  },

  rowPressed: {
    backgroundColor: "#F7F4EC",
  },

  rowIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: "#F0F4F0",

    alignItems: "center",
    justifyContent: "center",
  },

  rowLabel: {
    flex: 1,

    fontFamily: Fonts.sans,
    fontSize: 15,

    color: Colors.forest,

    fontWeight: "500",
  },

  rowDesc: {
    fontFamily: Fonts.sans,
    fontSize: 12,

    color: Colors.slate,

    marginTop: 2,

    lineHeight: 16,
  },

  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: 13,

    color: Colors.slate,
  },

  toggleInfo: {
    flex: 1,
  },

  divider: {
    height: 1,

    backgroundColor: Colors.border,

    marginLeft: 64,
  },

  // ── Sign Out ────────────────────────────────────────────────────────────
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: Spacing.s10,

    marginTop: Spacing.s32,
    marginBottom: Spacing.s32,

    paddingVertical: Spacing.s18,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#F5C6C6",

    backgroundColor: "#FEF2F2",
  },

  signOutButtonPressed: {
    backgroundColor: "#FECACA",
  },

  signOutText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,

    color: "#C0392B",
  },
});