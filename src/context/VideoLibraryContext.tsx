import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UploadedVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  experience: string;
  videoUrl: string;
  thumbnailUrl: string;
  tags: string[];
  status: 'Draft' | 'Published';
  createdAt: number;
}

interface VideoLibraryContextValue {
  videos: UploadedVideo[];
  addVideo: (video: UploadedVideo) => void;
}

const VideoLibraryContext = createContext<VideoLibraryContextValue | null>(null);

export function VideoLibraryProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<UploadedVideo[]>([]);

  const addVideo = (video: UploadedVideo) => {
    setVideos((current) => [video, ...current]);
  };

  return (
    <VideoLibraryContext.Provider value={{ videos, addVideo }}>
      {children}
    </VideoLibraryContext.Provider>
  );
}

export function useVideoLibrary() {
  const context = useContext(VideoLibraryContext);
  if (!context) {
    throw new Error('useVideoLibrary must be used within a VideoLibraryProvider');
  }
  return context;
}
