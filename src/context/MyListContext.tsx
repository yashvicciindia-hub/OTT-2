import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { MediaItem } from '@/data/content';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

interface MyListContextType {
  savedItems: MediaItem[];
  recentItems: MediaItem[];
  likedItems: MediaItem[];
  continueItems: MediaItem[];
  likedIds: Set<string>;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  toggleSave: (item: MediaItem) => void;
  recordViewed: (item: MediaItem) => void;
  toggleLike: (item: MediaItem) => void;
  recordWatchProgress: (item: MediaItem, progressSeconds: number, durationSeconds: number) => void;
  removeSavedItem: (id: string) => void;
  reorderSavedItems: (fromId: string, toId: string) => void;
  retainObjectUrl: (url: string) => void;
  isSaved: (id: string) => boolean;
  isLiked: (id: string) => boolean;
}

interface ContentRow {
  id: string;
  content_type: MediaItem['type'];
  title: string;
  description: string;
  category: string;
  thumbnail_path: string | null;
  media_path: string | null;
  status: 'draft' | 'published';
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
}

interface SavedRow {
  content_id: string;
  position: number;
  saved_at: string;
  content_items: ContentRow | null;
}

interface ActivityRow {
  content_id: string;
  activity_type: 'view' | 'watch_progress';
  progress_seconds: number;
  duration_seconds: number | null;
  updated_at: string;
  content_items: ContentRow | null;
}

interface LikeRow {
  content_id: string;
  content_items: ContentRow | null;
}

const MyListContext = createContext<MyListContextType | null>(null);

function mapContent(row: ContentRow): MediaItem {
  const image = row.thumbnail_path
    ? row.thumbnail_path.startsWith('http')
      ? row.thumbnail_path
      : requireSupabase().storage.from('lumera-thumbnails').getPublicUrl(row.thumbnail_path).data.publicUrl
    : '';
  const media = row.media_path
    ? row.media_path.startsWith('http')
      ? row.media_path
      : requireSupabase().storage.from('lumera-media').getPublicUrl(row.media_path).data.publicUrl
    : '';
  const metadata = row.metadata ?? {};
  const duration = typeof metadata.duration === 'string' ? metadata.duration : undefined;

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.content_type,
    image,
    ...(duration ? { duration } : {}),
    description: row.description,
    status: row.status === 'published' ? 'new' : 'coming-soon',
    ...(media ? { mediaUrl: media } as Partial<MediaItem> : {}),
    ...(Array.isArray(metadata.tags) ? { tags: metadata.tags as string[] } as Partial<MediaItem> : {}),
  };
}

