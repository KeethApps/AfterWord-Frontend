/**
 * Upload Screen — file import flow for Kindle Clippings.txt
 * Demonstrates all import states from the mockup.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { AppHeader, Button, FolioFox } from "../../src/components";
import { colors, spacing, radius, typography } from "../../src/theme";

type UploadState = "idle" | "selected" | "uploading" | "processing" | "success" | "partial" | "error";

const STATE_LABELS: Record<UploadState, string> = {
  idle:       "Select File",
  selected:   "File Selected",
  uploading:  "Uploading…",
  processing: "Processing…",
  success:    "Complete!",
  partial:    "Partial Success",
  error:      "Failed",
};

const ALL_STATES: UploadState[] = ["idle", "selected", "uploading", "processing", "success", "partial", "error"];

export default function UploadScreen() {
  const [state, setState] = useState<UploadState>("idle");

  return (
    <View style={styles.screen}>
      <AppHeader title="Import" subtitle="Upload your Kindle Clippings.txt" />

      {/* State switcher for demo */}
      <View style={styles.stateSwitcher}>
        <Text style={styles.switcherLabel}>Preview state: </Text>
        {ALL_STATES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setState(s)}
            style={[styles.switcherBtn, state === s && styles.switcherBtnActive]}
          >
            <Text style={[styles.switcherBtnText, state === s && styles.switcherBtnTextActive]}>
              {STATE_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        <UploadPanel state={state} onStateChange={setState} />
      </View>
    </View>
  );
}

