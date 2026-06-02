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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts, Spacing } from "../../constants/theme";
import { ScreenContainer } from "../../src/components/ScreenContainer";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditField = "name" | "email" | null;

// ─── Edit Modal ───────────────────────────────────────────────────────────────

type EditModalProps = {
  visible: boolean;
  field: EditField;
  currentValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
};

function EditModal({
  visible,
  field,
  currentValue,
  onSave,
  onClose,
}: EditModalProps) {
  const [value, setValue] = useState(currentValue);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (visible) setValue(currentValue);
  }, [visible, currentValue]);

  const label =
    field === "name" ? "Display name" : "Email address";

  const placeholder =
    field === "name"
      ? "Your name"
      : "you@example.com";

  const keyboardType =
    field === "email" ? "email-address" : "default";

  const isValid = value.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
        style={styles.modalOverlay}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalSheet,
            {
              paddingBottom: Math.max(
                insets.bottom,
                24
              ),
            },
          ]}
        >
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>
            Edit {label.toLowerCase()}
          </Text>

          <Text style={styles.modalSubtitle}>
            {field === "name"
              ? "This is how you'll appear across AfterWord."
              : "We'll send a verification email to your new address."}
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              {label}
            </Text>

            <TextInput
              style={styles.textInput}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={Colors.slate}
              keyboardType={keyboardType}
              autoCapitalize={
                field === "email"
                  ? "none"
                  : "words"
              }
              autoCorrect={false}
              autoFocus
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.saveButton,
                !isValid &&
                  styles.saveButtonDisabled,
              ]}
              disabled={!isValid}
              onPress={() => {
                onSave(value.trim());
                onClose();
              }}
            >
              <Text style={styles.saveButtonText}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

type DeleteModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

function DeleteModal({
  visible,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  const [confirmation, setConfirmation] =
    useState("");

  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (!visible) setConfirmation("");
  }, [visible]);

  const isReady = confirmation === "DELETE";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
        style={styles.modalOverlay}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalSheet,
            {
              paddingBottom: Math.max(
                insets.bottom,
                24
              ),
            },
          ]}
        >
          <View style={styles.modalHandle} />

          <View style={styles.deleteIconWrap}>
            <Ionicons
              name="warning-outline"
              size={28}
              color="#C0392B"
            />
          </View>

          <Text style={styles.modalTitle}>
            Delete account
          </Text>

          <Text style={styles.modalSubtitle}>
            This will permanently delete your
            account, all your highlights, and
            your reading history.
            {"\n\n"}
            This action cannot be undone.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              Type{" "}
              <Text style={styles.confirmWord}>
                DELETE
              </Text>{" "}
              to confirm
            </Text>

            <TextInput
              style={[
                styles.textInput,
                styles.textInputDanger,
              ]}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="DELETE"
              placeholderTextColor="rgba(192,57,43,0.3)"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.deleteButton,
                !isReady &&
                  styles.deleteButtonDisabled,
              ]}
              disabled={!isReady}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={styles.deleteButtonText}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

type ProfileRowProps = {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

function ProfileRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: ProfileRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          destructive &&
            styles.rowIconDestructive,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            destructive
              ? "#C0392B"
              : Colors.forest
          }
        />
      </View>

      <View style={styles.rowBody}>
        <Text
          style={[
            styles.rowLabel,
            destructive &&
              styles.rowLabelDestructive,
          ]}
        >
          {label}
        </Text>

        {value ? (
          <Text style={styles.rowValue}>
            {value}
          </Text>
        ) : null}
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

