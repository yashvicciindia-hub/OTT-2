import { BookOpen, Heart, Share2, Bookmark } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { Carousel } from '@/components/Carousel';
import { storiesData } from '@/data/content';

export function StoriesPage() {
  const featured = storiesData.slice(0, 3);
  const rest = storiesData.slice(3);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-ivory-gradient overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gold/8 blur-3xl float" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-gold" />
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                Read & View
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-ink tracking-tight-display mb-4">
              Stories
            </h1>
            <p className="text-slate-custom text-lg max-w-xl">
              Visual narratives, photo essays, and art series — storytelling beyond the moving image.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured stories — masonry style */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-ink tracking-tight-display mb-8">
              Featured Stories
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.1}>
                <article className={`group cursor-pointer ${i === 0 ? 'md:row-span-2' : ''}`}>
                  <div className={`relative rounded-2xl overflow-hidden bg-ivory-2 shadow-soft group-hover:shadow-elevated transition-all duration-500 ${i === 0 ? 'aspect-[3/4] md:aspect-auto md:h-full' : 'aspect-[4/3]'}`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-9 h-9 rounded-full glass flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all">
                        <Heart size={15} />
                      </button>
                      <button className="w-9 h-9 rounded-full glass flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all">
                        <Share2 size={15} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-cream/70 text-xs uppercase tracking-wide-display mb-2">
                        {item.category}
                      </p>
                      <h3 className={`font-display font-bold text-cream tracking-tight-display mb-2 ${i === 0 ? 'text-3xl' : 'text-xl'}`}>
                        {item.title}
                      </h3>
                      <p className="text-cream/60 text-sm leading-relaxed mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-cream/50 text-xs">{item.duration}</span>
                        <span className="flex items-center gap-1 text-gold-light text-xs">
                          <Bookmark size={12} /> Read
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* All stories grid */}
      <section className="py-12 md:py-20 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-ink tracking-tight-display mb-8">
              All Stories
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {rest.map((item, i) => (
              <Reveal key={item.id} delay={(i % 4) * 0.06}>
                <article className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ivory-2 shadow-soft group-hover:shadow-elevated transition-all duration-500">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-cream/70 text-[10px] uppercase tracking-wide-display mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-display text-lg font-bold text-cream tracking-tight-display">
                        {item.title}
                      </h3>
                      <span className="text-cream/50 text-xs">{item.duration}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Carousel */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <Carousel title="More to Explore" subtitle="Stories you might love">
              {storiesData.map((item, i) => (
                <div key={item.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                  <div className="group cursor-pointer">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ivory-2 shadow-soft group-hover:shadow-elevated transition-all duration-500">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-60" />
                      <div className="absolute bottom-0 p-4">
                        <h3 className="font-display text-lg font-bold text-cream tracking-tight-display">
                          {item.title}
                        </h3>
                        <span className="text-cream/50 text-xs">{item.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
