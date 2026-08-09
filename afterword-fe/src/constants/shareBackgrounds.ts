export type ShareBackground = {
  id: string;
  name: string;
  source: any;
  textColor: 'light' | 'dark';
};

export const SHARE_BACKGROUNDS: ShareBackground[] = [
  {
    id: 'bg-1',
    name: 'Forest Dark',
    source: require('../../assets/share-backgrounds/bg-1.png'),
    textColor: 'light',
  },
  {
    id: 'bg-2',
    name: 'Warm Cream',
    source: require('../../assets/share-backgrounds/bg-2.png'),
    textColor: 'dark',
  },
  {
    id: 'bg-3',
    name: 'Charcoal Slate',
    source: require('../../assets/share-backgrounds/bg-3.png'),
    textColor: 'light',
  },
];

/**
 * Deterministically picks a background based on highlightId hash.
 * This guarantees the same highlight always defaults to the same card background.
 */
export function getBackgroundForHighlight(highlightId: string): ShareBackground {
  if (!highlightId) return SHARE_BACKGROUNDS[0];
  let hash = 0;
  for (let i = 0; i < highlightId.length; i++) {
    hash = (hash << 5) - hash + highlightId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SHARE_BACKGROUNDS.length;
  return SHARE_BACKGROUNDS[index];
}

export function getBackgroundById(id?: string): ShareBackground {
  if (!id) return SHARE_BACKGROUNDS[0];
  const found = SHARE_BACKGROUNDS.find((bg) => bg.id === id);
  return found || SHARE_BACKGROUNDS[0];
}
