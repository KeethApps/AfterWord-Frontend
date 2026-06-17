import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Colors, Fonts, Spacing } from "../../constants/theme";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/auth/useProfile";
import { FolioFox } from "../../src/components/FolioFox";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";


// ─── Types ────────────────────────────────────────────────────────────────────

type NavRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
  danger?: boolean;
  muted?: boolean;
  onPress?: () => void;
};

type ToggleRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  sublabel?: string;
  value: boolean;
  disabled?: boolean;
  onToggle: (v: boolean) => void;
};

type SheetId = "profile" | "help" | "whatsNew" | "about" | null;

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

function BottomSheet({ visible, onClose, children }: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent        // ← key for Android: modal covers the status bar properly
      onRequestClose={onClose}
    >
      <View style={sheet.overlay}>
        <Pressable style={sheet.backdrop} onPress={onClose} />
        <View style={sheet.container}>
          <View style={sheet.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={sheet.scroll}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s12,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.s16,
  },
  scroll: {
    flex: 1,
  },
});

// ─── Sheet Contents ───────────────────────────────────────────────────────────

function ProfileSheetContent({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!user) return;
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Display name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        // Invalidate profile query to update UI everywhere
        await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        Alert.alert("Success", "Profile updated successfully!");
        onClose();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setSending(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <View>
      <Text style={sheetStyles.title}>Profile</Text>

      <Text style={sheetStyles.label}>Display name</Text>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={Colors.forest}
          style={{ marginVertical: Spacing.s12, alignSelf: "flex-start" }}
        />
      ) : (
        <View style={sheetStyles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={16}
            color={Colors.slate}
            style={sheetStyles.inputIcon}
          />
          <TextInput
            style={sheetStyles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
            placeholderTextColor={Colors.slate + "88"}
            autoCapitalize="words"
            maxLength={40}
          />
        </View>
      )}

      <Text style={[sheetStyles.label, { marginTop: Spacing.s20 }]}>
        Email address
      </Text>
      <View style={sheetStyles.valueBox}>
        <Ionicons name="mail-outline" size={16} color={Colors.slate} />
        <Text style={sheetStyles.valueText} numberOfLines={1}>
          {email}
        </Text>
      </View>

      <Pressable
        onPress={handleSaveProfile}
        disabled={saving || isLoading}
        style={({ pressed }) => [
          sheetStyles.actionBtn,
          { marginTop: Spacing.s24, backgroundColor: Colors.forest },
          pressed && { opacity: 0.7 },
          (saving || isLoading) && { opacity: 0.5 },
        ]}
      >
        {saving ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={sheetStyles.actionBtnText}>Save Changes</Text>
        )}
      </Pressable>

      <View style={[sheetStyles.divider, { marginVertical: Spacing.s24 }]} />

      <Text style={sheetStyles.label}>Password</Text>
      {sent ? (
        <View style={sheetStyles.sentBanner}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.forest} />
          <Text style={sheetStyles.sentText}>
            Reset link sent — check your inbox.
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={handleChangePassword}
          disabled={sending}
          style={({ pressed }) => [
            sheetStyles.actionBtn,
            { backgroundColor: Colors.slate },
            pressed && { opacity: 0.7 },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={sheetStyles.actionBtnText}>Send reset email</Text>
          )}
        </Pressable>
      )}

      <Text style={sheetStyles.hint}>
        We'll send a password reset link to {email}.
      </Text>
    </View>
  );
}

