import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { AppHeader, Button, FolioFox } from "../../../src/components";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
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
    type === "success" ? "checkmark" : type === "warning" ? "warning-outline" : "close";
  const bgColor =
    type === "success" ? Colors.forest : type === "warning" ? Colors.amber : Colors.danger;

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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UploadScreen() {
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

    try {
      // 1. Verify auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      // 2. Upload file to Supabase Storage
      //    Bucket: "uploads" — create this in your Supabase dashboard
      //    with RLS policy: allow insert where auth.uid() = user_id segment
      const storagePath = `clippings/${user.id}/${Date.now()}_${file.name}`;
      const fileResponse = await fetch(file.uri);
      const blob = await fileResponse.blob();

      // Simulate progress increments — Supabase JS v2 doesn't expose
      // upload progress. Use XHR directly if you need real progress.
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 90) { clearInterval(progressInterval); return 90; }
          return p + 12;
        });
      }, 180);

      const { error: storageError } = await supabase.storage
        .from("uploads")
        .upload(storagePath, blob, { contentType: "text/plain", upsert: false });

      clearInterval(progressInterval);
      if (storageError) throw new Error(storageError.message);

      setUploadProgress(100);
      setState("processing");

      // 3. Invoke Edge Function to parse + embed + save
      //    Expected response: { imported: number, books: number, failed: number }
      //    Function name: "process-clippings" — matches your FastAPI/Celery pipeline
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "process-clippings",
        { body: { storagePath, userId: user.id } }
      );

      if (fnError) throw new Error(fnError.message);

      const importResult: ImportResult = {
        imported: fnData?.imported ?? 0,
        books: fnData?.books ?? 0,
        failed: fnData?.failed ?? 0,
      };

      setResult(importResult);
      setState(importResult.failed > 0 ? "partial" : "success");
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong. Please try again.");
      setState("error");
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
      <AppHeader title="Import" subtitle="Upload your Kindle Clippings.txt" />

      <View style={styles.content}>
        <View style={styles.panel}>
          <AnimatedPanel stateKey={state}>

            {/* ── Idle ─────────────────────────────────────────────────── */}
            {state === "idle" && (
              <View style={styles.panelInner}>
                <Text style={styles.panelTitle}>Import Clippings</Text>
                <Text style={styles.panelSubtitle}>
                  Upload your Kindle "My Clippings.txt" file to import your highlights.
                </Text>
                <Pressable style={styles.dropZone} onPress={handlePickFile}>
                  <Ionicons name="cloud-upload-outline" size={36} color={Colors.slate} />
                  <Text style={styles.dropText}>Drag & drop your file here</Text>
                  <Text style={styles.dropOr}>or</Text>
                  <View style={styles.chooseBtn}>
                    <Text style={styles.chooseBtnText}>Choose File</Text>
                  </View>
                  <Text style={styles.dropHint}>Supported file: My Clippings.txt only</Text>
                </Pressable>
                <View style={styles.privacyNote}>
                  <Ionicons name="lock-closed-outline" size={14} color={Colors.slate} />
                  <Text style={styles.privacyText}>
                    Your file is private and secure. We never share your highlights.
                  </Text>
                </View>
                <Pressable>
                  <Text style={styles.learnLink}>How do I export this from Kindle?</Text>
                </Pressable>
              </View>
            )}

            {/* ── Selected ─────────────────────────────────────────────── */}
            {state === "selected" && file && (
              <View style={styles.panelInner}>
                <Text style={styles.panelTitle}>Ready to Import</Text>
                <View style={styles.fileRow}>
                  <View style={styles.fileIconWrap}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.forest} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{formatBytes(file.size)}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.forest} />
                </View>
                <Button label="Upload File" onPress={handleUpload} fullWidth />
                <Button label="Change file" variant="ghost" onPress={handleReset} />
              </View>
            )}

            {/* ── Uploading ────────────────────────────────────────────── */}
            {state === "uploading" && file && (
              <View style={styles.panelInner}>
                <Text style={styles.panelTitle}>Uploading</Text>
                <View style={styles.fileRow}>
                  <View style={styles.fileIconWrap}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.forest} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{formatBytes(file.size)}</Text>
                  </View>
                </View>
                <ProgressBar progress={uploadProgress} />
                <Text style={styles.progressLabel}>
                  {uploadProgress}% — please don't close this screen
                </Text>
                <FolioFox size={80} variant="laptop" style={styles.fox} />
              </View>
            )}

            {/* ── Processing ───────────────────────────────────────────── */}
            {state === "processing" && (
              <View style={styles.panelInner}>
                <Text style={styles.panelTitle}>Processing your file</Text>
                <Text style={styles.panelSubtitle}>
                  This may take a few minutes depending on the size of your file.
                </Text>
                <View style={styles.stepList}>
                  {(
                    [
                      { label: "File uploaded",       status: "done"   },
                      { label: "Parsing clippings",   status: "active" },
                      { label: "Creating embeddings", status: "queued" },
                      { label: "Saving highlights",   status: "queued" },
                    ] as { label: string; status: StepStatus }[]
                  ).map((step, i) => (
                    <StepRow key={i} index={i} label={step.label} status={step.status} />
                  ))}
                </View>
                <FolioFox size={80} variant="laptop" style={styles.fox} />
              </View>
            )}

            {/* ── Success ──────────────────────────────────────────────── */}
            {state === "success" && result && (
              <View style={styles.panelInner}>
                <StatusIcon type="success" />
                <Text style={styles.panelTitle}>Import complete!</Text>
                <Text style={styles.panelSubtitle}>
                  We imported {result.imported.toLocaleString()} highlights from{" "}
                  {result.books} {result.books === 1 ? "book" : "books"}.
                </Text>
                <Button label="View Library" onPress={() => {}} fullWidth />
                <Button label="Import another file" variant="ghost" onPress={handleReset} />
                <FolioFox size={80} variant="happy" style={styles.fox} />
              </View>
            )}

            {/* ── Partial ──────────────────────────────────────────────── */}
            {state === "partial" && result && (
              <View style={styles.panelInner}>
                <StatusIcon type="warning" />
                <Text style={styles.panelTitle}>Import completed with some issues</Text>
                <Text style={styles.panelSubtitle}>
                  We imported {result.imported.toLocaleString()} highlights from{" "}
                  {result.books} {result.books === 1 ? "book" : "books"}.{"\n"}
                  {result.failed.toLocaleString()} items failed to process.
                </Text>
                <Button label="View issues" onPress={() => {}} fullWidth />
                <Button label="View library" variant="secondary" onPress={() => {}} fullWidth />
                <FolioFox size={80} variant="thinking" style={styles.fox} />
              </View>
            )}

            {/* ── Error ────────────────────────────────────────────────── */}
            {state === "error" && (
              <View style={styles.panelInner}>
                <StatusIcon type="error" />
                <Text style={styles.panelTitle}>Upload failed</Text>
                <Text style={styles.panelSubtitle}>
                  {errorMessage || "We couldn't upload your file. Please try again."}
                </Text>
                <Button label="Try again" onPress={handleReset} fullWidth />
                <Button label="Choose another file" variant="secondary" onPress={handlePickFile} fullWidth />
                <FolioFox size={80} variant="sad" style={styles.fox} />
              </View>
            )}

          </AnimatedPanel>
        </View>
      </View>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.s24,
  },
  panel: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.s32,
    width: "100%",
    maxWidth: 460,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  panelInner: {
    gap: Spacing.s16,
    alignItems: "center",
  },
  panelTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.forest,
    textAlign: "center",
  },
  panelSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 22,
  },
  dropZone: {
    width: "100%",
    borderWidth: 1.5,
    borderStyle: "dashed" as any,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: Spacing.s32,
    paddingHorizontal: Spacing.s24,
    alignItems: "center",
    gap: Spacing.s10,
    backgroundColor: Colors.cream,
  },
  dropText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
  },
  dropOr: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  chooseBtn: {
    borderWidth: 1,
    borderColor: Colors.forest,
    borderRadius: 8,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s8,
  },
  chooseBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.forest,
  },
  dropHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    marginTop: Spacing.s4,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s8,
    backgroundColor: Colors.mist,
    borderRadius: 10,
    padding: Spacing.s12,
    width: "100%",
  },
  privacyText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    flex: 1,
    lineHeight: 18,
  },
  learnLink: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  fileRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.mist,
    borderRadius: 10,
    padding: Spacing.s12,
    gap: Spacing.s12,
  },
  fileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: { flex: 1 },
  fileName: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
  },
  fileSize: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    marginTop: 2,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.mist,
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
  stepList: {
    width: "100%",
    gap: Spacing.s12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: { backgroundColor: Colors.forest },
  stepDotActive: { backgroundColor: Colors.amber },
  stepDotQueued: {
    backgroundColor: Colors.mist,
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
    fontSize: 14,
    color: Colors.forest,
  },
  stepLabelDone: { color: Colors.slate },
  stepLabelQueued: { color: Colors.slate, opacity: 0.5 },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  fox: {
    alignSelf: "center",
    marginTop: Spacing.s8,
  },
});