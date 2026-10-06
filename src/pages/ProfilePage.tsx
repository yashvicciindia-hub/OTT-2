import { Link } from 'react-router-dom';
import { Settings, Bell, Heart, Bookmark, Clock, Play, Edit2, LogOut, Crown, Download } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { ContentCard } from '@/components/ContentCard';
import { videosData, podcastsData, storiesData } from '@/data/content';

const profileStats = [
  { icon: Play, label: 'Watched', value: '127' },
  { icon: Bookmark, label: 'Saved', value: '34' },
  { icon: Heart, label: 'Liked', value: '89' },
  { icon: Clock, label: 'Hours', value: '248' },
];

const recentlyWatched = [videosData[0], videosData[2], podcastsData[0], storiesData[0]];
const recommended = [videosData[1], videosData[3], podcastsData[2], storiesData[2]];

const menuItems = [
  { icon: Edit2, label: 'Edit Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Account Settings' },
  { icon: Download, label: 'Downloads' },
  { icon: Crown, label: 'Subscription' },
  { icon: LogOut, label: 'Sign Out' },
];

export function ProfilePage() {
  return (
    <PageWrapper>
      {/* Profile header */}
      <section className="relative pt-32 pb-12 bg-ivory-gradient overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gold/8 blur-3xl float" />
        <div className="absolute top-40 left-10 w-72 h-72 rounded-full bg-rose/6 blur-3xl float" style={{ animationDelay: '2s' }} />

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-gold to-rose flex items-center justify-center shadow-elevated">
                  <span className="font-display text-5xl md:text-6xl font-bold text-cream">A</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-ink flex items-center justify-center shadow-card cursor-pointer hover:bg-gold transition-colors">
                  <Edit2 size={16} className="text-cream" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight-display">
                    Alex Morgan
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold-dark">
                    <Crown size={14} />
                    Premium
                  </span>
                </div>
                <p className="text-slate-custom text-lg mb-1">alex.morgan@lumera.com</p>
                <p className="text-slate-custom text-sm">Member since January 2025</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full md:w-auto">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="bg-cream rounded-2xl p-4 text-center shadow-soft min-w-[100px]">
                    <stat.icon size={20} className="text-gold mx-auto mb-2" />
                    <p className="font-display text-2xl font-bold text-ink">{stat.value}</p>
                    <p className="text-slate-custom text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recently watched */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight-display">
                Continue Watching
              </h2>
              <Link to="/videos" className="text-sm text-slate-custom hover:text-gold transition-colors">
                View All
              </Link>
            </div>
          </Reveal>

          <div className="flex flex-wrap gap-5">
            {recentlyWatched.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <div className="relative group">
                  <ContentCard item={item} index={i} />
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-ink/10 rounded-b-2xl overflow-hidden mx-1">
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${30 + i * 20}%` }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="py-12 md:py-16 bg-ivory-gradient">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight-display mb-6">
              Recommended for You
            </h2>
          </Reveal>
          <div className="flex flex-wrap gap-5">
            {recommended.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <ContentCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Settings menu */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="max-w-[800px] mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight-display mb-8">
              Settings
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-ivory rounded-2xl shadow-soft overflow-hidden">
              {menuItems.map((item, i) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-4 px-6 py-5 hover:bg-ivory-2 transition-colors duration-300 text-left ${
                    i !== menuItems.length - 1 ? 'border-b border-ink/8' : ''
                  } ${item.label === 'Sign Out' ? 'text-rose' : 'text-ink'}`}
                >
                  <item.icon size={20} className={item.label === 'Sign Out' ? 'text-rose' : 'text-slate-custom'} />
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-auto text-slate-custom">›</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </PageWrapper>
  );
}