function HelpSheetContent() {
  const faqs = [
    {
      q: "How do I import my Kindle highlights?",
      a: 'Go to Import on the home screen and upload your "My Clippings.txt" file from your Kindle via USB.',
    },
    {
      q: "Why are some highlights missing?",
      a: "Amazon clips highlights at 10% of a book's content for DRM-protected titles. Highlights beyond that limit won't appear in your clippings file.",
    },
    {
      q: "How does Daily Highlight work?",
      a: "Each day AfterWord resurfaces a highlight from your library, weighted toward books you've read recently and highlights you've marked as favourites.",
    },
    {
      q: "Is my data private?",
      a: "Yes. Your highlights are stored securely in your account and are never shared or used for any purpose other than powering your AfterWord experience.",
    },
  ];

  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <View>
      <Text style={sheetStyles.title}>Help & Support</Text>
      <Text style={sheetStyles.body}>
        Common questions about using AfterWord.
      </Text>

      {faqs.map((item, i) => (
        <Pressable
          key={i}
          onPress={() => setOpen(open === i ? null : i)}
          style={sheetStyles.faqRow}
        >
          <View style={sheetStyles.faqHeader}>
            <Text style={sheetStyles.faqQ}>{item.q}</Text>
            <Ionicons
              name={open === i ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.slate}
            />
          </View>
          {open === i && <Text style={sheetStyles.faqA}>{item.a}</Text>}
        </Pressable>
      ))}

      <View style={sheetStyles.divider} />
      <Text style={sheetStyles.label}>Still stuck?</Text>
      <Text style={sheetStyles.body}>
        Reach us at{" "}
        <Text style={{ color: Colors.forest, fontFamily: Fonts.sansBold }}>
          getafterword@gmail.com
        </Text>
      </Text>
    </View>
  );
}

function WhatsNewSheetContent() {
  const releases = [
    {
      version: "1.4.2",
      date: "June 2026",
      badge: "Latest",
      items: [
        "Daily Highlight resurfacing now weights your favourites",
        "Smoother upload flow with better progress feedback",
        "Fixed a bug where long book titles clipped on the highlights card",
      ],
    },
    {
      version: "1.4.0",
      date: "May 2026",
      badge: null,
      items: [
        "Redesigned Search with instant full-text results",
        "Favourites strip on the highlights screen",
        "New Settings page (you're looking at it!)",
      ],
    },
    {
      version: "1.3.0",
      date: "April 2026",
      badge: null,
      items: [
        "Export your highlights as a CSV",
        "Staggered animations on the library screen",
        "Folio the Fox says hello 🦊",
      ],
    },
  ];

  return (
    <View>
      <Text style={sheetStyles.title}>What's New</Text>
      {releases.map((r, i) => (
        <View key={i} style={i > 0 ? { marginTop: Spacing.s24 } : {}}>
          <View style={sheetStyles.releaseHeader}>
            <Text style={sheetStyles.releaseVersion}>v{r.version}</Text>
            {r.badge && (
              <View style={sheetStyles.badge}>
                <Text style={sheetStyles.badgeText}>{r.badge}</Text>
              </View>
            )}
            <Text style={sheetStyles.releaseDate}>{r.date}</Text>
          </View>
          {r.items.map((item, j) => (
            <View key={j} style={sheetStyles.changeRow}>
              <View style={sheetStyles.bullet} />
              <Text style={sheetStyles.changeText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function AboutSheetContent() {
  return (
    <View>
      <View style={sheetStyles.aboutHero}>
        <FolioFox variant="reading" size={72} />
        <Text style={sheetStyles.aboutAppName}>AfterWord</Text>
        <Text style={sheetStyles.aboutVersion}>Version 1.4.2</Text>
      </View>

      <Text style={sheetStyles.body}>
        AfterWord is a personal library for your Kindle highlights — a quiet
        place to revisit the ideas, sentences, and passages that stayed with
        you.
      </Text>

      <View style={[sheetStyles.divider, { marginVertical: Spacing.s20 }]} />

      <Text style={sheetStyles.label}>Built with</Text>
      <Text style={sheetStyles.body}>
        Expo · React Native · Supabase · TypeScript
      </Text>

      <View style={[sheetStyles.divider, { marginVertical: Spacing.s20 }]} />

      <Text style={sheetStyles.label}>Legal</Text>
      <Text style={[sheetStyles.body, { marginBottom: Spacing.s8 }]}>
        © 2026 AfterWord. All rights reserved.
      </Text>
      <Text style={sheetStyles.hint}>
        By using AfterWord you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cream,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.s12,
  },
  inputIcon: {
    marginRight: Spacing.s8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
    paddingVertical: 13,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 26,
    color: Colors.forest,
    marginBottom: Spacing.s16,
  },
  label: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.forest,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: Spacing.s8,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    lineHeight: 22,
    marginBottom: Spacing.s8,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    opacity: 0.65,
    marginTop: Spacing.s8,
    lineHeight: 18,
  },
  valueBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    backgroundColor: Colors.cream,
    borderRadius: 10,
    paddingHorizontal: Spacing.s12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  valueText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
    flex: 1,
  },
  actionBtn: {
    backgroundColor: Colors.forest,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.white,
  },
  sentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    backgroundColor: "#EEF5EE",
    borderRadius: 10,
    paddingHorizontal: Spacing.s12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.forest + "33",
  },
  sentText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  // FAQ
  faqRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.s14 ?? 14,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.s8,
  },
  faqQ: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
    flex: 1,
    lineHeight: 20,
  },
  faqA: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    lineHeight: 20,
    marginTop: Spacing.s8,
  },
  // What's New
  releaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    marginBottom: Spacing.s10,
  },
  releaseVersion: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
  },
  releaseDate: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginLeft: "auto",
  },
  badge: {
    backgroundColor: Colors.forest,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s8,
    marginBottom: Spacing.s6 ?? 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.forest,
    marginTop: 7,
    opacity: 0.5,
  },
  changeText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    flex: 1,
    lineHeight: 20,
  },
  // About
  aboutHero: {
    alignItems: "center",
    marginBottom: Spacing.s20,
  },
  aboutAppName: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.forest,
    marginTop: Spacing.s8,
  },
  aboutVersion: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginTop: 2,
  },
});