function SectionLabel({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionLabel}>
      {title}
    </Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ManageProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("Keeth");
  const [email, setEmail] = useState(
    "keeth@example.com"
  );

  const [editField, setEditField] =
    useState<EditField>(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleSave(value: string) {
    if (editField === "name") setName(value);
    if (editField === "email")
      setEmail(value);
  }

  return (
    <ScreenContainer padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: Math.max(
              insets.bottom,
              32
            ),
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                insets.top + Spacing.s12,
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
            <Text style={styles.pageTitle}>
              Manage Profile
            </Text>

            <Text style={styles.pageSubtitle}>
              Update your personal details
            </Text>
          </View>
        </View>

        <View style={styles.inner}>
          {/* Hero */}
          <View style={styles.profileHero}>
            <Pressable
              style={styles.avatarWrap}
              onPress={() =>
                setEditField("name")
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>

              <View style={styles.avatarBadge}>
                <Ionicons
                  name="pencil"
                  size={11}
                  color={Colors.white}
                />
              </View>
            </Pressable>

            <Text style={styles.profileName}>
              {name}
            </Text>

            <Text style={styles.profileEmail}>
              {email}
            </Text>
          </View>

          {/* Profile */}
          <SectionLabel title="Profile Info" />

          <View style={styles.card}>
            <ProfileRow
              icon="person-outline"
              label="Display name"
              value={name}
              onPress={() =>
                setEditField("name")
              }
            />

            <RowDivider />

            <ProfileRow
              icon="mail-outline"
              label="Email address"
              value={email}
              onPress={() =>
                setEditField("email")
              }
            />
          </View>

          {/* Security */}
          <SectionLabel title="Security" />

          <View style={styles.card}>
            <ProfileRow
              icon="lock-closed-outline"
              label="Change password"
              onPress={() => {}}
            />
          </View>

          {/* Danger */}
          <SectionLabel title="Danger Zone" />

          <View style={styles.card}>
            <ProfileRow
              icon="trash-outline"
              label="Delete account"
              destructive
              onPress={() =>
                setShowDeleteModal(true)
              }
            />
          </View>

          <Text style={styles.footerNote}>
            Deleting your account is
            permanent and cannot be reversed.
            All highlights, notes, and
            reading history will be lost.
          </Text>
        </View>
      </ScrollView>

      <EditModal
        visible={editField !== null}
        field={editField}
        currentValue={
          editField === "name"
            ? name
            : email
        }
        onSave={handleSave}
        onClose={() => setEditField(null)}
      />

      <DeleteModal
        visible={showDeleteModal}
        onConfirm={() =>
          router.replace("/")
        }
        onClose={() =>
          setShowDeleteModal(false)
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },

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

  inner: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s32,

    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },

  profileHero: {
    alignItems: "center",

    backgroundColor: Colors.white,

    borderWidth: 1,
    borderColor: Colors.border,

    borderRadius: 28,

    paddingVertical: Spacing.s20,
    paddingHorizontal: Spacing.s24,

    marginBottom: Spacing.s28,
  },

  avatarWrap: {
    position: "relative",
    marginBottom: Spacing.s16,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 999,

    backgroundColor: Colors.forest,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 4,
    borderColor: Colors.gold,
  },

  avatarText: {
    fontFamily: Fonts.serifBold,
    fontSize: 34,
    color: Colors.cream,
  },

  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,

    width: 26,
    height: 26,
    borderRadius: 999,

    backgroundColor: Colors.forest,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: Colors.white,
  },

  profileName: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.forest,

    marginBottom: 4,
  },

  profileEmail: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.slate,
  },

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

  card: {
    backgroundColor: Colors.white,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: Spacing.s18,
    paddingVertical: Spacing.s20,

    gap: Spacing.s14,

    backgroundColor: Colors.white,

    minHeight: 74,
  },

  rowPressed: {
    backgroundColor: "#F8F5EE",
  },

  rowIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,
    marginLeft: Spacing.s10,
    backgroundColor: "#F0F4F0",

    alignItems: "center",
    justifyContent: "center",
  },

  rowIconDestructive: {
    backgroundColor: "#FEF2F2",
  },

  rowBody: {
    flex: 1,
    gap: 3,
  },

  rowLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
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
  },

  footerNote: {
    fontFamily: Fonts.sans,
    fontSize: 13,

    color: Colors.slate,

    lineHeight: 20,

    marginTop: Spacing.s16,
    marginBottom: Spacing.s32,

    paddingHorizontal: Spacing.s4,

    opacity: 0.75,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",

    backgroundColor: "rgba(0,0,0,0.42)",
  },

  modalSheet: {
    backgroundColor: Colors.white,

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingHorizontal: Spacing.s24,
    paddingTop: Spacing.s18,
  },

  modalHandle: {
    width: 42,
    height: 5,

    borderRadius: 999,

    backgroundColor: Colors.border,

    alignSelf: "center",

    marginBottom: Spacing.s24,
  },

  modalTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,

    color: Colors.forest,

    marginBottom: Spacing.s10,
  },

  modalSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,

    color: Colors.slate,

    lineHeight: 24,

    marginBottom: Spacing.s28,
  },

  inputWrapper: {
    gap: Spacing.s10,

    marginBottom: Spacing.s28,
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

    borderRadius: 16,

    paddingHorizontal: Spacing.s18,
    paddingVertical: 18,

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

    marginBottom: Spacing.s12,
  },

  cancelButton: {
    flex: 1,

    paddingVertical: 18,

    borderRadius: 999,

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

    paddingVertical: 18,

    borderRadius: 999,

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

  deleteIconWrap: {
    width: 60,
    height: 60,

    borderRadius: 999,

    backgroundColor: "#FEF2F2",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: Spacing.s18,
  },

  deleteButton: {
    flex: 1,

    paddingVertical: 18,

    borderRadius: 999,

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