import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function Carousel({ children, title, subtitle }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-6 px-1">
          <div>
            {title && (
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight-display">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-slate-custom text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-11 h-11 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-1 px-1"
      >
        {children}
      </div>
      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-ivory to-transparent pointer-events-none hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
    </div>
  );
}
