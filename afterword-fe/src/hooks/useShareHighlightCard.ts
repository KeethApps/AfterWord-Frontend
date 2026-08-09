import { useState, useCallback, RefObject } from 'react';
import { Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export interface UseShareHighlightCardResult {
  isCapturing: boolean;
  isSaving: boolean;
  error: string | null;
  shareCard: () => Promise<void>;
  saveToPhotos: () => Promise<void>;
}

export function useShareHighlightCard(
  viewShotRef: RefObject<any>
): UseShareHighlightCardResult {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCapturedUri = useCallback(async (): Promise<string> => {
    if (!viewShotRef.current) {
      throw new Error('Card preview ref not ready');
    }
    return await captureRef(viewShotRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  }, [viewShotRef]);

  const shareCard = useCallback(async () => {
    setIsCapturing(true);
    setError(null);
    try {
      const uri = await getCapturedUri();
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Sharing Unavailable',
          'Sharing is not supported on this platform/device.'
        );
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Highlight Card',
        UTI: 'public.png',
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to capture or share card.';
      setError(message);
      if (Platform.OS === 'web') {
        window.alert('Error: ' + message);
      } else {
        Alert.alert('Share Error', message);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [getCapturedUri]);

  const saveToPhotos = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library access is needed to save cards to your device photos.'
        );
        return;
      }

      const uri = await getCapturedUri();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved!', 'Highlight card saved to your photos.');
    } catch (err: any) {
      const message = err?.message || 'Failed to save card to photos.';
      setError(message);
      if (Platform.OS === 'web') {
        window.alert('Error: ' + message);
      } else {
        Alert.alert('Save Error', message);
      }
    } finally {
      setIsSaving(false);
    }
  }, [getCapturedUri]);

  return {
    isCapturing,
    isSaving,
    error,
    shareCard,
    saveToPhotos,
  };
}