// ─── Row Components ───────────────────────────────────────────────────────────

function NavRow({ icon, label, value, danger = false, muted = false, onPress }: NavRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? Colors.danger ?? "#C0392B" : muted ? Colors.slate : Colors.forest}
        style={[styles.rowLeadIcon, muted && { opacity: 0.45 }]}
      />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger, muted && styles.rowLabelMuted]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={danger ? Colors.danger ?? "#C0392B" : Colors.slate}
        style={{ opacity: danger ? 0.7 : 0.35 }}
      />
    </Pressable>
  );
}

function ToggleRow({ icon, label, sublabel, value, disabled = false, onToggle }: ToggleRowProps) {
  return (
    <View style={[styles.row, disabled && { opacity: 0.5 }]}>
      <Ionicons
        name={icon}
        size={20}
        color={Colors.forest}
        style={styles.rowLeadIcon}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel ? (
          <Text style={styles.rowSublabel}>{sublabel}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
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

// ─── Delete Account Confirmation ──────────────────────────────────────────────

// confirmDeleteAccount removed — see handleDeleteAccount / performDeleteAccount below

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [dailyReminder, setDailyReminder] = React.useState(true);
  const [activeSheet, setActiveSheet] = React.useState<SheetId>(null);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [exportingData, setExportingData] = React.useState(false);

  const userEmail = user?.email ?? "";

  function openSheet(id: SheetId) {
    setActiveSheet(id);
  }

  function closeSheet() {
    setActiveSheet(null);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/(auth)/sign-in");
  }

  // Async work lives here, NOT inside the Alert callback.
  // Alert.alert's onPress is synchronous — awaiting inside it silently swallows
  // errors and state updates never fire.
  async function performDeleteAccount() {
    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Delete failed");
      }

      await supabase.auth.signOut();
      router.replace("/(auth)/sign-in");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not delete account");
    } finally {
      setDeletingAccount(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your highlights. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => { performDeleteAccount(); },
        },
      ]
    );
  }
  const CANNY_URL =
  "https://afterwordapp.canny.io/bug-reports/create?title=Bug+Report&details=%5BDescribe+the+bug%5D%0A%0A**Steps+to+reproduce%3A**%0A1.+%0A2.+%0A3.+%0A%0A**Expected+behaviour%3A**%0A%0A**Actual+behaviour%3A**%0A%0A**Device+%2F+OS+version%3A**%0A";

