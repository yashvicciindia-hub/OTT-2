import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { MediaItem } from '@/data/content';
import { IMAGES } from '@/data/content';

interface MyListContextType {
  savedItems: MediaItem[];
  recentItems: MediaItem[];
  toggleSave: (item: MediaItem) => void;
  recordViewed: (item: MediaItem) => void;
  removeSavedItem: (id: string) => void;
  reorderSavedItems: (fromId: string, toId: string) => void;
  retainObjectUrl: (url: string) => void;
  isSaved: (id: string) => boolean;
}

const MyListContext = createContext<MyListContextType | null>(null);
const STORAGE_KEY = 'lumera-my-list';
const RECENT_STORAGE_KEY = 'lumera-recently-viewed';

function readItems(storageKey: string, label: string): MediaItem[] {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Saved list data is not an array.');

    return parsed.filter((item): item is MediaItem => (
      typeof item === 'object'
      && item !== null
      && typeof item.id === 'string'
      && typeof item.title === 'string'
      && typeof item.category === 'string'
      && ['video', 'podcast', 'story'].includes(item.type)
      && typeof item.image === 'string'
      && typeof item.description === 'string'
      && ['coming-soon', 'featured', 'new'].includes(item.status)
    )).map((item) => item.image.startsWith('blob:')
      ? { ...item, image: IMAGES.art2 }
      : item);
  } catch (error) {
    console.error(`Could not read ${label} from this browser session.`, error);
    return [];
  }
}

export function MyListProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<MediaItem[]>(() => readItems(STORAGE_KEY, 'the saved list'));
  const [recentItems, setRecentItems] = useState<MediaItem[]>(() => readItems(RECENT_STORAGE_KEY, 'recently viewed content'));
  const retainedUrls = useRef(new Set<string>());

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch (error) {
      console.error('Could not persist the saved list in this browser session.', error);
    }
  }, [savedItems]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentItems));
    } catch (error) {
      console.error('Could not persist recently viewed content in this browser session.', error);
    }
  }, [recentItems]);

  useEffect(() => () => {
    retainedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    retainedUrls.current.clear();
  }, []);

  const toggleSave = (item: MediaItem) => {
    setSavedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [{ ...item, savedAt: Date.now() }, ...prev];
    });
  };

  const recordViewed = (item: MediaItem) => {
    setRecentItems((items) => [
      { ...item, savedAt: Date.now() },
      ...items.filter((previous) => previous.id !== item.id),
    ].slice(0, 12));
  };

  const removeSavedItem = (id: string) => {
    setSavedItems((items) => items.filter((item) => item.id !== id));
  };

  const reorderSavedItems = (fromId: string, toId: string) => {
    setSavedItems((items) => {
      const fromIndex = items.findIndex((item) => item.id === fromId);
      const toIndex = items.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
      const reordered = [...items];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return reordered;
    });
  };

  const retainObjectUrl = (url: string) => {
    if (url.startsWith('blob:')) retainedUrls.current.add(url);
  };

  const isSaved = (id: string) => savedItems.some((i) => i.id === id);

  return (
    <MyListContext.Provider value={{ savedItems, recentItems, toggleSave, recordViewed, removeSavedItem, reorderSavedItems, retainObjectUrl, isSaved }}>
      {children}
    </MyListContext.Provider>
  );
}

// The hook shares its provider context and cannot be hot-reloaded independently.
// eslint-disable-next-line react-refresh/only-export-components
export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) {
    throw new Error('useMyList must be used within MyListProvider');
  }
  return ctx;
}
