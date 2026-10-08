import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Captions,
  Clock3,
  Eye,
  Film,
  Globe2,
  Headphones,
  Heart,
  HelpCircle,
  LockKeyhole,
  Monitor,
  Play,
  Radio,
  Settings2,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { useMyList } from '@/context/MyListContext';
import { IMAGES } from '@/data/content';

const destinations = {
  video: '/videos',
  podcast: '/podcasts',
  story: '/stories',
  live: '/live',
} as const;

const accountNavigation = [
  {
    label: 'My List',
    description: 'Your saved collection',
    icon: BookOpen,
    to: '/my-list',
    available: true,
  },
  {
    label: 'Continue Watching',
    description: 'Playback progress is not available yet',
    icon: Play,
    available: false,
  },
  {
    label: 'Liked',
    description: 'Likes are not collected in this session',
    icon: Heart,
    available: false,
  },
  {
    label: 'History',
    description: 'Recently viewed in this session',
    icon: Clock3,
    href: '#recently-viewed',
    available: true,
  },
] as const;

const preferences = [
  {
    title: 'Appearance',
    description: 'Lumera currently uses its light theme.',
    value: 'Light',
    icon: Monitor,
  },
  {
    title: 'Notifications',
    description: 'Notification preferences are not configured.',
    value: 'Unavailable',
    icon: Bell,
  },
  {
    title: 'Language',
    description: 'The current interface is available in English.',
    value: 'English',
    icon: Globe2,
  },
  {
    title: 'Playback',
    description: 'Playback options are controlled by each player.',
    value: 'Per player',
    icon: Settings2,
  },
  {
    title: 'Captions',
    description: 'Caption availability is set in each player.',
    value: 'Per player',
    icon: Captions,
  },
  {
    title: 'Privacy & Security',
    description: 'Account security settings require a connected account.',
    value: 'No account',
    icon: ShieldCheck,
  },
] as const;

const supportItems = [
  { label: 'Help & Support', detail: 'Support contact is not configured.', icon: HelpCircle },
  { label: 'Terms', detail: 'Terms are not available in this preview.', icon: Eye },
  { label: 'Privacy', detail: 'Privacy details are not available in this preview.', icon: LockKeyhole },
] as const;

