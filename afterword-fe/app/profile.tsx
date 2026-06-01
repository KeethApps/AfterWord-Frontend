import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Fonts, Spacing } from "../constants/theme";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditField = "name" | "email" | null;

// ─── Inline edit modal ────────────────────────────────────────────────────────

type EditModalProps = {
  visible: boolean;
  field: EditField;
  currentValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
};

function EditModal({ visible, field, currentValue, onSave, onClose }: EditModalProps) {
  const [value, setValue] = useState(currentValue);
  const insets = useSafeAreaInsets();

  // Reset local value when modal opens
  React.useEffect(() => {
    if (visible) setValue(currentValue);
  }, [visible, currentValue]);

  const label = field === "name" ? "Display name" : "Email address";
  const placeholder = field === "name" ? "Your name" : "you@example.com";
  const keyboardType = field === "email" ? "email-address" : "default";

  const isValid = value.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>Edit {label.toLowerCase()}</Text>
          <Text style={styles.modalSubtitle}>
            {field === "name"
              ? "This is how you'll appear across AfterWord."
              : "We'll send a verification email to your new address."}
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
              style={styles.textInput}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={Colors.slate}
              keyboardType={keyboardType}
              autoCapitalize={field === "email" ? "none" : "words"}
              autoCorrect={false}
              autoFocus
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={() => {
                if (isValid) {
                  onSave(value.trim());
                  onClose();
                }
              }}
              disabled={!isValid}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

type DeleteModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

function DeleteModal({ visible, onConfirm, onClose }: DeleteModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const insets = useSafeAreaInsets();
  const CONFIRM_WORD = "DELETE";

  React.useEffect(() => {
    if (!visible) setConfirmation("");
  }, [visible]);

  const isReady = confirmation === CONFIRM_WORD;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.modalHandle} />

          {/* Warning icon */}
          <View style={styles.deleteIconWrap}>
            <Ionicons name="warning-outline" size={28} color="#C0392B" />
          </View>

          <Text style={styles.modalTitle}>Delete account</Text>
          <Text style={styles.modalSubtitle}>
            This will permanently delete your account, all your highlights, and your reading history.
            {"\n\n"}This action cannot be undone.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              Type <Text style={styles.confirmWord}>DELETE</Text> to confirm
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputDanger]}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="DELETE"
              placeholderTextColor="rgba(192,57,43,0.3)"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.deleteButton, !isReady && styles.deleteButtonDisabled]}
              onPress={() => {
                if (isReady) {
                  onConfirm();
                  onClose();
                }
              }}
              disabled={!isReady}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

type ProfileRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

function ProfileRow({ icon, label, value, onPress, destructive }: ProfileRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? "#C0392B" : Colors.forest}
        />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {!destructive && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.slate}
          style={{ opacity: 0.5 }}
        />
      )}
    </Pressable>
  );
}

function RowDivider() {
  return <View style={styles.divider} />;
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ManageProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("Keeth");
  const [email, setEmail] = useState("keeth@example.com");
  const [editField, setEditField] = useState<EditField>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = (value: string) => {
    if (editField === "name") setName(value);
    if (editField === "email") setEmail(value);
  };

  // Derive initials from name
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScreenContainer>
      <Text style={styles.pageTitle}>Manage profile</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 32) },
        ]}
      >
        <View style={styles.inner}>

          {/* ── Profile hero ─────────────────────────────────────────────── */}
          <View style={styles.profileHero}>
            <Pressable style={styles.avatarWrap} onPress={() => setEditField("name")}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              {/* Edit badge */}
              <View style={styles.avatarBadge}>
                <Ionicons name="pencil" size={11} color={Colors.white} />
              </View>
            </Pressable>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>

          {/* ── Profile info ─────────────────────────────────────────────── */}
          <SectionLabel title="Profile info" />
          <View style={styles.card}>
            <ProfileRow
              icon="person-outline"
              label="Display name"
              value={name}
              onPress={() => setEditField("name")}
            />
            <RowDivider />
            <ProfileRow
              icon="mail-outline"
              label="Email address"
              value={email}
              onPress={() => setEditField("email")}
            />
          </View>

          {/* ── Security ─────────────────────────────────────────────────── */}
          <SectionLabel title="Security" />
          <View style={styles.card}>
            <ProfileRow
              icon="lock-closed-outline"
              label="Change password"
              onPress={() => {}}
            />
          </View>

          {/* ── Danger zone ──────────────────────────────────────────────── */}
          <SectionLabel title="Danger zone" />
          <View style={styles.card}>
            <ProfileRow
              icon="trash-outline"
              label="Delete account"
              onPress={() => setShowDeleteModal(true)}
              destructive
            />
          </View>

          {/* Explanatory note */}
          <Text style={styles.footerNote}>
            Deleting your account is permanent and cannot be reversed. All highlights,
            notes, and reading history will be lost.
          </Text>

        </View>
      </ScrollView>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      <EditModal
        visible={editField !== null}
        field={editField}
        currentValue={editField === "name" ? name : email}
        onSave={handleSave}
        onClose={() => setEditField(null)}
      />

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      <DeleteModal
        visible={showDeleteModal}
        onConfirm={() => {
          // TODO: wire up real delete logic
          router.replace("/");
        }}
        onClose={() => setShowDeleteModal(false)}
      />
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

  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s16,
  },

  // ── Profile hero ──────────────────────────────────────────────────────────
  profileHero: {
    alignItems: "center",
    paddingVertical: Spacing.s24,
    gap: Spacing.s8,
    marginBottom: Spacing.s8,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: Spacing.s8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.forest,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.amber,
  },
  avatarText: {
    fontFamily: Fonts.serifBold,
    fontSize: 30,
    color: Colors.amber,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.forest,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
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

  // ── Section label ─────────────────────────────────────────────────────────
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

  // ── Card ─────────────────────────────────────────────────────────────────
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
  rowIconDestructive: {
    backgroundColor: "#FEF2F2",
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
  },
  rowLabelDestructive: {
    color: "#C0392B",
  },
  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 60,
  },

  // ── Footer note ───────────────────────────────────────────────────────────
  footerNote: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    lineHeight: 18,
    marginTop: Spacing.s8,
    paddingHorizontal: Spacing.s4,
    opacity: 0.7,
  },

  // ── Modal shared ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.s24,
    paddingTop: Spacing.s16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.s20,
  },
  modalTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.forest,
    marginBottom: Spacing.s8,
  },
  modalSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    lineHeight: 20,
    marginBottom: Spacing.s24,
  },
  inputWrapper: {
    gap: Spacing.s8,
    marginBottom: Spacing.s24,
  },
  inputLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.forest,
    opacity: 0.7,
  },
  confirmWord: {
    fontFamily: Fonts.sansBold,
    color: "#C0392B",
  },
  textInput: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.forest,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s14 ?? 14,
    backgroundColor: Colors.white,
    outlineStyle: "none" as any,
  },
  textInputDanger: {
    borderColor: "rgba(192,57,43,0.3)",
    color: "#C0392B",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.s12,
    marginBottom: Spacing.s8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.s16,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cancelButtonText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.s16,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: Colors.forest,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.white,
  },

  // ── Delete modal specific ─────────────────────────────────────────────────
  deleteIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.s16,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: Spacing.s16,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#C0392B",
  },
  deleteButtonDisabled: {
    opacity: 0.35,
  },
  deleteButtonText: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.white,
  },
});