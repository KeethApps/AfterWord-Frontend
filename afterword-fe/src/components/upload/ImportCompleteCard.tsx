import React from "react";
import { View, Text, Pressable } from "react-native";
import { FolioFox } from "../FolioFox";
import { Button } from "../common/Button";
import { SectionLabel } from "./UploadShared";
import { Colors, Fonts, Spacing } from "../../../constants/theme";

// Simple card shown after successful import
export const ImportCompleteCard = () => {
  return (
    <View style={styles.card}>
      <FolioFox size={100} variant="happy" style={styles.fox} />
      <SectionLabel title="Import complete!" />
      <Text style={styles.stateSubtitle}>
        Your highlights have been queued for processing and will appear in your library shortly.
      </Text>
      <View style={styles.actionGroup}>
        <Button label="View Library" onPress={() => {}} fullWidth />
        <Button label="Import another file" variant="ghost" onPress={() => {}} fullWidth />
      </View>
    </View>
  );
};

// Minimal inline styles mirroring upload.tsx where possible
const styles = {
  card: { padding: Spacing.s4, backgroundColor: Colors.white, borderRadius: 8, alignItems: "center" },
  fox: { marginBottom: Spacing.s4 },
  stateSubtitle: { fontFamily: Fonts.sans, fontSize: 15, color: Colors.slate, textAlign: "center", marginBottom: Spacing.s4 },
  actionGroup: { width: "100%", gap: Spacing.s2 },
};
