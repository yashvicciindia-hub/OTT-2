import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface PodcastEpisode {
  id: string;
  podcastTitle: string;
  episodeTitle: string;
  description: string;
  category: string;
  format: string;
  host: string;
  episodeNumber: number | null;
  seasonNumber: number | null;
  tags: string[];
  duration: number;
  audioUrl: string;
  coverUrl: string;
  publishedAt: number;
}

interface PodcastLibraryContextValue {
  episodes: PodcastEpisode[];
  addEpisode: (episode: PodcastEpisode) => void;
}

const PodcastLibraryContext = createContext<PodcastLibraryContextValue | null>(null);

export function PodcastLibraryProvider({ children }: { children: ReactNode }) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const objectUrls = useRef(new Set<string>());

  const addEpisode = (episode: PodcastEpisode) => {
    objectUrls.current.add(episode.audioUrl);
    if (episode.coverUrl.startsWith('blob:')) objectUrls.current.add(episode.coverUrl);
    setEpisodes((current) => [episode, ...current]);
  };

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
  }, []);

  return (
    <PodcastLibraryContext.Provider value={{ episodes, addEpisode }}>
      {children}
    </PodcastLibraryContext.Provider>
  );
}

export function usePodcastLibrary() {
  const context = useContext(PodcastLibraryContext);
  if (!context) {
    throw new Error('usePodcastLibrary must be used within PodcastLibraryProvider');
  }
  return context;
}
