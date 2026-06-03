import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Button, FolioFox } from "../../../src/components";
import { AppHeader } from "../../../src/components/AppHeader";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState =
  | "idle"
  | "selected"
  | "uploading"
  | "processing"
  | "success"
  | "partial"
  | "error";

interface SelectedFile {
  name: string;
  uri: string;
  size: number;
  mimeType?: string;
}

interface ImportResult {
  imported: number;
  books: number;
  failed: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Animated panel — fade + slide on state change ───────────────────────────

function AnimatedPanel({
  stateKey,
  children,
}: {
  stateKey: string;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [stateKey]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────

type StepStatus = "done" | "active" | "queued";

function StepRow({
  label,
  status,
  index,
}: {
  label: string;
  status: StepStatus;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.stepRow, { opacity }]}>
      <View
        style={[
          styles.stepDot,
          status === "done" && styles.stepDotDone,
          status === "active" && styles.stepDotActive,
          status === "queued" && styles.stepDotQueued,
        ]}
      >
        {status === "done" && (
          <Ionicons name="checkmark" size={10} color={Colors.white} />
        )}
        {status === "active" && <View style={styles.stepDotInner} />}
      </View>
      <Text
        style={[
          styles.stepLabel,
          status === "queued" && styles.stepLabelQueued,
          status === "done" && styles.stepLabelDone,
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

// ─── Status icon ─────────────────────────────────────────────────────────────

function StatusIcon({ type }: { type: "success" | "warning" | "error" }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const iconName =
    type === "success"
      ? "checkmark"
      : type === "warning"
        ? "warning-outline"
        : "close";
  const bgColor =
    type === "success"
      ? Colors.forest
      : type === "warning"
        ? Colors.amber
        : Colors.danger;

  return (
    <Animated.View
      style={[
        styles.statusIcon,
        { backgroundColor: bgColor, opacity, transform: [{ scale }] },
      ]}
    >
      <Ionicons name={iconName} size={28} color={Colors.white} />
    </Animated.View>
  );
}

// ─── Section label — matches settings/search ─────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ── File picker ────────────────────────────────────────────────────────────
  async function handlePickFile() {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "*/*"],
        copyToCacheDirectory: true,
      });

      if (picked.canceled) return;

      const asset = picked.assets[0];

      if (!asset.name.endsWith(".txt")) {
        setErrorMessage("Please select a valid My Clippings.txt file.");
        setState("error");
        return;
      }

      setFile({
        name: asset.name,
        uri: asset.uri,
        size: asset.size ?? 0,
        mimeType: asset.mimeType,
      });
      setState("selected");
    } catch {
      setErrorMessage("Could not open the file picker. Please try again.");
      setState("error");
    }
  }

  // ── Upload + process ───────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) return;

