/**
 * Settings Screen — app preferences placeholder.
 */
import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { AppHeader, Card, SectionHeader } from "../src/components";
import { colors, spacing, radius, typography } from "../src/theme";

interface SettingRowProps {
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
}

function SettingRow({ label, description, value, onToggle }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      {onToggle !== undefined && value !== undefined && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.forest }}
          thumbColor={colors.surface}
        />
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const [dailyHighlight, setDailyHighlight] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(false);

  return (
    <View style={styles.screen}>
      <AppHeader title="Settings" />
      <View style={styles.content}>

        {/* Account */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <Card elevated style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>A</Text>
              </View>
              <View>
                <Text style={styles.profileName}>AfterWord User</Text>
                <Text style={styles.profileEmail}>user@example.com</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader title="Preferences" />
          <Card elevated style={styles.card}>
            <SettingRow
              label="Daily Highlight"
              description="Show a random highlight each day on the home screen."
              value={dailyHighlight}
              onToggle={setDailyHighlight}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Offline Mode"
              description="Keep your library available without an internet connection."
              value={offlineMode}
              onToggle={setOfflineMode}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Analytics"
              description="Help improve AfterWord by sharing anonymous usage data."
              value={analytics}
              onToggle={setAnalytics}
            />
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <Card elevated style={styles.card}>
            <SettingRow label="Version" description="v1.0.0 — Preview Build" />
            <View style={styles.divider} />
            <SettingRow label="Privacy Policy" />
            <View style={styles.divider} />
            <SettingRow label="Terms of Service" />
          </Card>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing[8],
    gap: spacing[6],
    maxWidth: 640,
  },
  section: {
    gap: 0,
  },
  card: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingVertical: spacing[4],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: typography.Fontsdisplay,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.amber,
  },
  profileName: {
    fontFamily: typography.Fontsbody,
    fontSize: typography.sizes.base,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  profileEmail: {
    fontFamily: typography.Fontsbody,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[4],
    gap: spacing[4],
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: typography.Fontsbody,
    fontSize: typography.sizes.base,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  settingDesc: {
    fontFamily: typography.Fontsbody,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: -spacing[5],
  },
});
