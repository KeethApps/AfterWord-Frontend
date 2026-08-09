import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Fonts } from '../../../constants/theme';
import { useTags } from '../../../hooks/queries/tags';
import { supabase } from '../../../lib/supabase';
import { Tag } from '../../../types';

interface TagPickerProps {
  /** Currently selected tag IDs */
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

function normalizeTag(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Multi-select tag picker with inline tag creation.
 * Creating a new tag routes through the `manage-highlight` Edge Function.
 */
export const TagPicker: React.FC<TagPickerProps> = ({ selectedTagIds, onChange }) => {
  const { data: allTags = [], isLoading } = useTags();
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = useState('');
  const [creating, setCreating] = useState(false);

  const toggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    const name = inputValue.trim();
    if (!name) return;

    const normalizedName = normalizeTag(name);

    // Check if a tag with this normalized name already exists client-side
    const existing = allTags.find((t) => t.normalizedName === normalizedName);
    if (existing) {
      // Just select it
      if (!selectedTagIds.includes(existing.id)) {
        onChange([...selectedTagIds, existing.id]);
      }
      setInputValue('');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-highlight', {
        body: {
          action: 'upsert_tag',
          name,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to create tag');
      }

      // Refresh tags list
      await queryClient.invalidateQueries({ queryKey: ['tags'] });

      if (data?.tag) {
        onChange([...selectedTagIds, data.tag.id]);
      }
      setInputValue('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const filteredTags =
    inputValue.trim()
      ? allTags.filter((t) =>
          t.normalizedName.includes(normalizeTag(inputValue))
        )
      : allTags;

  return (
    <View>
      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add tag... (e.g. Productivity)"
          placeholderTextColor={Colors.slate}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleCreateTag}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleCreateTag}
          disabled={creating || !inputValue.trim()}
          style={[styles.addBtn, (!inputValue.trim() || creating) && { opacity: 0.4 }]}
        >
          {creating ? (
            <ActivityIndicator size="small" color={Colors.cream} />
          ) : (
            <Ionicons name="add" size={20} color={Colors.cream} />
          )}
        </Pressable>
      </View>

      {/* Tag chips */}
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.forest} style={{ marginTop: 12 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        >
          {filteredTags.map((tag: Tag) => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <Pressable
                key={tag.id}
                onPress={() => toggle(tag.id)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                {selected && (
                  <Ionicons name="checkmark" size={13} color={Colors.cream} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {tag.name}
                </Text>
              </Pressable>
            );
          })}

          {/* Show "create" option when typing and no exact match */}
          {inputValue.trim() &&
            !allTags.some((t) => t.normalizedName === normalizeTag(inputValue)) && (
              <Pressable onPress={handleCreateTag} style={styles.chipNew}>
                <Ionicons name="add-circle-outline" size={14} color={Colors.forest} style={{ marginRight: 4 }} />
                <Text style={styles.chipNewText}>Create "{inputValue.trim()}"</Text>
              </Pressable>
            )}
        </ScrollView>
      )}

      {/* Selected tags summary */}
      {selectedTagIds.length > 0 && (
        <View style={styles.selectedSummary}>
          {selectedTagIds.map((id) => {
            const tag = allTags.find((t) => t.id === id);
            if (!tag) return null;
            return (
              <Pressable key={id} onPress={() => toggle(id)} style={styles.selectedChip}>
                <Text style={styles.selectedChipText}>{tag.name}</Text>
                <Ionicons name="close" size={12} color={Colors.forest} style={{ marginLeft: 4 }} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
  },
  addBtn: {
    backgroundColor: Colors.forest,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.forest,
  },
  chipTextSelected: {
    color: Colors.cream,
  },
  chipNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: '#FFF9F0',
  },
  chipNewText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.forest,
  },
  selectedSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5EE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.forest,
  },
});
