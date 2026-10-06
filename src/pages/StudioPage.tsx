import { Link } from 'react-router-dom';
import { Clapperboard, Camera, Film, Palette, Volume2, ArrowRight, Users, Award, TrendingUp } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { studioData, IMAGES } from '@/data/content';

const stats = [
  { icon: Film, label: 'Productions', value: '120+' },
  { icon: Users, label: 'Team Members', value: '45' },
  { icon: Award, label: 'Awards', value: '18' },
  { icon: TrendingUp, label: 'Years Active', value: '8' },
];

const iconMap: Record<string, typeof Camera> = {
  'studio-feature-1': Clapperboard,
  'studio-feature-2': Camera,
  'studio-feature-3': Film,
  'studio-feature-4': Clapperboard,
  'studio-feature-5': Palette,
  'studio-feature-6': Volume2,
};

export function StudioPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <img
          src={IMAGES.studio1}
          alt="Studio"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/50 to-ivory/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/80 to-transparent" />

        <div className="relative z-10 h-full flex items-end pb-16">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 w-full">
            <Reveal>
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Clapperboard size={18} className="text-gold" />
                  <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                    Behind the Scenes
                  </span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold text-ink tracking-tight-display mb-5 text-balance">
                  The LUMERA Studio
                </h1>
                <p className="text-ink/70 text-lg md:text-xl max-w-xl mb-8">
                  Where every story begins. From concept to final cut, our studio is built for cinematic excellence.
                </p>
                <Link
                  to="/videos"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400 hover:shadow-elevated group"
                >
                  See the Work
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon size={24} className="text-gold" />
                  </div>
                  <p className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display">
                    {stat.value}
                  </p>
                  <p className="text-slate-custom text-sm mt-1">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Studio features */}
      <section className="py-20 md:py-28 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                Our Facilities
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display mt-3">
                Inside the Studio
              </h2>
            </div>
          </Reveal>

          <div className="space-y-6">
            {studioData.map((feature, i) => {
              const Icon = iconMap[feature.id] || Camera;
              const reversed = i % 2 === 1;
              return (
                <Reveal key={feature.id} delay={0.05}>
                  <div className={`grid md:grid-cols-2 gap-6 md:gap-10 items-center ${reversed ? 'md:[direction:rtl]' : ''}`}>
                    <div className="relative rounded-3xl overflow-hidden shadow-card group [direction:ltr]">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent opacity-40" />
                    </div>
                    <div className="[direction:ltr]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                          <Icon size={22} className="text-gold" />
                        </div>
                        <span className="text-xs font-semibold text-gold-dark uppercase tracking-wide-display">
                          {String(i + 1).padStart(2, '0')} / {String(studioData.length).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight-display mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-slate-custom text-lg leading-relaxed mb-6">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(feature.stats).map(([key, value]) => (
                          <div
                            key={key}
                            className="px-4 py-2.5 rounded-xl bg-cream border border-ink/8"
                          >
                            <p className="text-[10px] uppercase tracking-wide-display text-slate-custom">
                              {key}
                            </p>
                            <p className="font-display text-lg font-bold text-ink">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden bg-ink p-12 md:p-20 text-center">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gold/20 blur-3xl float" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose/20 blur-3xl float" style={{ animationDelay: '2s' }} />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-cream tracking-tight-display mb-5 text-balance">
                  Want to create with us?
                </h2>
                <p className="text-cream/60 text-lg mb-10 max-w-lg mx-auto">
                  We collaborate with visionary creators to bring bold stories to life.
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-cream text-ink rounded-full font-medium hover:bg-gold hover:text-cream transition-all duration-400 group"
                >
                  Get in Touch
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