export function ProfilePage() {
  const { savedItems, recentItems } = useMyList();

  return (
    <PageWrapper>
      <main className="account-page">
        <section className="account-hero" aria-labelledby="account-title">
          <div className="account-container">
            <Reveal>
              <span className="account-eyebrow">YOUR LUMERA</span>
              <div className="account-profile">
                <div className="account-avatar" aria-hidden="true">
                  <UserRound size={34} strokeWidth={1.35} />
                </div>
                <div className="account-profile__identity">
                  <h1 id="account-title">Your Lumera profile</h1>
                  <p>No account is connected</p>
                  <span>Your saved list and viewing history stay in this browser session.</span>
                </div>
                <div className="account-profile__actions">
                  <button type="button" disabled title="Profile editing is unavailable without a connected account">
                    Edit Profile
                  </button>
                  <button type="button" disabled title="Account management is unavailable without a connected account">
                    Manage Account
                  </button>
                </div>
              </div>
              <p className="account-unavailable-note">
                Profile details and sign-in services are not connected in this experience.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="account-section account-section--nav" aria-labelledby="account-nav-title">
          <div className="account-container">
            <Reveal>
              <div className="account-section-heading">
                <div>
                  <span className="account-eyebrow">MADE FOR YOU</span>
                  <h2 id="account-nav-title">Your Lumera</h2>
                </div>
                <span className="account-section-heading__aside">
                  <Play size={13} fill="currentColor" /> Your space to return to
                </span>
              </div>
            </Reveal>
            <div className="account-nav-grid">
              {accountNavigation.map(({ label, description, icon: Icon, available, ...destination }, index) => {
                const content = (
                  <>
                    <span className="account-nav-card__icon"><Icon size={19} strokeWidth={1.6} /></span>
                    <span className="account-nav-card__copy">
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                    {available
                      ? <ArrowUpRight className="account-nav-card__arrow" size={18} />
                      : <span className="account-nav-card__status">Not available</span>}
                  </>
                );
                const className = `account-nav-card${available ? '' : ' account-nav-card--disabled'}`;

                return (
                  <Reveal key={label} delay={index * 0.05}>
                    {available && 'to' in destination && destination.to ? (
                      <Link className={className} to={destination.to}>{content}</Link>
                    ) : available && 'href' in destination && destination.href ? (
                      <a className={className} href={destination.href}>{content}</a>
                    ) : (
                      <div className={className} aria-disabled="true">{content}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>
            <p className="account-session-note">
              <LockKeyhole size={13} /> Saved items and viewing history are stored for this browser session only.
              <span>{savedItems.length} {savedItems.length === 1 ? 'saved item' : 'saved items'}</span>
            </p>
          </div>
        </section>

        <section className="account-studio-section" aria-labelledby="account-studio-title">
          <div className="account-container">
            <Reveal>
              <div className="account-studio-card">
                <div className="account-studio-card__art" aria-hidden="true">
                  <img src={IMAGES.studio2} alt="" loading="lazy" />
                </div>
                <div className="account-studio-card__wash" aria-hidden="true" />
                <div className="account-studio-card__content">
                  <span className="account-eyebrow">CREATE WITH LUMERA</span>
                  <h2 id="account-studio-title">A place for what you make.</h2>
                  <p>Upload and manage videos, podcasts and stories in your Lumera Studio workspace.</p>
                  <Link to="/studio" className="account-studio-card__cta">
                    Open Studio <ArrowRight size={16} />
                  </Link>
                </div>
                <span className="account-studio-card__mark" aria-hidden="true">
                  <Film size={21} /><Headphones size={21} /><Video size={21} /><Radio size={21} />
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="account-section account-section--preferences" aria-labelledby="account-preferences-title">
          <div className="account-container">
            <Reveal>
              <div className="account-section-heading">
                <div>
                  <span className="account-eyebrow">THE WAY YOU WATCH</span>
                  <h2 id="account-preferences-title">Preferences</h2>
                </div>
                <p>Current experience settings</p>
              </div>
            </Reveal>
            <div className="account-preferences-grid">
              {preferences.map(({ title, description, value, icon: Icon }, index) => (
                <Reveal key={title} delay={index * 0.04}>
                  <motion.div className="account-preference-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <span className="account-preference-card__icon"><Icon size={18} strokeWidth={1.6} /></span>
                    <div className="account-preference-card__copy">
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                    <span className="account-preference-card__value">{value}</span>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="recently-viewed" className="account-section account-section--history" aria-labelledby="account-history-title">
          <div className="account-container">
            <Reveal>
              <div className="account-section-heading">
                <div>
                  <span className="account-eyebrow"><Clock3 size={13} /> YOUR RECENT ACTIVITY</span>
                  <h2 id="account-history-title">Recently Viewed</h2>
                </div>
                {recentItems.length > 0 && <span className="account-history-count">{recentItems.length} this session</span>}
              </div>
            </Reveal>
            {recentItems.length > 0 ? (
              <div className="account-history-list">
                {recentItems.slice(0, 6).map((item, index) => (
                  <Reveal key={item.id} delay={index * 0.04}>
                    <Link to={destinations[item.type]} className="account-history-item">
                      <img src={item.image} alt="" loading="lazy" />
                      <span className="account-history-item__copy">
                        <small>{item.category}</small>
                        <strong>{item.title}</strong>
                      </span>
                      <span className="account-history-item__type">{item.type}</span>
                      <ArrowUpRight className="account-history-item__arrow" size={18} />
                    </Link>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <div className="account-history-empty">
                  <span className="account-history-empty__icon"><Clock3 size={20} /></span>
                  <div>
                    <h3>Your story starts here.</h3>
                    <p>Content you view during this browser session will appear here.</p>
                  </div>
                  <Link to="/videos" className="account-history-empty__link">
                    Explore Lumera <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <section className="account-footer-section" aria-label="Account information">
          <div className="account-container">
            <div className="account-footer-card">
              <div className="account-footer-card__links">
                {supportItems.map(({ label, detail, icon: Icon }) => (
                  <div key={label} className="account-footer-link" aria-label={`${label}. ${detail}`}>
                    <Icon size={17} strokeWidth={1.6} />
                    <span>{label}</span>
                    <small>{detail}</small>
                  </div>
                ))}
              </div>
              <div className="account-signout">
                <div>
                  <strong>Sign Out</strong>
                  <span>No account is signed in.</span>
                </div>
                <button type="button" disabled title="There is no connected account to sign out">
                  Sign Out
                </button>
              </div>
            </div>
            <p className="account-footer-note">Lumera preferences and activity shown here reflect this browser session.</p>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