async function handleReportBug() {
  const supported = await Linking.canOpenURL(CANNY_URL);
  if (supported) {
    await Linking.openURL(CANNY_URL);
  } else {
    Alert.alert("Error", "Could not open the bug report page.");
  }
}

  async function handleExportData() {
    if (exportingData) return;
    setExportingData(true);
    try {
      // Query all highlights for the current user
      const { data, error } = await supabase
        .from("highlights")
        .select("book_title, author, content, location, highlighted_at")
        .order("highlighted_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        Alert.alert("No data", "You don't have any highlights to export yet.");
        return;
      }

      // Build CSV string
      const header = "Book Title,Author,Highlight,Location,Date\n";
      const rows = data
        .map((h) =>
          [
            `"${(h.book_title ?? "").replace(/"/g, '""')}"`,
            `"${(h.author ?? "").replace(/"/g, '""')}"`,
            `"${(h.content ?? "").replace(/"/g, '""')}"`,
            `"${h.location ?? ""}"`,
            `"${h.highlighted_at ?? ""}"`,
          ].join(",")
        )
        .join("\n");

      const csv = header + rows;

      const path = FileSystem.documentDirectory + "afterword_highlights.csv";
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: "text/csv",
          dialogTitle: "Export Highlights",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert(
          "Export Ready",
          "Sharing is not available on this device. CSV generated at: " + path
        );
      }
    } catch (err: any) {
      Alert.alert("Export failed", err.message ?? "Something went wrong.");
    } finally {
      setExportingData(false);
    }
  }

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
            <NavRow
              icon="person-outline"
              label="Profile Information"
              onPress={() => openSheet("profile")}
            />
          </View>

          {/* ── Preferences ─────────────────────────────────────────── */}
          <SectionLabel title="Preferences" />
          <View style={styles.card}>
            <NavRow
              icon="moon-outline"
              label="Dark Mode"
              value="Coming soon"
              muted
            />
            <RowDivider />
            <ToggleRow
              icon="sunny-outline"
              label="Daily Highlight"
              sublabel="Resurface a highlight each day"
              value={dailyReminder}
              onToggle={setDailyReminder}
            />
          </View>

          {/* ── Data ────────────────────────────────────────────────── */}
          <SectionLabel title="Data" />
          <View style={styles.card}>
            <NavRow
              icon="cloud-download-outline"
              label={exportingData ? "Exporting…" : "Export Highlights"}
              onPress={handleExportData}
            />
            <RowDivider />
            <NavRow
              icon="trash-outline"
              label={deletingAccount ? "Deleting…" : "Delete Account"}
              danger
              onPress={handleDeleteAccount}
            />
          </View>

          {/* ── Other ───────────────────────────────────────────────── */}
          <SectionLabel title="Other" />
          <View style={styles.card}>
            <NavRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => openSheet("help")}
            />
            <RowDivider />
            <NavRow
              icon="bug-outline"
              label="Report a Bug"
              onPress={handleReportBug}
            />
            <RowDivider />
            <NavRow
              icon="gift-outline"
              label="What's New"
              onPress={() => openSheet("whatsNew")}
            />
            <RowDivider />
            <NavRow
              icon="information-circle-outline"
              label="About AfterWord"
              onPress={() => openSheet("about")}
            />
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

      {/* ── Bottom Sheets ────────────────────────────────────────────── */}
      <BottomSheet visible={activeSheet === "profile"} onClose={closeSheet}>
        <ProfileSheetContent email={userEmail} onClose={closeSheet} />
      </BottomSheet>

      <BottomSheet visible={activeSheet === "help"} onClose={closeSheet}>
        <HelpSheetContent />
      </BottomSheet>

      <BottomSheet visible={activeSheet === "whatsNew"} onClose={closeSheet}>
        <WhatsNewSheetContent />
      </BottomSheet>

      <BottomSheet visible={activeSheet === "about"} onClose={closeSheet}>
        <AboutSheetContent />
      </BottomSheet>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: Colors.cream,
  },

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

  inner: {
    paddingHorizontal: Spacing.s20,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },

  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
    marginTop: Spacing.s24,
    marginBottom: Spacing.s10,
    paddingHorizontal: Spacing.s4,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },

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
  rowLabelMuted: {
    color: Colors.slate,
    opacity: 0.6,
  },
  rowSublabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    opacity: 0.7,
    marginTop: 1,
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
    marginLeft: 52,
  },

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