    setState("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    // ✅ FIX: declare progressInterval outside try so finally can always clear it
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 12;
      });
    }, 180);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const storagePath = `${user.id}/${Date.now()}_${file.name}`;
      const fileResponse = await fetch(file.uri);
      const blob = await fileResponse.blob();

      const { error: storageError } = await supabase.storage
        .from("clippings")
        .upload(storagePath, blob, {
          contentType: "text/plain",
          upsert: false,
        });

      if (storageError) {
        throw new Error(storageError.message);
      }

      const { data: ingestionData, error: ingestionError } =
        await supabase.functions.invoke("process-highlights", {
          body: {
            path: storagePath,
          },
        });

      if (ingestionError) {
        throw new Error(`Failed to start ingestion: ${ingestionError.message}`);
      }

      const jobId = ingestionData?.jobId;
      console.log("Started ingestion job:", jobId);

      setUploadProgress(100);

      // ✅ FIX: pipeline is async — job is queued, real counts come later.
      // Set a placeholder result so the success UI renders correctly.
      const importResult: ImportResult = {
        imported: ingestionData?.chunkCount ?? 0,
        books: 0,
        failed: 0,
      };
      setResult(importResult);

      // ✅ FIX: was referencing undefined `importResult` — now uses the local
      // variable defined above. "partial" state is reserved for future use
      // when you have real failure counts from polling.
      setState(importResult.failed > 0 ? "partial" : "success");
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? "Something went wrong. Please try again.",
      );
      setState("error");
    } finally {
      // ✅ FIX: always clear the interval, even if an error is thrown mid-upload
      clearInterval(progressInterval);
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function handleReset() {
    setFile(null);
    setUploadProgress(0);
    setResult(null);
    setErrorMessage("");
    setState("idle");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer padded={false}>
      <AppHeader title="Upload" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 32) },
        ]}
      >
        <View style={styles.inner}>
          <AnimatedPanel stateKey={state}>
            {/* ── Idle ───────────────────────────────────────────────────── */}
            {state === "idle" && (
              <View style={styles.stateBlock}>
                <SectionLabel title="Your file" />
                <Pressable style={styles.dropZone} onPress={handlePickFile}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color={Colors.slate}
                    style={{ opacity: 0.6 }}
                  />
                  <Text style={styles.dropText}>Tap to choose your file</Text>
                  <Text style={styles.dropHint}>My Clippings.txt only</Text>
                </Pressable>
                {/* Fox: neutral/reading pose while waiting
                <FolioFox size={180} variant="default" style={styles.fox} /> */}
                <SectionLabel title="How it works" />
                <View style={styles.card}>
                  {[
                    {
                      icon: "phone-portrait-outline" as const,
                      label: "Connect your Kindle",
                      desc: "Plug it in via USB or locate the file in Files.",
                    },
                    {
                      icon: "document-text-outline" as const,
                      label: 'Find "My Clippings.txt"',
                      desc: 'It lives in the "documents" folder on your Kindle.',
                    },
                    {
                      icon: "cloud-upload-outline" as const,
                      label: "Upload here",
                      desc: "We'll parse, deduplicate, and save every highlight.",
                    },
                  ].map((step, i, arr) => (
                    <React.Fragment key={step.label}>
                      <View style={styles.howRow}>
                        <View style={styles.howIconWrap}>
                          <Ionicons
                            name={step.icon}
                            size={18}
                            color={Colors.forest}
                          />
                        </View>
                        <View style={styles.howInfo}>
                          <Text style={styles.howLabel}>{step.label}</Text>
                          <Text style={styles.howDesc}>{step.desc}</Text>
                        </View>
                      </View>
                      {i < arr.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </View>

                <View style={styles.privacyNote}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={14}
                    color={Colors.slate}
                  />
                  <Text style={styles.privacyText}>
                    Your file is private and secure.
                  </Text>
                </View>
              </View>
            )}

            {/* ── Selected ───────────────────────────────────────────────── */}
            {state === "selected" && file && (
              <View style={styles.stateBlock}>
                {/* Fox: attentive/ready */}
                <FolioFox size={100} variant="reading" style={styles.fox} />

                <SectionLabel title="Ready to import" />
                <View style={styles.card}>
                  <View style={styles.fileRow}>
                    <View style={styles.fileIconWrap}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={Colors.forest}
                      />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{file.name}</Text>
                      <Text style={styles.fileSize}>
                        {formatBytes(file.size)}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.forest}
                    />
                  </View>
                </View>

                <View style={styles.actionGroup}>
                  <Button
                    label="Upload File"
                    onPress={handleUpload}
                    fullWidth
                  />
                  <Button
                    label="Choose a different file"
                    variant="ghost"
                    onPress={handleReset}
                  />
                </View>
              </View>
            )}

            {/* ── Uploading ──────────────────────────────────────────────── */}
            {state === "uploading" && file && (
              <View style={styles.stateBlock}>
                {/* Fox: working at laptop */}
                <FolioFox size={100} variant="laptop" style={styles.fox} />

                <SectionLabel title="Uploading" />
                <View style={styles.card}>
                  <View style={styles.fileRow}>
                    <View style={styles.fileIconWrap}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={Colors.forest}
                      />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{file.name}</Text>
                      <Text style={styles.fileSize}>
                        {formatBytes(file.size)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBlock}>
                    <ProgressBar progress={uploadProgress} />
                    <Text style={styles.progressLabel}>
                      {uploadProgress}% — please keep this screen open
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Processing ─────────────────────────────────────────────── */}
            {state === "processing" && (
              <View style={styles.stateBlock}>
                {/* Fox: thinking/processing */}
                <FolioFox size={100} variant="thinking" style={styles.fox} />

                <SectionLabel title="Processing your file" />
                <View style={styles.card}>
                  {(
                    [
                      { label: "File uploaded", status: "done" },
                      { label: "Parsing clippings", status: "active" },
                      { label: "Creating embeddings", status: "queued" },
                      { label: "Saving highlights", status: "queued" },
                    ] as { label: string; status: StepStatus }[]
                  ).map((step, i, arr) => (
                    <React.Fragment key={step.label}>
                      <StepRow
                        index={i}
                        label={step.label}
                        status={step.status}
                      />
                      {i < arr.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </View>

                <Text style={styles.processingNote}>
                  This may take a few minutes depending on the size of your
                  library.
                </Text>
              </View>
            )}

            {/* ── Success ────────────────────────────────────────────────── */}
            {state === "success" && result && (
              <View style={styles.stateBlock}>
                {/* Fox: happy/celebrating */}
                <FolioFox size={100} variant="happy" style={styles.fox} />

                <StatusIcon type="success" />
                <Text style={styles.stateTitle}>Import started!</Text>
                <Text style={styles.stateSubtitle}>
                  We imported{" "}
                  <Text style={styles.stateBold}>
                    {result.imported.toLocaleString()} highlights
                  </Text>{" "}
                  from{" "}
                  <Text style={styles.stateBold}>
                    {result.books} {result.books === 1 ? "book" : "books"}
                  </Text>
                  .
                </Text>

                <SectionLabel title="Summary" />
                <View style={styles.card}>
                  <View style={styles.summaryRow}>
                    <View style={styles.rowIcon}>
                      <Ionicons
                        name="bookmark-outline"
                        size={18}
                        color={Colors.forest}
                      />
                    </View>
                    <Text style={styles.summaryLabel}>Highlights imported</Text>
                    <Text style={styles.summaryValue}>
                      {result.imported.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <View style={styles.rowIcon}>
                      <Ionicons
                        name="library-outline"
                        size={18}
                        color={Colors.forest}
                      />
                    </View>
                    <Text style={styles.summaryLabel}>Books added</Text>
                    <Text style={styles.summaryValue}>{result.books}</Text>
                  </View>
                </View>

                <View style={styles.actionGroup}>
                  <Button label="View Library" onPress={() => {}} fullWidth />
                  <Button
                    label="Import another file"
                    variant="ghost"
                    onPress={handleReset}
                  />
                </View>
              </View>
            )}

            {/* ── Partial ────────────────────────────────────────────────── */}
            {state === "partial" && result && (
              <View style={styles.stateBlock}>
                {/* Fox: uncertain/thinking */}
                <FolioFox size={100} variant="thinking" style={styles.fox} />

                <StatusIcon type="warning" />
                <Text style={styles.stateTitle}>Imported with some issues</Text>
                <Text style={styles.stateSubtitle}>
                  Most of your highlights were saved, but a few items couldn't
                  be processed.
                </Text>

                <SectionLabel title="Summary" />
                <View style={styles.card}>
                  <View style={styles.summaryRow}>
                    <View style={styles.rowIcon}>
                      <Ionicons
                        name="bookmark-outline"
                        size={18}
                        color={Colors.forest}
                      />
                    </View>
                    <Text style={styles.summaryLabel}>Highlights imported</Text>
                    <Text style={styles.summaryValue}>
                      {result.imported.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <View style={styles.rowIcon}>
                      <Ionicons
                        name="library-outline"
                        size={18}
                        color={Colors.forest}
                      />
                    </View>
                    <Text style={styles.summaryLabel}>Books added</Text>
                    <Text style={styles.summaryValue}>{result.books}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <View style={[styles.rowIcon, styles.rowIconWarn]}>
                      <Ionicons
                        name="warning-outline"
                        size={18}
                        color={Colors.amber}
                      />
                    </View>
                    <Text style={styles.summaryLabel}>Failed to process</Text>
                    <Text
                      style={[styles.summaryValue, styles.summaryValueWarn]}
                    >
                      {result.failed.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionGroup}>
                  <Button label="View issues" onPress={() => {}} fullWidth />
                  <Button
                    label="View library"
                    variant="secondary"
                    onPress={() => {}}
                    fullWidth
                  />
                </View>
              </View>
            )}

            {/* ── Error ──────────────────────────────────────────────────── */}
            {state === "error" && (
              <View style={styles.stateBlock}>
                {/* Fox: sad */}
                <FolioFox size={100} variant="sad" style={styles.fox} />

                <StatusIcon type="error" />
                <Text style={styles.stateTitle}>Upload failed</Text>
                <Text style={styles.stateSubtitle}>
                  {errorMessage ||
                    "We couldn't upload your file. Please try again."}
                </Text>

                <View style={styles.actionGroup}>
                  <Button label="Try again" onPress={handleReset} fullWidth />
                  <Button
                    label="Choose another file"
                    variant="secondary"
                    onPress={handlePickFile}
                    fullWidth
                  />
                </View>
              </View>
            )}
          </AnimatedPanel>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  inner: {
    padding: Spacing.s20,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  pageSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.slate,
    lineHeight: 22,
    marginBottom: Spacing.s24,
  },

  // ── Per-state block ───────────────────────────────────────────────────────
  stateBlock: {
    gap: Spacing.s8,
  },

  // Fox sits above each state's content
  fox: {
    alignSelf: "center",
    marginBottom: Spacing.s8,
  },

  // State title/subtitle (success, partial, error)
  stateTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.forest,
    textAlign: "center",
    marginTop: Spacing.s8,
  },
  stateSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.s8,
  },
  stateBold: {
    fontFamily: Fonts.sansBold,
    color: Colors.forest,
  },

  // ── Section label — matches Settings ─────────────────────────────────────
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

  // ── Card — matches Settings ───────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    paddingHorizontal: Spacing.s16,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 48,
  },

  // ── Drop zone ─────────────────────────────────────────────────────────────
  dropZone: {
    width: "100%",
    borderWidth: 1.5,
    borderStyle: "dashed" as any,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.s32,
    paddingHorizontal: Spacing.s24,
    alignItems: "center",
    gap: Spacing.s8,
    backgroundColor: Colors.cream ?? "#F5F1E8",
  },
  dropText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
  },
  dropHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    opacity: 0.7,
  },

  // ── How it works rows ─────────────────────────────────────────────────────
  howRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s12,
    paddingVertical: Spacing.s14 ?? 14,
  },
  howIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F4F0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  howInfo: {
    flex: 1,
    gap: 3,
  },
  howLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
  },
  howDesc: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    lineHeight: 18,
  },

  // ── Privacy note ──────────────────────────────────────────────────────────
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s8,
    backgroundColor: Colors.mist ?? Colors.cream ?? "#F0F4F0",
    borderRadius: 10,
    padding: Spacing.s12,
    marginTop: Spacing.s8,
  },
  privacyText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    flex: 1,
    lineHeight: 18,
  },

  // ── File row ──────────────────────────────────────────────────────────────
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: Spacing.s16,
  },
  fileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0F4F0",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
  },
  fileSize: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
  },

  // ── Progress ──────────────────────────────────────────────────────────────
  progressBlock: {
    gap: Spacing.s8,
    paddingBottom: Spacing.s16,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.mist ?? "#F0F4F0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.forest,
    borderRadius: 6,
  },
  progressLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    textAlign: "center",
  },

  // ── Step rows ─────────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: Spacing.s14 ?? 14,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: { backgroundColor: Colors.forest },
  stepDotActive: { backgroundColor: Colors.amber },
  stepDotQueued: {
    backgroundColor: Colors.mist ?? "#F0F4F0",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  stepLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
  },
  stepLabelDone: { color: Colors.slate },
  stepLabelQueued: { color: Colors.slate, opacity: 0.5 },

  processingNote: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 20,
    marginTop: Spacing.s8,
    opacity: 0.7,
  },

  // ── Summary rows ──────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: Spacing.s14 ?? 14,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F4F0",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconWarn: {
    backgroundColor: "#FEF9E7",
  },
  summaryLabel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
  },
  summaryValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
  },
  summaryValueWarn: {
    color: Colors.amber,
  },

  // ── Status icon ───────────────────────────────────────────────────────────
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.s4,
    marginTop: Spacing.s8,
  },

  // ── Action group ──────────────────────────────────────────────────────────
  actionGroup: {
    gap: Spacing.s8,
    marginTop: Spacing.s16,
  },
});