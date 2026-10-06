import { useState } from 'react';
import { Mic, Headphones, Play, Filter } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { Carousel } from '@/components/Carousel';
import { ContentCard } from '@/components/ContentCard';
import { podcastsData } from '@/data/content';
import type { MediaItem } from '@/data/content';

const filters = ['All', 'Film & Craft', 'Audio & Music', 'Cinematography', 'Direction', 'Writing & Narrative'];

export function PodcastsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? podcastsData
    : podcastsData.filter((p) => p.category === activeFilter);

  return (
    <PageWrapper>
      {/* Hero with featured podcast */}
      <section className="relative pt-32 pb-16 bg-ivory-gradient overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-teal/8 blur-3xl float" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <div className="flex items-center gap-2 mb-3">
              <Mic size={18} className="text-gold" />
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                Listen
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-ink tracking-tight-display mb-4">
              Podcasts
            </h1>
            <p className="text-slate-custom text-lg max-w-xl">
              Conversations with creators, artisans, and visionaries behind the stories you love.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured podcast banner */}
      <section className="py-12 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden bg-ivory-2 shadow-card group cursor-pointer">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                  <img
                    src={podcastsData[0].image}
                    alt={podcastsData[0].title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ivory-2/40" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide-display bg-gold text-cream">
                      Featured
                    </span>
                    <span className="text-slate-custom text-xs">{podcastsData[0].duration}</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight-display mb-3">
                    {podcastsData[0].title}
                  </h2>
                  <p className="text-slate-custom text-base leading-relaxed mb-6">
                    {podcastsData[0].description}
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-custom">
                      <Headphones size={16} className="text-gold" />
                      {podcastsData[0].episodes} episodes
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-3 px-6 py-3.5 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400 w-fit group/btn">
                    <Play size={18} fill="currentColor" />
                    Listen Now
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-8 bg-ivory sticky top-16 z-30 glass border-y border-ink/8">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-slate-custom" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === f
                    ? 'bg-ink text-cream'
                    : 'bg-transparent text-slate-custom hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Podcast grid */}
      <section className="py-12 md:py-20 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 0.08}>
                <PodcastCard item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* All podcasts carousel */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <Carousel title="All Shows" subtitle="Browse every podcast">
              {podcastsData.map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} variant="tall" />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}

function PodcastCard({ item }: { item: MediaItem }) {
  return (
    <article className="group cursor-pointer bg-cream rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-60" />
        {item.badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide-display bg-gold text-cream">
              {item.badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-cream/80 text-xs">{item.category}</span>
          <div className="w-10 h-10 rounded-full bg-cream/90 backdrop-blur-sm flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
            <Play size={16} className="text-ink ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-ink tracking-tight-display mb-2">
          {item.title}
        </h3>
        <p className="text-slate-custom text-sm leading-relaxed mb-4">
          {item.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-custom">
          <span className="flex items-center gap-1">
            <Headphones size={13} className="text-gold" />
            {item.episodes} episodes
          </span>
          <span>{item.duration}</span>
        </div>
      </div>
    </article>
  );
}