function UploadPanel({
  state,
  onStateChange,
}: {
  state: UploadState;
  onStateChange: (s: UploadState) => void;
}) {
  switch (state) {
    case "idle":
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Import My Clippings.txt</Text>
          <Text style={styles.panelSubtitle}>
            Upload your Kindle "My Clippings.txt" file to import your highlights.
          </Text>

          {/* Drop zone */}
          <View style={styles.dropZone}>
            <Text style={styles.dropIcon}>☁</Text>
            <Text style={styles.dropText}>Drag & drop your file here</Text>
            <Text style={styles.dropOr}>or</Text>
            <Button label="Choose File" variant="secondary" onPress={() => onStateChange("selected")} />
            <Text style={styles.dropHint}>Supported file: My Clippings.txt only</Text>
          </View>

          <View style={styles.privacyNote}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your file is private and secure. We never share your highlights.
            </Text>
          </View>

          <Pressable>
            <Text style={styles.learnLink}>How do I export this from Kindle?</Text>
          </Pressable>
        </View>
      );

    case "selected":
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Import My Clippings.txt</Text>
          <View style={styles.fileRow}>
            <Text style={styles.fileIcon}>📄</Text>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>My Clippings.txt</Text>
              <Text style={styles.fileSize}>7.4 MB</Text>
            </View>
            <Text style={styles.fileCheck}>✓</Text>
          </View>
          <Button label="Upload File" onPress={() => onStateChange("uploading")} fullWidth />
          <Button label="Change file" variant="ghost" onPress={() => onStateChange("idle")} />
        </View>
      );

    case "uploading":
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Import My Clippings.txt</Text>
          <View style={styles.fileRow}>
            <Text style={styles.fileIcon}>📄</Text>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>My Clippings.txt</Text>
              <Text style={styles.fileSize}>2.4 MB</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "45%" }]} />
          </View>
          <Text style={styles.progressLabel}>Uploading… 45%</Text>
          <Text style={styles.processingNote}>Please don't close this screen.</Text>
          <FolioFox size={90} variant="laptop" style={styles.fox} />
        </View>
      );

    case "processing":
      return (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Processing your file</Text>
          <Text style={styles.panelSubtitle}>
            This may take a few minutes depending on the size of your file.
          </Text>
          {[
            { label: "File uploaded",       done: true  },
            { label: "Parsing clippings 245 / 1,248", done: false },
            { label: "Creating embeddings", done: false, queued: true },
            { label: "Saving highlights",   done: false, queued: true },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={[styles.stepIcon, step.done && styles.stepDone, step.queued && styles.stepQueued]}>
                {step.done ? "✓" : step.queued ? "…" : "⟳"}
              </Text>
              <Text style={[styles.stepLabel, step.queued && styles.stepLabelQueued]}>{step.label}</Text>
            </View>
          ))}
          <FolioFox size={90} variant="laptop" style={styles.fox} />
        </View>
      );

    case "success":
      return (
        <View style={styles.panel}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Import complete!</Text>
          <Text style={styles.successDesc}>
            We imported 1,248 highlights from 8 books.
          </Text>
          <Button label="View Library" onPress={() => {}} fullWidth />
          <Button label="Import Another File" variant="ghost" onPress={() => onStateChange("idle")} />
          <FolioFox size={90} variant="happy" style={styles.fox} />
        </View>
      );

    case "partial":
      return (
        <View style={styles.panel}>
          <View style={[styles.statusIcon, styles.statusWarning]}>
            <Text style={styles.statusIconText}>⚠</Text>
          </View>
          <Text style={styles.successTitle}>Import completed with some issues</Text>
          <Text style={styles.successDesc}>
            We imported 1,132 highlights from 8 books. 116 items failed to process.
          </Text>
          <Button label="View Issues" onPress={() => {}} fullWidth />
          <Button label="View Library" variant="secondary" onPress={() => {}} fullWidth />
          <FolioFox size={90} variant="thinking" style={styles.fox} />
        </View>
      );

    case "error":
      return (
        <View style={styles.panel}>
          <View style={[styles.statusIcon, styles.statusError]}>
            <Text style={styles.statusIconText}>✕</Text>
          </View>
          <Text style={styles.successTitle}>Upload failed</Text>
          <Text style={styles.successDesc}>
            We couldn't upload your file. Please try again.
          </Text>
          <Button label="Try Again" onPress={() => onStateChange("idle")} fullWidth />
          <Button label="Choose Another File" variant="secondary" onPress={() => onStateChange("idle")} fullWidth />
          <FolioFox size={90} variant="sad" style={styles.fox} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stateSwitcher: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  switcherLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  switcherBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  switcherBtnActive: {
    backgroundColor: colors.forest,
  },
  switcherBtnText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: "500",
  },
  switcherBtnTextActive: {
    color: colors.textInverse,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[8],
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[8],
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    gap: spacing[4],
  },
  panelTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  panelSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  dropZone: {
    width: "100%",
    borderWidth: 2,
    borderStyle: "dashed" as any,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing[8],
    alignItems: "center",
    gap: spacing[3],
    backgroundColor: colors.cream,
  },
  dropIcon: {
    fontSize: 40,
  },
  dropText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    fontWeight: "500",
  },
  dropOr: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  dropHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    padding: spacing[3],
    width: "100%",
  },
  privacyIcon: {
    fontSize: 14,
  },
  privacyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  learnLink: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.slate,
    textDecorationLine: "underline",
  },
  fileRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: spacing[3],
  },
  fileIcon: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  fileSize: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  fileCheck: {
    color: colors.success,
    fontSize: 18,
    fontWeight: "700",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: colors.mist,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.forest,
    borderRadius: radius.pill,
  },
  progressLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  processingNote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    width: "100%",
  },
  stepIcon: {
    fontSize: 14,
    color: colors.textMuted,
    width: 20,
    textAlign: "center",
  },
  stepDone: {
    color: colors.success,
  },
  stepQueued: {
    color: colors.border,
  },
  stepLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  stepLabelQueued: {
    color: colors.textMuted,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  statusWarning: {
    backgroundColor: colors.amber,
  },
  statusError: {
    backgroundColor: colors.crimson,
  },
  statusIconText: {
    color: colors.textInverse,
    fontSize: 28,
    fontWeight: "700",
  },
  successTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  successDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  fox: {
    marginTop: spacing[2],
  },
});
