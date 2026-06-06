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
import { FolioFox } from "../../src/components/FolioFox";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
};

type ToggleRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavRow({ icon, label, value, danger = false, onPress }: NavRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? Colors.danger ?? "#C0392B" : Colors.forest}
        style={styles.rowLeadIcon}
      />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={danger ? Colors.danger ?? "#C0392B" : Colors.slate}
        style={{ opacity: danger ? 0.7 : 0.45 }}
      />
    </Pressable>
  );
}

function ToggleRow({ icon, label, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={20}
        color={Colors.forest}
        style={styles.rowLeadIcon}
      />
      <Text style={styles.rowLabel}>{label}</Text>
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
  const [dailyReminder, setDailyReminder] = React.useState(true);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/(auth)/sign-in");
  }

  const userEmail = user?.email ?? "";

  return (
    <ScreenContainer padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom + 16, 40) },
        ]}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.s16 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.forest} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Settings</Text>
            <Text style={styles.pageSubtitle}>Customize your experience</Text>
          </View>

          <View style={styles.foxWrap}>
            <FolioFox variant="reading" size={64} />
          </View>
        </View>

        <View style={styles.inner}>
          {/* ── Account ─────────────────────────────────────────────── */}
          <SectionLabel title="Account" />
          <View style={styles.card}>
            <NavRow icon="person-outline" label="Profile Information" />
            <RowDivider />
            <NavRow icon="mail-outline" label="Email" value={userEmail} />
            <RowDivider />
            <NavRow icon="lock-closed-outline" label="Password" />
          </View>

          {/* ── Preferences ─────────────────────────────────────────── */}
          <SectionLabel title="Preferences" />
          <View style={styles.card}>
            <NavRow icon="color-palette-outline" label="Theme" value="System" />
            <RowDivider />
            <NavRow icon="text-outline" label="Font" value="Serif" />
            <RowDivider />
            <NavRow icon="resize-outline" label="Text Size" value="Medium" />
            <RowDivider />
            <NavRow icon="brush-outline" label="Highlight Color" />
            <RowDivider />
            <ToggleRow
              icon="notifications-outline"
              label="Daily Reminder"
              value={dailyReminder}
              onToggle={setDailyReminder}
            />
          </View>

          {/* ── Data & Sync ──────────────────────────────────────────── */}
          <SectionLabel title="Data & Sync" />
          <View style={styles.card}>
            <NavRow icon="cloud-outline" label="Backup & Sync" value="On" />
            <RowDivider />
            <NavRow icon="cloud-upload-outline" label="Import Highlights" />
            <RowDivider />
            <NavRow icon="cloud-download-outline" label="Export Data" />
            <RowDivider />
            <NavRow
              icon="trash-outline"
              label="Delete Account"
              danger
              onPress={() => {}}
            />
          </View>

          {/* ── Other ───────────────────────────────────────────────── */}
          <SectionLabel title="Other" />
          <View style={styles.card}>
            <NavRow icon="help-circle-outline" label="Help & Support" />
            <RowDivider />
            <NavRow icon="gift-outline" label="What's New" />
            <RowDivider />
            <NavRow icon="information-circle-outline" label="About AfterWord" />
          </View>

          {/* ── Sign out ─────────────────────────────────────────────── */}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.logOutRow,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color={Colors.danger ?? "#C0392B"}
            />
            <Text style={styles.logOutText}>Log Out</Text>
          </Pressable>

          <Text style={styles.version}>v1.4.2</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: Colors.cream,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.s20,
    paddingBottom: Spacing.s20,
    backgroundColor: Colors.cream,
  },
  backBtn: {
    marginRight: Spacing.s12,
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 32,
    color: Colors.forest,
    lineHeight: 38,
  },
  pageSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginTop: 2,
  },
  foxWrap: {
    marginLeft: Spacing.s8,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // ── Inner ────────────────────────────────────────────────────────────────
  inner: {
    paddingHorizontal: Spacing.s20,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },

  // ── Section label — plain weight, matches mockup ─────────────────────────
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
    marginTop: Spacing.s24,
    marginBottom: Spacing.s10,
    paddingHorizontal: Spacing.s4,
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  // ── Row ──────────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.s16,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    gap: Spacing.s12,
  },
  rowPressed: {
    backgroundColor: Colors.cream,
  },
  rowLeadIcon: {
    width: 24,
    textAlign: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
  },
  rowLabelDanger: {
    color: Colors.danger ?? "#C0392B",
  },
  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginRight: 2,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 52, // aligns under label text, past icon
  },

  // ── Log out ──────────────────────────────────────────────────────────────
  logOutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.s8,
    marginTop: Spacing.s32,
    paddingVertical: Spacing.s8,
  },
  logOutText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.danger ?? "#C0392B",
  },
  version: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    opacity: 0.5,
    textAlign: "center",
    marginTop: Spacing.s8,
  },
});