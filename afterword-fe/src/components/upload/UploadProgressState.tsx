import React from "react";
import { View, Text } from "react-native";
import { FolioFox } from "../FolioFox";
import { SectionLabel, FileCard, formatBytes } from "./UploadShared";
import { Button } from "../common/Button";
import { ProgressBar } from "../ProgressBar"; // assume exists or create minimal inline

interface UploadProgressStateProps {
  fileName: string;
  fileSize: number;
  progress: number;
}

export const UploadProgressState: React.FC<UploadProgressStateProps> = ({ fileName, fileSize, progress }) => {
  return (
    <View style={styles.stateBlock}>
      <FolioFox size={100} variant="laptop" style={styles.fox} />
      <SectionLabel title="Uploading your file..." />
      <View style={styles.card}>
        <View style={styles.fileRow}>
          <FileCard name={fileName} size={fileSize} />
        </View>
        <View style={styles.progressBlock}>
          <ProgressBar progress={progress} />
          <Text style={styles.progressLabel}>{progress}% — please keep this screen open</Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  stateBlock: { /* replicate styles from upload.tsx if needed */ },
  fox: {},
  card: {},
  fileRow: {},
  progressBlock: {},
  progressLabel: {},
};
