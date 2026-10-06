import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { CategoryCard } from '@/data/content';

interface CategoryCardItemProps {
  item: CategoryCard;
  index?: number;
}

export function CategoryCardItem({ item, index = 0 }: CategoryCardItemProps) {
  return (
    <Link
      to={`/${item.title.toLowerCase()}`}
      className="group relative block rounded-2xl overflow-hidden bg-ivory-2 shadow-soft hover:shadow-elevated transition-all duration-500"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="aspect-[5/4] relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-cream/70 text-xs uppercase tracking-wide-display mb-1">
            {item.subtitle}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="font-display text-2xl font-bold text-cream tracking-tight-display">
              {item.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-cream/60 text-sm">{item.count}</span>
              <div className="w-9 h-9 rounded-full bg-cream/15 backdrop-blur-sm flex items-center justify-center text-cream group-hover:bg-gold group-hover:text-cream transition-all duration-300">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
