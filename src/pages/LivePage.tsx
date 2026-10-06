import { Radio, Play, Calendar, Users } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { Carousel } from '@/components/Carousel';
import { ContentCard } from '@/components/ContentCard';
import { liveData } from '@/data/content';

export function LivePage() {
  const liveNow = liveData.filter((item) => item.badge === 'LIVE' || item.badge === 'Tonight');
  const upcoming = liveData.filter((item) => item.badge !== 'LIVE' && item.badge !== 'Tonight');

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-ivory-gradient overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-rose/8 blur-3xl float" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <div className="flex items-center gap-2 mb-3">
              <Radio size={18} className="text-rose" />
              <span className="text-xs font-semibold text-rose uppercase tracking-wide-display">
                Streaming Now
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-ink tracking-tight-display mb-4">
              Live
            </h1>
            <p className="text-slate-custom text-lg max-w-xl">
              Real-time performances, conversations, and events — as they happen.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Live now featured */}
      {liveNow.length > 0 && (
        <section className="py-12 bg-cream">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10">
            <Reveal>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-rose animate-pulse" />
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight-display">
                  Live Now
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {liveNow.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.1}>
                  <div className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 cursor-pointer">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide-display bg-rose text-cream">
                          <span className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" />
                          Live
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-cream/90 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500">
                          <Play size={26} className="text-ink ml-1" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-cream/70 text-xs uppercase tracking-wide-display mb-1">
                          {item.category}
                        </p>
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-cream tracking-tight-display mb-2">
                          {item.title}
                        </h3>
                        <p className="text-cream/60 text-sm">{item.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-cream/70 text-xs">
                            <Users size={14} /> 2.4k watching
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming schedule */}
      <section className="py-12 md:py-20 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex items-center gap-2 mb-8">
              <Calendar size={22} className="text-gold" />
              <h2 className="font-display text-3xl font-bold text-ink tracking-tight-display">
                Upcoming
              </h2>
            </div>
          </Reveal>

          <div className="space-y-4">
            {upcoming.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <div className="group flex items-center gap-5 bg-cream rounded-2xl p-4 shadow-soft hover:shadow-card transition-all duration-500 cursor-pointer">
                  <div className="relative w-32 h-20 md:w-40 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide-display bg-gold/15 text-gold-dark">
                        {item.badge}
                      </span>
                      <span className="text-slate-custom text-xs">{item.category}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink tracking-tight-display truncate">
                      {item.title}
                    </h3>
                    <p className="text-slate-custom text-sm truncate">{item.description}</p>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <span className="text-sm font-medium text-ink">{item.duration}</span>
                    <button className="px-4 py-2 rounded-full bg-ink/5 text-ink text-xs font-medium hover:bg-ink hover:text-cream transition-all">
                      Remind Me
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Past events carousel */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <Carousel title="Past Live Events" subtitle="Catch up on what you missed">
              {liveData.map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
