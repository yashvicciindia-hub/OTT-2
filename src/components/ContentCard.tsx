import { Play, Plus, Check, Star, Clock } from 'lucide-react';
import type { MediaItem } from '@/data/content';
import { useMyList } from '@/context/MyListContext';

interface ContentCardProps {
  item: MediaItem;
  variant?: 'default' | 'wide' | 'tall' | 'minimal';
  index?: number;
}

export function ContentCard({ item, variant = 'default' }: ContentCardProps) {
  const { isSaved, toggleSave } = useMyList();
  const saved = isSaved(item.id);

  const aspectClass =
    variant === 'wide' ? 'aspect-[16/10]' :
    variant === 'tall' ? 'aspect-[3/4]' :
    variant === 'minimal' ? 'aspect-[4/3]' :
    'aspect-[16/11]';

  const widthClass =
    variant === 'wide' ? 'min-w-[460px] max-w-[460px]' :
    variant === 'tall' ? 'min-w-[260px] max-w-[260px]' :
    variant === 'minimal' ? 'min-w-[320px] max-w-[320px]' :
    'min-w-[340px] max-w-[340px]';

  return (
    <div
      className={`group relative ${widthClass} flex-shrink-0`}
    >
      <div className={`relative ${aspectClass} rounded-2xl overflow-hidden bg-ivory-2 shadow-soft cursor-pointer transition-all duration-500 group-hover:shadow-elevated group-hover:-translate-y-1`}>
        {/* Image */}
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Badge */}
        {item.badge && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide-display ${
              item.badge === 'LIVE'
                ? 'bg-rose text-cream pulse-soft'
                : item.badge === 'New' || item.badge === 'New Season'
                ? 'bg-gold text-cream'
                : 'glass text-ink'
            }`}>
              {item.badge === 'LIVE' && (
                <span className="w-1.5 h-1.5 rounded-full bg-cream mr-1.5 animate-pulse" />
              )}
              {item.badge}
            </span>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(item);
          }}
          className={`content-card-save absolute top-3 right-3 ${saved ? 'w-auto min-w-9 px-3 is-added' : 'w-9'} h-9 rounded-full glass flex items-center justify-center gap-1.5 text-ink hover:bg-ink hover:text-cream transition-all duration-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100`}
          aria-label={saved ? 'Added to My List. Remove from list' : 'Add to My List'}
          title={saved ? 'Added to My List' : 'Add to My List'}
          aria-pressed={saved}
        >
          {saved ? <><Check size={16} /><span className="text-[10px] font-semibold">Added</span></> : <Plus size={16} />}
        </button>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="w-14 h-14 rounded-full bg-cream/90 backdrop-blur-sm flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
            <Play size={22} className="text-ink ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-cream/80 text-[11px] font-medium uppercase tracking-wide-display mb-1">
            {item.category}
          </p>
          <h3 className="text-cream font-display text-lg font-semibold leading-tight tracking-tight-display">
            {item.title}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            {item.duration && (
              <span className="flex items-center gap-1 text-cream/70 text-xs">
                <Clock size={11} /> {item.duration}
              </span>
            )}
            {item.episodes && (
              <span className="flex items-center gap-1 text-cream/70 text-xs">
                {item.episodes} episodes
              </span>
            )}
            <span className="flex items-center gap-0.5 text-gold-light text-xs ml-auto">
              <Star size={11} fill="currentColor" />
              <Star size={11} fill="currentColor" />
              <Star size={11} fill="currentColor" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
