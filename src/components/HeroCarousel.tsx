import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaItem } from '@/data/content';

interface HeroCarouselProps {
  slides: MediaItem[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) {
        setCurrent((prev) => (prev + 1) % slides.length);
      }
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length, isTransitioning]);

  const goTo = (idx: number) => {
    setIsTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-all duration-1000"
          style={{
            opacity: idx === current ? 1 : 0,
            transform: idx === current ? 'scale(1)' : 'scale(1.05)',
            zIndex: idx === current ? 10 : 1,
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlays for light theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/40 to-ivory/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ivory/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center pt-28 pb-24 md:pt-32 md:pb-28">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 w-full">
          <div className="max-w-2xl">
            {slides[current].badge && (
              <div
                key={`badge-${current}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
                style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}
              >
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide-display text-ink">
                  {slides[current].badge}
                </span>
              </div>
            )}

            <p
              key={`cat-${current}`}
              className="text-gold-dark text-sm font-medium uppercase tracking-wide-display mb-3"
              style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}
            >
              {slides[current].category}
            </p>

            <h1
              key={`title-${current}`}
              className="font-display text-5xl md:text-7xl lg:text-7xl font-bold text-ink leading-[0.95] tracking-tight-display mb-6 text-balance"
              style={{ animation: 'slideUp 0.7s ease-out 0.3s both' }}
            >
              {slides[current].title}
            </h1>

            <p
              key={`desc-${current}`}
              className="text-ink/70 text-lg md:text-xl leading-relaxed max-w-xl mb-8"
              style={{ animation: 'slideUp 0.7s ease-out 0.4s both' }}
            >
              {slides[current].description}
            </p>

            <div
              key={`actions-${current}`}
              className="flex flex-wrap items-center gap-4"
              style={{ animation: 'slideUp 0.7s ease-out 0.5s both' }}
            >
              <Link
                to="/videos"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400 hover:shadow-elevated"
              >
                <Play size={20} fill="currentColor" />
                Watch Now
              </Link>
              <Link
                to="/my-list"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-ink/20 text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-400"
              >
                Add to List
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute z-30 bottom-24 md:bottom-32 right-6 md:right-10 flex items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === current ? 'w-10 bg-gold' : 'w-4 bg-ink/20 hover:bg-ink/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        {/* Arrows */}
        <div className="hidden md:flex gap-2 ml-4">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full glass border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="w-11 h-11 rounded-full glass border border-ink/10 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all duration-300"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute z-30 bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide-display text-ink/40">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-ink/30 to-transparent" />
      </div>
    </section>
  );
}
