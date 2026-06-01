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
import { Colors, Fonts, Spacing } from "../../constants/theme";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [dailyHighlight, setDailyHighlight] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(false);

  return (
    <ScreenContainer padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 32) },
        ]}
      >
        <View style={styles.inner}>

          {/* ── Page title (matches Search screen) ──────────────────────── */}
          <Text style={styles.pageTitle}>Settings</Text>

          {/* ── Profile hero ─────────────────────────────────────────────── */}
          <View style={styles.profileHero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>K</Text>
            </View>
            <Text style={styles.profileName}>Keeth</Text>
            <Text style={styles.profileEmail}>keeth@example.com</Text>
          </View>

          {/* ── AfterWord Folio banner ───────────────────────────────────── */}
          {/* Replaces the "Invite friends" card from the inspo with something
              on-brand: a soft forest/amber banner promoting Folio (the mascot). */}
          <Pressable style={styles.bannerCard}>
            {/* Decorative blobs — same as BookDetails hero */}
            <View style={[styles.bannerBlob, styles.bannerBlobAmber]} />
            <View style={[styles.bannerBlob, styles.bannerBlobTeal]} />

            <View style={styles.bannerContent}>
              <Text style={styles.bannerEyebrow}>Your reading buddy</Text>
              <Text style={styles.bannerTitle}>Say hi to Folio 🦊</Text>
              <Text style={styles.bannerSub}>Personalise your AfterWord experience</Text>
            </View>

            {/* AW monogram watermark */}
            <Text style={styles.bannerMonogram} aria-hidden>AW</Text>
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
          <Pressable style={styles.signOutButton}>
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
  inner: {
    padding: Spacing.s20,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    gap: Spacing.s8,
  },

  // Page title — matches Search screen exactly
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s16,
  },

  // ── Profile hero ────────────────────────────────────────────────────────
  profileHero: {
    alignItems: "center",
    paddingVertical: Spacing.s24,
    gap: Spacing.s8,
    marginBottom: Spacing.s8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.forest,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.s8,
    // Subtle ring
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
  },
  profileEmail: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },

  // ── Banner card ─────────────────────────────────────────────────────────
  bannerCard: {
    backgroundColor: Colors.forest,
    borderRadius: 16,
    overflow: "hidden",
    padding: Spacing.s20,
    marginBottom: Spacing.s8,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 88,
    position: "relative",
  },
  bannerBlob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.18,
  },
  bannerBlobAmber: {
    width: 120,
    height: 100,
    backgroundColor: Colors.amber,
    right: -20,
    top: -20,
    borderRadius: 60,
  },
  bannerBlobTeal: {
    width: 80,
    height: 70,
    backgroundColor: "#4a9b8a",
    right: 40,
    bottom: -20,
    borderRadius: 40,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerEyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.amber,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
    opacity: 0.9,
  },
  bannerTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: Colors.white,
    marginBottom: 4,
  },
  bannerSub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 18,
  },
  bannerMonogram: {
    position: "absolute",
    right: 12,
    bottom: -8,
    fontFamily: Fonts.serifBold,
    fontSize: 72,
    color: "rgba(255,255,255,0.05)",
    zIndex: 0,
    userSelect: "none",
  } as any,

  // ── Section label ────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.slate,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: Spacing.s16,
    marginBottom: Spacing.s8,
    paddingHorizontal: Spacing.s4,
    opacity: 0.7,
  },

  // ── Card container ───────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  // ── Row ──────────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s16,
    gap: Spacing.s12,
    backgroundColor: Colors.white,
  },
  rowPressed: {
    backgroundColor: Colors.cream ?? "#F5F1E8",
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
    marginLeft: 60, // indent to align with label, not icon
  },

  // ── Sign out ─────────────────────────────────────────────────────────────
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.s8,
    marginTop: Spacing.s24,
    paddingVertical: Spacing.s16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F5C6C6",
    backgroundColor: "#FEF2F2",
  },
  signOutText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: "#C0392B",
  },
});