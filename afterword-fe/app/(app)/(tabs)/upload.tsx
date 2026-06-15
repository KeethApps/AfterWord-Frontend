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
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { FolioFox } from "@/src/components/FolioFox";
import { Button } from "../../../src/components";
import { AppHeader } from "../../../src/components/AppHeader";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { SourceSelection } from "@/src/components/upload/SourceSelectionCard";
import { UploadInitialState } from "@/src/components/upload/UploadInitialState";
import { UploadSelectedState } from "@/src/components/upload/UploadSelectedState";
import { UploadProgressState } from "@/src/components/upload/UploadProgressState";
import { ImportCompleteCard } from "../../../src/components";
import { UploadFailedState } from "../../../src/components";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState =
  | "idle"
  | "selected"
  | "uploading"
  | "processing"
  | "success"
  | "partial"
  | "error";

// Maps directly to job_status_type enum in your DB
type JobStatus =
  | "pending"
  | "parsing"
  | "parsed"
  | "vectorizing"
  | "completed"
  | "failed";

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

// Map DB job status → which step index is active in the UI
function jobStatusToStep(status: JobStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "parsing":
      return 1;
    case "parsed":
    case "vectorizing":
      return 2;
    case "completed":
      return 3;
    case "failed":
      return -1;
    default:
      return 0;
  }
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

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<UploadState>("idle");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Hold a ref to the Realtime channel so we can unsubscribe on cleanup
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // Clean up Realtime subscription when the screen unmounts
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  // ── Subscribe to job progress via Realtime ─────────────────────────────────
  function subscribeToJob(jobId: string) {
    const channel = supabase
      .channel(`job:${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ingestion_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const job = payload.new as {
            status: JobStatus;
            chunk_count: number | null;
            processed_count: number | null;
            error_message: string | null;
          };

          const step = jobStatusToStep(job.status);
          if (step >= 0) setProcessingStep(step);

          if (job.chunk_count && job.processed_count != null) {
            const pct = Math.round(
              (job.processed_count / job.chunk_count) * 100,
            );
            setUploadProgress(Math.min(pct, 99));
          }

          if (job.status === "completed") {
            setUploadProgress(100);
            setResult({
              imported: job.chunk_count ?? 0,
              books: 0,
              failed: 0,
            });
            setState("success");
            supabase.removeChannel(channel);
          }

          if (job.status === "failed") {
            setErrorMessage(
              job.error_message ?? "Processing failed. Please try again.",
            );
            setState("error");
            supabase.removeChannel(channel);
          }
        },
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }

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

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return p + 10;
      });
    }, 200);

    try {
      // ── 1. Confirm the user is authenticated ──────────────────────────────
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      // ── 2. Build a sanitized storage path ─────────────────────────────────
      const uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const storagePath = `clippings/${user.id}/${uuid}.txt`;

      // ── 3. Read file as base64 then convert to blob ────────────────────────
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      // ── 4. Upload to Supabase Storage ─────────────────────────────────────
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clippings")
        .upload(storagePath, arrayBuffer, {
          contentType: "text/plain",
        });

      console.log("UPLOAD DATA", uploadData);
      console.log("UPLOAD ERROR", uploadError);

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // ── 5. Invoke process-highlights edge function via explicit fetch ──────
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const funcResponse = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-highlights`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_path: storagePath,
            source_type: "KINDLE",
          }),
        }
      );

      const text = await funcResponse.text();

      console.log("STATUS", funcResponse.status);
      console.log("BODY", text);

      if (!funcResponse.ok) {
        throw new Error(`Function failed: ${funcResponse.status} ${text}`);
      }

      const ingestionData = JSON.parse(text);
      const jobId = ingestionData.job_id;

      if (!jobId) {
        throw new Error("No job_id returned from process-highlights");
      }

      clearInterval(progressInterval);
      setUploadProgress(90);

      // ── 6. Switch to processing state + start Realtime subscription ────────
      setState("processing");
      setProcessingStep(0);
      
      // CRITICAL FIX: Attach the realtime listener so the UI progresses!
      subscribeToJob(jobId); 
      
      console.log("JOB CREATED & SUBSCRIBED", jobId);
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? "Something went wrong. Please try again.",
      );
      setState("error");
    } finally {
      clearInterval(progressInterval);
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function handleReset() {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    setFile(null);
    setUploadProgress(0);
    setProcessingStep(0);
    setResult(null);
    setErrorMessage("");
    setState("idle");
    setSelectedSource(null);
  }

  // ── Derive step statuses from processingStep ───────────────────────────────
  const steps: { label: string; status: StepStatus }[] = [
    {
      label: "File uploaded",
      status:
        processingStep > 0
          ? "done"
          : processingStep === 0
            ? "active"
            : "queued",
    },
    {
      label: "Parsing clippings",
      status:
        processingStep > 1
          ? "done"
          : processingStep === 1
            ? "active"
            : "queued",
    },
    {
      label: "Creating embeddings",
      status:
        processingStep > 2
          ? "done"
          : processingStep === 2
            ? "active"
            : "queued",
    },
    {
      label: "Saving highlights",
      status:
        processingStep > 3
          ? "done"
          : processingStep === 3
            ? "active"
            : "queued",
    },
  ];

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

          {/* ── Source Selection ─────────────────────────────────────────── */}
          {!selectedSource && (
  <AnimatedPanel stateKey="source-select">
    <SourceSelection onSelect={(src) => setSelectedSource(src)} />
  </AnimatedPanel>
)}

          {/* ── Coming Soon ───────────────────────────────────────────────── */}
          {selectedSource && selectedSource !== "kindle" && (
            <AnimatedPanel stateKey={`coming-soon-${selectedSource}`}>
              <Pressable onPress={() => setSelectedSource(null)} style={styles.backRow}>
                <Ionicons name="chevron-back" size={20} color={Colors.forest} />
                <Text style={styles.backLabel}>Back</Text>
              </Pressable>

              <View style={styles.comingSoonBlock}>
                <FolioFox size={120} variant="laptop" style={{ marginBottom: 24 }} />
                <Text style={styles.comingSoonTitle}>Feature Coming Soon</Text>
                <Text style={styles.comingSoonSubtitle}>
                  We're working hard to support {selectedSource.charAt(0).toUpperCase() + selectedSource.slice(1)} imports.
                  Be the first to know when it launches.
                </Text>
                <Pressable
                  style={styles.waitlistButton}
                  onPress={() => {}}
                >
                  <Text style={styles.waitlistButtonText}>Join the Waitlist</Text>
                </Pressable>
                <Pressable onPress={() => setSelectedSource(null)} style={{ marginTop: 12 }}>
                  <Text style={styles.waitlistBack}>← Choose a different source</Text>
                </Pressable>
              </View>
            </AnimatedPanel>
          )}

          {/* ── Kindle Upload Flow ────────────────────────────────────────── */}
          {selectedSource === "kindle" && (
            <AnimatedPanel stateKey={`kindle-${state}`}>
              {state !== "idle" && (
                <Pressable onPress={handleReset} style={styles.backRow}>
                  <Ionicons name="chevron-back" size={20} color={Colors.forest} />
                  <Text style={styles.backLabel}>Back</Text>
                </Pressable>
              )}
              {state === "idle" && (
                <Pressable onPress={() => setSelectedSource(null)} style={styles.backRow}>
                  <Ionicons name="chevron-back" size={20} color={Colors.forest} />
                  <Text style={styles.backLabel}>Back</Text>
                </Pressable>
              )}
              <AnimatedPanel stateKey={state}>
            {/* ── Idle ───────────────────────────────────────────────────── */}
            {state === "idle" && (
              <View style={styles.stateBlock}>
                <UploadInitialState onPickFile={handlePickFile} />
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
                <FolioFox size={100} variant="laptop" style={styles.fox} />
                <SectionLabel title="Uploading your file..." />
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
                <FolioFox size={100} variant="thinking" style={styles.fox} />
                <Text style={styles.stateTitle}>Highlights are uploading!</Text>
                <Text style={styles.stateSubtitle}>
                  We'll keep processing in the background. You can head over to your library, and they'll appear shortly.
                </Text>

                <View style={styles.actionGroup}>
                  <Button
                    label="Go to Library"
                    onPress={() => router.push("/(app)/(tabs)/library")}
                    fullWidth
                  />
                  <Button
                    label="Import another file"
                    variant="ghost"
                    onPress={handleReset}
                  />
                </View>
              </View>
            )}

            {/* ── Success ────────────────────────────────────────────────── */}
            {state === "success" && result && (
              <View style={styles.stateBlock}>
                <FolioFox size={100} variant="happy" style={styles.fox} />
                <StatusIcon type="success" />
                <Text style={styles.stateTitle}>Import complete!</Text>
                <Text style={styles.stateSubtitle}>
                  <Text style={styles.stateBold}>
                    {result.imported.toLocaleString()} highlights
                  </Text>{" "}
                  have been queued for processing. They'll appear in your
                  library shortly.
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
                    <Text style={styles.summaryLabel}>Highlights queued</Text>
                    <Text style={styles.summaryValue}>
                      {result.imported.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionGroup}>
                  <Button
                    label="View Library"
                    onPress={() => router.push("/library")}
                    fullWidth
                  />
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
                  <Button
                    label="View library"
                    onPress={() => router.push("/library")}
                    fullWidth
                  />
                  <Button
                    label="Import another file"
                    variant="ghost"
                    onPress={handleReset}
                  />
                </View>
              </View>
            )}

            {/* ── Error ──────────────────────────────────────────────────── */}
            {state === "error" && (
              <View style={styles.stateBlock}>
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
            </AnimatedPanel>
          )}

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
  stateBlock: {
    gap: Spacing.s8,
  },
  fox: {
    alignSelf: "center",
    marginBottom: Spacing.s8,
  },
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
  // Source selection
  // sourceSubtitle: {
  //   fontFamily: Fonts.sans,
  //   fontSize: 15,
  //   color: Colors.slate,
  //   marginTop: 4,
  //   marginBottom: Spacing.s24,
  //   lineHeight: 22,
  // },
  // sourceQuestion: {
  //   fontFamily: Fonts.sansBold,
  //   fontSize: 14,
  //   color: Colors.forest,
  //   marginBottom: Spacing.s12,
  // },
  // sourceRow: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   backgroundColor: Colors.white,
  //   borderRadius: 14,
  //   borderWidth: 1,
  //   borderColor: Colors.border,
  //   paddingHorizontal: Spacing.s16,
  //   paddingVertical: Spacing.s16,
  //   marginBottom: Spacing.s10,
  // },
  // sourceIconWrap: {
  //   width: 36,
  //   height: 36,
  //   borderRadius: 10,
  //   backgroundColor: Colors.cream,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginRight: Spacing.s12,
  // },
  // sourceInfo: {
  //   flex: 1,
  // },
  // sourceLabel: {
  //   fontFamily: Fonts.sansBold,
  //   fontSize: 15,
  //   color: Colors.forest,
  //   marginBottom: 2,
  // },
  // sourceDetail: {
  //   fontFamily: Fonts.sans,
  //   fontSize: 12,
  //   color: Colors.slate,
  // },
  // Back button
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.s16,
    gap: 4,
  },
  backLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
  },
  // Coming soon
  comingSoonBlock: {
    alignItems: "center",
    paddingTop: Spacing.s24,
  },
  comingSoonTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.forest,
    marginBottom: Spacing.s12,
    textAlign: "center",
  },
  comingSoonSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.s32,
    paddingHorizontal: Spacing.s8,
  },
  waitlistButton: {
    backgroundColor: Colors.forest,
    borderRadius: 12,
    paddingVertical: Spacing.s16,
    paddingHorizontal: Spacing.s40,
    alignItems: "center",
  },
  waitlistButtonText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.white,
  },
  waitlistBack: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    textAlign: "center",
  },
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
  howRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s12,
    paddingVertical: 14,
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
  progressBlock: {
    gap: Spacing.s8,
    paddingBottom: Spacing.s16,
  },
  processingProgress: {
    gap: Spacing.s8,
    marginTop: Spacing.s8,
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
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: 14,
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
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: 14,
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
  actionGroup: {
    gap: Spacing.s8,
    marginTop: Spacing.s16,
  },
});