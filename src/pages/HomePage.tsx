import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles, Clock, Star } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Carousel } from '@/components/Carousel';
import { ContentCard } from '@/components/ContentCard';
import { CategoryCardItem } from '@/components/CategoryCardItem';
import {
  heroSlides,
  featuredItems,
  categoryCards,
  editorialItems,
  showcaseItems,
  comingSoonItems,
} from '@/data/content';

export function HomePage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <HeroCarousel slides={heroSlides} />

      {/* Featured Section */}
      <section className="py-20 md:py-28 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-gold" />
                  <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                    Curated for You
                  </span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display">
                  Featured This Week
                </h2>
              </div>
              <Link
                to="/videos"
                className="hidden md:inline-flex items-center gap-2 text-ink text-sm font-medium hover:text-gold transition-colors group"
              >
                View All
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Carousel>
              {featuredItems.map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} variant="wide" />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                Explore by Format
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display mt-3">
                Find Your Format
              </h2>
              <p className="text-slate-custom text-lg mt-3 max-w-xl mx-auto">
                From cinematic films to live performances, every story has a home.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryCards.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 0.08}>
                <CategoryCardItem item={cat} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Grid */}
      <section className="py-20 md:py-28 bg-ivory-2">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                  The Edit
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display mt-3">
                  Editorial Picks
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {editorialItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <article className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ivory shadow-soft group-hover:shadow-elevated transition-all duration-500">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-cream/70 text-[11px] uppercase tracking-wide-display mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-display text-xl font-bold text-cream tracking-tight-display">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <p className="text-slate-custom text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-ink/40 whitespace-nowrap mt-0.5">
                      <Clock size={12} /> {item.duration}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Showcase */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="mb-10">
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                Binge-Worthy
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display mt-3">
                Series & Showcases
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Carousel>
              {showcaseItems.map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* Parallax Feature Banner */}
      <section className="relative h-[420px] md:h-[520px] overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(https://images.pexels.com/photos/6149187/pexels-photo-6149187.jpeg?auto=compress&cs=tinysrgb&w=1600)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/50 to-transparent" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 w-full">
            <Reveal>
              <div className="max-w-xl">
                <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                  LUMERA Originals
                </span>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-ink tracking-tight-display mt-3 mb-5 text-balance">
                  Stories worth the spotlight.
                </h2>
                <p className="text-ink/70 text-lg mb-8 max-w-lg">
                  Every LUMERA original is crafted with intention — cinematic, intimate, and unlike anything you've seen.
                </p>
                <Link
                  to="/videos"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400 hover:shadow-elevated group"
                >
                  <Play size={20} fill="currentColor" />
                  Explore Originals
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 md:py-28 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                On the Horizon
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display mt-3">
                Coming Soon
              </h2>
              <p className="text-slate-custom text-lg mt-3 max-w-xl mx-auto">
                Premieres and originals arriving throughout 2026.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {comingSoonItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.08}>
                <article className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ivory-2 shadow-soft group-hover:shadow-elevated transition-all duration-500">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {item.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide-display glass text-ink">
                          {item.badge}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-cream/70 text-[11px] uppercase tracking-wide-display mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-cream tracking-tight-display mb-2">
                        {item.title}
                      </h3>
                      <p className="text-cream/60 text-xs leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-gold-light text-xs">
                        <Clock size={12} />
                        <span>Notify Me</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden bg-gold-sheen p-12 md:p-20 text-center">
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl float" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose/10 blur-3xl float" style={{ animationDelay: '2s' }} />

              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-gold" fill="currentColor" />
                  ))}
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-ink tracking-tight-display mb-5 text-balance">
                  Your next obsession starts here.
                </h2>
                <p className="text-ink/70 text-lg mb-10 max-w-lg mx-auto">
                  Join LUMERA for premium cinematic storytelling, original series, and curated collections — all in one beautiful place.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/videos"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400 hover:shadow-elevated group"
                  >
                    <Play size={20} fill="currentColor" />
                    Start Watching
                  </Link>
                  <Link
                    to="/studio"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-ink/20 text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-400"
                  >
                    Visit Studio
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
