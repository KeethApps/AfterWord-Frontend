import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { CollapsibleCard } from "../common/CollapsibleCard";
import { useTags } from "../../../hooks/queries/tags";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { Tag } from "../../../types";

interface ManageTagsSheetProps {
  expanded: boolean;
  onToggle: () => void;
}

/**
  * Collapsible card for creating and deleting user tags.
  * Uses the manage-highlight Edge Function for secure tag management.
  */
export const ManageTagsSheet: React.FC<ManageTagsSheetProps> = ({
  expanded,
  onToggle,
}) => {
  const { data: tags = [], isLoading } = useTags();
  const queryClient = useQueryClient();

  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-highlight", {
        body: {
          action: "upsert_tag",
          name,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to create tag");
      }

      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    setDeletingId(tag.id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-highlight", {
        body: {
          action: "delete_tag",
          tag_id: tag.id,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Failed to delete tag");
      }

      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CollapsibleCard
      icon="pricetags-outline"
      title="Manage Tags"
      badgeCount={tags.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      {/* Create row */}
      <View style={styles.createRow}>
        <TextInput
          style={styles.tagInput}
          placeholder="New tag name..."
          placeholderTextColor={Colors.slate}
          value={newTagName}
          onChangeText={setNewTagName}
          onSubmitEditing={handleCreate}
          returnKeyType="done"
          autoCapitalize="none"
        />
        <Pressable
          onPress={handleCreate}
          disabled={creating || !newTagName.trim()}
          style={[
            styles.createBtn,
            (!newTagName.trim() || creating) && { opacity: 0.4 },
          ]}
        >
          {creating ? (
            <ActivityIndicator size="small" color={Colors.cream} />
          ) : (
            <Ionicons name="add" size={18} color={Colors.cream} />
          )}
        </Pressable>
      </View>

      {/* Existing tags */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={Colors.forest}
          style={{ marginTop: 8 }}
        />
      ) : tags.length === 0 ? (
        <Text style={styles.emptyText}>No tags yet. Add one above.</Text>
      ) : (
        <View style={styles.tagsList}>
          {tags.map((tag: Tag) => (
            <View key={tag.id} style={styles.tagRow}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>{tag.name}</Text>
              </View>
              <Pressable
                onPress={() => handleDelete(tag)}
                disabled={deletingId === tag.id}
                hitSlop={8}
                style={{ opacity: deletingId === tag.id ? 0.4 : 1 }}
              >
                {deletingId === tag.id ? (
                  <ActivityIndicator size="small" color={Colors.slate} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={Colors.slate} />
                )}
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </CollapsibleCard>
  );
};

const styles = StyleSheet.create({
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.mist,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.forest,
  },
  createBtn: {
    backgroundColor: Colors.forest,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsList: {
    gap: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagPill: {
    backgroundColor: "#EEF5EE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagPillText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.forest,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.slate,
    textAlign: "center",
    paddingVertical: 8,
  },
});
