import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search as SearchIcon, X, TrendingUp, Clock } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { videosData, podcastsData, storiesData, liveData } from '@/data/content';
import { ContentCard } from '@/components/ContentCard';

const trendingSearches = ['Cinematic', 'Documentary', 'Podcast', 'Live', 'Short Film', 'Series'];

const allItems = [...videosData, ...podcastsData, ...storiesData, ...liveData];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const location = useLocation();
  const results = query
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 bg-ivory-gradient">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {/* Search header */}
          <Reveal>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-ink tracking-tight-display mb-2">
              Search
            </h1>
            <p className="text-slate-custom text-lg mb-10">
              Find your next favorite story across films, podcasts, live, and more.
            </p>
          </Reveal>

          {/* Search bar */}
          <Reveal delay={0.1}>
            <div className="relative mb-8">
              <SearchIcon
                size={22}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-custom"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, categories, topics..."
                autoFocus
                className="w-full pl-14 pr-14 py-5 rounded-2xl bg-cream border border-ink/10 text-lg text-ink placeholder:text-slate-custom/60 focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all duration-300"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-custom hover:text-ink transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </Reveal>

          {/* Trending searches */}
          {!query && (
            <Reveal delay={0.2}>
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-gold" />
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wide-display">
                    Trending Searches
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-5 py-2.5 rounded-full bg-cream border border-ink/10 text-ink text-sm font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Results */}
          {query && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock size={18} className="text-gold" />
                <h3 className="text-sm font-semibold text-ink uppercase tracking-wide-display">
                  {results.length} {results.length === 1 ? 'Result' : 'Results'} for "{query}"
                </h3>
              </div>
              {results.length > 0 ? (
                <div className="flex flex-wrap gap-5">
                  {results.map((item, i) => (
                    <Reveal key={item.id} delay={i * 0.05}>
                      <ContentCard item={item} index={i} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Reveal>
                  <div className="text-center py-24">
                    <p className="font-display text-3xl text-ink/40 mb-2">
                      No results found
                    </p>
                    <p className="text-slate-custom">
                      Try a different search term — or explore our trending searches above.
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          )}

          {/* Browse all when no query */}
          {!query && (
            <Reveal delay={0.3}>
              <div>
                <h3 className="text-sm font-semibold text-ink uppercase tracking-wide-display mb-6">
                  Browse All
                </h3>
                <div className="flex flex-wrap gap-5">
                  {allItems.slice(0, 12).map((item, i) => (
                    <ContentCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
