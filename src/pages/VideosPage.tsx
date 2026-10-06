import { useState } from 'react';
import { Play, Filter, Grid2x2, List } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { Carousel } from '@/components/Carousel';
import { ContentCard } from '@/components/ContentCard';
import { videosData, featuredItems, showcaseItems } from '@/data/content';

const filters = ['All', 'Films', 'Series', 'Documentaries', 'Short Films', 'Editorial'];

export function VideosPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <PageWrapper>
      {/* Page hero */}
      <section className="relative pt-32 pb-16 bg-ivory-gradient overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gold/8 blur-3xl float" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
              Watch
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-ink tracking-tight-display mt-3 mb-4">
              Videos
            </h1>
            <p className="text-slate-custom text-lg max-w-xl">
              Cinematic stories, original series, documentaries, and editorial features — all beautifully crafted.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured carousel */}
      <section className="py-12 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <Carousel title="Featured" subtitle="Don't miss these picks">
              {featuredItems.map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} variant="wide" />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-8 bg-ivory sticky top-16 z-30 glass border-y border-ink/8">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
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
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all">
                <Grid2x2 size={18} />
              </button>
              <button className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all">
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="py-12 md:py-20 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex flex-wrap gap-5">
            {videosData.map((item, i) => (
              <Reveal key={item.id} delay={(i % 4) * 0.06}>
                <ContentCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase carousel */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <Carousel title="Series & Showcases" subtitle="Binge-worthy collections">
              {showcaseItems.map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
