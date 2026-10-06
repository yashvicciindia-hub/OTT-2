import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MediaItem } from '@/data/content';

interface MyListContextType {
  savedItems: MediaItem[];
  toggleSave: (item: MediaItem) => void;
  isSaved: (id: string) => boolean;
}

const MyListContext = createContext<MyListContextType | null>(null);

export function MyListProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<MediaItem[]>([]);

  const toggleSave = (item: MediaItem) => {
    setSavedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSaved = (id: string) => savedItems.some((i) => i.id === id);

  return (
    <MyListContext.Provider value={{ savedItems, toggleSave, isSaved }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) {
    throw new Error('useMyList must be used within MyListProvider');
  }
  return ctx;
}
