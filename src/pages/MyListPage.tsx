import { useState } from 'react';
import { Bookmark, Play, Trash2, FolderOpen } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { ContentCard } from '@/components/ContentCard';
import { videosData, podcastsData, storiesData, liveData } from '@/data/content';
import type { MediaItem } from '@/data/content';

const tabs = ['All', 'Videos', 'Podcasts', 'Live', 'Stories'];

// Simulated saved list with a mix of items
const savedItems: MediaItem[] = [
  videosData[0],
  videosData[2],
  podcastsData[0],
  podcastsData[3],
  liveData[0],
  liveData[2],
  storiesData[0],
  storiesData[3],
  videosData[4],
  podcastsData[5],
];

export function MyListPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems] = useState(savedItems);

  const filtered = activeTab === 'All'
    ? items
    : items.filter((item) => {
        if (activeTab === 'Videos') return item.type === 'video';
        if (activeTab === 'Podcasts') return item.type === 'podcast';
        if (activeTab === 'Live') return item.type === 'live';
        if (activeTab === 'Stories') return item.type === 'story';
        return true;
      });

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark size={18} className="text-gold" />
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                Your Collection
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-ink tracking-tight-display mb-4">
              My List
            </h1>
            <p className="text-slate-custom text-lg max-w-xl">
              Everything you've saved — all in one beautiful place.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-6 bg-ivory sticky top-16 z-30 glass border-y border-ink/8">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-ink text-cream'
                      : 'bg-transparent text-slate-custom hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-custom">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-20 bg-ivory-gradient min-h-[50vh]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          {filtered.length > 0 ? (
            <div className="flex flex-wrap gap-5">
              {filtered.map((item, i) => (
                <Reveal key={item.id} delay={(i % 4) * 0.06}>
                  <div className="relative group">
                    <ContentCard item={item} index={i} />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose text-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                      aria-label="Remove from list"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-ivory-2 flex items-center justify-center mx-auto mb-6">
                  <FolderOpen size={36} className="text-slate-custom" />
                </div>
                <h3 className="font-display text-3xl text-ink mb-2">Your list is empty</h3>
                <p className="text-slate-custom mb-8 max-w-sm mx-auto">
                  Start saving videos, podcasts, and stories you love — they'll appear here.
                </p>
                <a
                  href="/videos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400"
                >
                  <Play size={18} fill="currentColor" />
                  Browse Content
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