export function MyListProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<MediaItem[]>([]);
  const [recentItems, setRecentItems] = useState<MediaItem[]>([]);
  const [likedItems, setLikedItems] = useState<MediaItem[]>([]);
  const [continueItems, setContinueItems] = useState<MediaItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const retainedUrls = useRef(new Set<string>());
  const generation = useRef(0);

  const reload = useCallback(async () => {
    const request = ++generation.current;
    if (!user) {
      setSavedItems([]);
      setRecentItems([]);
      setLikedItems([]);
      setContinueItems([]);
      setLikedIds(new Set());
      setLoading(false);
      setError('');
      return;
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase is not configured. Your account library is unavailable.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const client = requireSupabase();
      const [savedResult, historyResult, progressResult, likesResult] = await Promise.all([
        client.from('saved_items').select('content_id, position, saved_at, content_items!inner(*)').eq('user_id', user.id).order('position').order('saved_at', { ascending: false }),
        client.from('user_activity').select('content_id, activity_type, progress_seconds, duration_seconds, updated_at, content_items!inner(*)').eq('user_id', user.id).eq('activity_type', 'view').order('updated_at', { ascending: false }).limit(12),
        client.from('user_activity').select('content_id, activity_type, progress_seconds, duration_seconds, updated_at, content_items!inner(*)').eq('user_id', user.id).eq('activity_type', 'watch_progress').order('updated_at', { ascending: false }),
        client.from('likes').select('content_id, content_items!inner(*)').eq('user_id', user.id),
      ]);
      if (savedResult.error) throw savedResult.error;
      if (historyResult.error) throw historyResult.error;
      if (progressResult.error) throw progressResult.error;
      if (likesResult.error) throw likesResult.error;
      if (generation.current !== request) return;

      const savedRows = (savedResult.data ?? []) as unknown as SavedRow[];
      const activityRows = (historyResult.data ?? []) as unknown as ActivityRow[];
      const progressRows = (progressResult.data ?? []) as unknown as ActivityRow[];
      const likeRows = (likesResult.data ?? []) as unknown as LikeRow[];
      const likeIds = new Set(likeRows.map((row) => row.content_id));
      setSavedItems(savedRows.flatMap((row) => row.content_items ? [{ ...mapContent(row.content_items), savedAt: Date.parse(row.saved_at) }] : []));
      setRecentItems(activityRows.flatMap((row) => row.content_items ? [{ ...mapContent(row.content_items), savedAt: Date.parse(row.updated_at) }] : []));
      setContinueItems(progressRows.flatMap((row) => row.content_items ? [{
        ...mapContent(row.content_items),
        savedAt: Date.parse(row.updated_at),
        progressSeconds: row.progress_seconds,
        durationSeconds: row.duration_seconds,
      }] : []));
      setLikedItems(likeRows.flatMap((row) => row.content_items ? [mapContent(row.content_items)] : []));
      setLikedIds(likeIds);
    } catch (loadError) {
      if (generation.current !== request) return;
      console.error('Could not load your Supabase library.', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load your account library.');
    } finally {
      if (generation.current === request) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => () => {
    retainedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    retainedUrls.current.clear();
  }, []);

  const runMutation = useCallback(async (action: () => Promise<void>, label: string) => {
    setError('');
    try {
      await action();
      await reload();
    } catch (mutationError) {
      console.error(`${label} failed.`, mutationError);
      setError(mutationError instanceof Error ? mutationError.message : `${label} failed.`);
    }
  }, [reload]);

  const toggleSave = useCallback((item: MediaItem) => {
    if (!user) {
      setError('Sign in to save content to your list.');
      return;
    }
    void runMutation(async () => {
      const client = requireSupabase();
      const exists = savedItems.some((saved) => saved.id === item.id);
      const result = exists
        ? await client.from('saved_items').delete().eq('user_id', user.id).eq('content_id', item.id)
        : await client.from('saved_items').insert({ user_id: user.id, content_id: item.id, position: 0 });
      if (result.error) throw result.error;
    }, 'Updating your list');
  }, [runMutation, savedItems, user]);

  const recordViewed = useCallback((item: MediaItem) => {
    if (!user) return;
    void runMutation(async () => {
      const { error: mutationError } = await requireSupabase()
        .from('user_activity')
        .upsert({ user_id: user.id, content_id: item.id, activity_type: 'view' }, { onConflict: 'user_id,content_id,activity_type' });
      if (mutationError) throw mutationError;
    }, 'Recording recently viewed content');
  }, [runMutation, user]);

  const toggleLike = useCallback((item: MediaItem) => {
    if (!user) {
      setError('Sign in to like content.');
      return;
    }
    void runMutation(async () => {
      const client = requireSupabase();
      const result = likedIds.has(item.id)
        ? await client.from('likes').delete().eq('user_id', user.id).eq('content_id', item.id)
        : await client.from('likes').insert({ user_id: user.id, content_id: item.id });
      if (result.error) throw result.error;
    }, 'Updating your liked items');
  }, [likedIds, runMutation, user]);

  const recordWatchProgress = useCallback((item: MediaItem, progressSeconds: number, durationSeconds: number) => {
    if (!user || item.type !== 'video') return;
    void runMutation(async () => {
      const { error: mutationError } = await requireSupabase()
        .from('user_activity')
        .upsert({
          user_id: user.id,
          content_id: item.id,
          activity_type: 'watch_progress',
          progress_seconds: Math.max(0, Math.floor(progressSeconds)),
          duration_seconds: Math.max(0, Math.floor(durationSeconds)),
        }, { onConflict: 'user_id,content_id,activity_type' });
      if (mutationError) throw mutationError;
    }, 'Saving video progress');
  }, [runMutation, user]);

  const removeSavedItem = useCallback((id: string) => {
    if (!user) return;
    void runMutation(async () => {
      const { error: mutationError } = await requireSupabase().from('saved_items').delete().eq('user_id', user.id).eq('content_id', id);
      if (mutationError) throw mutationError;
    }, 'Removing saved content');
  }, [runMutation, user]);

  const reorderSavedItems = useCallback((fromId: string, toId: string) => {
    if (!user) return;
    void runMutation(async () => {
      const fromIndex = savedItems.findIndex((item) => item.id === fromId);
      const toIndex = savedItems.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
      const nextItems = [...savedItems];
      const [moved] = nextItems.splice(fromIndex, 1);
      nextItems.splice(toIndex, 0, moved);
      const updates = nextItems.map((item, position) => ({ user_id: user.id, content_id: item.id, position }));
      const { error: mutationError } = await requireSupabase().from('saved_items').upsert(updates, { onConflict: 'user_id,content_id' });
      if (mutationError) throw mutationError;
    }, 'Reordering your list');
  }, [runMutation, savedItems, user]);

  const retainObjectUrl = useCallback((url: string) => {
    if (url.startsWith('blob:')) retainedUrls.current.add(url);
  }, []);
  const isSaved = useCallback((id: string) => savedItems.some((item) => item.id === id), [savedItems]);
  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds]);

  const value = useMemo(() => ({
    savedItems,
    recentItems,
    likedItems,
    continueItems,
    likedIds,
    loading,
    error,
    reload,
    toggleSave,
    recordViewed,
    toggleLike,
    recordWatchProgress,
    removeSavedItem,
    reorderSavedItems,
    retainObjectUrl,
    isSaved,
    isLiked,
  }), [savedItems, recentItems, likedItems, continueItems, likedIds, loading, error, reload, toggleSave, recordViewed, toggleLike, recordWatchProgress, removeSavedItem, reorderSavedItems, retainObjectUrl, isSaved, isLiked]);

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

// The hook shares its provider context and cannot be hot-reloaded independently.
// eslint-disable-next-line react-refresh/only-export-components
export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) throw new Error('useMyList must be used within MyListProvider');
  return context;
}
