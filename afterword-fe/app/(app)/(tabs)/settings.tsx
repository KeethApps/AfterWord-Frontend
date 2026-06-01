import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { AppHeader, Card, SectionHeader } from "../../../src/components";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";

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
          trackColor={{ false: Colors.border, true: Colors.forest }}
          thumbColor={Colors.white}
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
    <ScreenContainer padded={false}>
      <AppHeader title="Settings" />
      <View style={styles.content}>

        {/* Account */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <Card elevated style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>K</Text>
              </View>
              <View>
                <Text style={styles.profileName}>Keeth</Text>
                <Text style={styles.profileEmail}>keeth@example.com</Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.s20,
    gap: Spacing.s24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    gap: 0,
  },
  card: {
    paddingHorizontal: Spacing.s20,
    paddingVertical: Spacing.s8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s16,
    paddingVertical: Spacing.s16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.amber,
  },
  profileName: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.forest,
  },
  profileEmail: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.s16,
    gap: Spacing.s16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.forest,
  },
  settingDesc: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginTop: 3,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Spacing.s20,
  },
});
