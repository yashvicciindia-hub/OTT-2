import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Captions,
  Check,
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
import { useAuth } from '@/context/AuthContext';
import { useMyList } from '@/context/MyListContext';
import { IMAGES } from '@/data/content';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

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
    description: 'Pick up where you left off',
    icon: Play,
    to: '/my-list?tab=Continue',
    available: true,
  },
  {
    label: 'Liked',
    description: 'Stories you have liked',
    icon: Heart,
    to: '/my-list?tab=Liked',
    available: true,
  },
  {
    label: 'History',
    description: 'Recently viewed in this session',
    icon: Clock3,
    href: '#recently-viewed',
    available: true,
  },
] as const;

const supportItems = [
  { label: 'Help & Support', detail: 'Support contact is not configured.', icon: HelpCircle },
  { label: 'Terms', detail: 'Terms are not available in this preview.', icon: Eye },
  { label: 'Privacy', detail: 'Privacy details are not available in this preview.', icon: LockKeyhole },
] as const;

interface ProfileRecord {
  display_name: string;
  avatar_path: string | null;
  preferences: Record<string, unknown>;
}

interface AccountPreferences {
  notifications: boolean;
  language: string;
  autoplay: boolean;
  captions: boolean;
  profile_visibility: 'private' | 'public';
}

const defaultPreferences: AccountPreferences = {
  notifications: true,
  language: 'en',
  autoplay: true,
  captions: false,
  profile_visibility: 'private',
};

function readPreferences(value: Record<string, unknown>): AccountPreferences {
  return {
    notifications: typeof value.notifications === 'boolean' ? value.notifications : defaultPreferences.notifications,
    language: typeof value.language === 'string' ? value.language : defaultPreferences.language,
    autoplay: typeof value.autoplay === 'boolean' ? value.autoplay : defaultPreferences.autoplay,
    captions: typeof value.captions === 'boolean' ? value.captions : defaultPreferences.captions,
    profile_visibility: value.profile_visibility === 'public' ? 'public' : 'private',
  };
}

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { savedItems, recentItems, error: libraryError, loading: libraryLoading } = useMyList();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [preferences, setPreferences] = useState<AccountPreferences>(defaultPreferences);
  const [editing, setEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!user || !isSupabaseConfigured) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      setProfileError('');
      try {
        const { data, error } = await requireSupabase()
          .from('profiles')
          .select('display_name, avatar_path, preferences')
          .eq('id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (!active) return;
        if (data) {
          const record = data as unknown as ProfileRecord;
          setProfile(record);
          setDisplayName(record.display_name);
          setPreferences(readPreferences(record.preferences ?? {}));
          setAvatarUrl(record.avatar_path
            ? requireSupabase().storage.from('lumera-thumbnails').getPublicUrl(record.avatar_path).data.publicUrl
            : '');
        } else {
          setDisplayName(typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : '');
          setProfile(null);
          setPreferences(defaultPreferences);
        }
      } catch (loadError) {
        if (!active) return;
        console.error('Could not load your profile.', loadError);
        setProfileError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
      } finally {
        if (active) setProfileLoading(false);
      }
    };
    void loadProfile();
    return () => { active = false; };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setProfileError('');
    try {
      const client = requireSupabase();
      let avatarPath = profile?.avatar_path ?? null;
      if (avatarFile) {
        const extension = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/avatars/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await client.storage.from('lumera-thumbnails').upload(path, avatarFile, {
          contentType: avatarFile.type,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        avatarPath = path;
      }
      const nextProfile = {
        id: user.id,
        display_name: displayName.trim(),
        avatar_path: avatarPath,
        preferences,
      };
      const { data, error } = await client.from('profiles')
        .upsert(nextProfile)
        .select('display_name, avatar_path, preferences')
        .single();
      if (error) throw error;
      const saved = data as unknown as ProfileRecord;
      setProfile(saved);
      setAvatarFile(null);
      setAvatarUrl(saved.avatar_path
        ? client.storage.from('lumera-thumbnails').getPublicUrl(saved.avatar_path).data.publicUrl
        : '');
      setEditing(false);
    } catch (saveError) {
      console.error('Could not save your profile.', saveError);
      setProfileError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Choose an image file for your avatar.');
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setProfileError('');
  };

  const updatePreference = (key: keyof AccountPreferences, value: string | boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const handleSignOut = async () => {
    setProfileError('');
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (signOutError) {
      console.error('Could not sign out.', signOutError);
      setProfileError(signOutError instanceof Error ? signOutError.message : 'Could not sign out.');
    }
  };

  const profileName = displayName || (typeof user?.user_metadata.full_name === 'string' ? user.user_metadata.full_name : '') || user?.email?.split('@')[0] || 'Lumera member';
  const avatarInitial = profileName.slice(0, 1).toUpperCase();
  const preferenceCards = [
    { title: 'Appearance', description: 'Keep Lumera’s light visual style.', value: 'Light', icon: Monitor },
    { title: 'Notifications', description: 'Choose whether to receive updates.', value: preferences.notifications, key: 'notifications' as const, icon: Bell },
    { title: 'Language', description: 'Language used across the experience.', value: preferences.language, key: 'language' as const, icon: Globe2 },
    { title: 'Playback', description: 'Start supported media automatically.', value: preferences.autoplay, key: 'autoplay' as const, icon: Settings2 },
    { title: 'Captions', description: 'Turn captions on by default when available.', value: preferences.captions, key: 'captions' as const, icon: Captions },
    { title: 'Privacy & Security', description: 'Control profile visibility and account access.', value: preferences.profile_visibility, key: 'profile_visibility' as const, icon: ShieldCheck },
  ];

  return (
    <PageWrapper>
      <main className="account-page">
        <section className="account-hero" aria-labelledby="account-title">
          <div className="account-container">
            <Reveal>
              <span className="account-eyebrow">YOUR LUMERA</span>
              <div className="account-profile">
                <div className="account-avatar" aria-hidden="true">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" />
                    : <span>{avatarInitial || <UserRound size={34} strokeWidth={1.35} />}</span>}
                </div>
                <div className="account-profile__identity">
                  <h1 id="account-title">{profileLoading ? 'Your Lumera profile' : profileName}</h1>
                  <p>{user?.email}</p>
                  <span>{profileLoading ? 'Loading account details…' : 'Your Lumera account and personal collection.'}</span>
                </div>
                <div className="account-profile__actions">
                  <button type="button" onClick={() => setEditing((current) => !current)}>
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <Link to="/auth?mode=reset" className="account-profile__manage">
                    Manage Account
                  </Link>
                </div>
              </div>
              {editing && (
                <form className="account-profile-editor" onSubmit={(event) => { event.preventDefault(); void saveProfile(); }}>
                  <label>
                    <span>Display name</span>
                    <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} required />
                  </label>
                  <label>
                    <span>Avatar</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseAvatar} />
                  </label>
                  <button type="submit" disabled={saving || profileLoading}>{saving ? 'Saving…' : 'Save Profile'} <Check size={15} /></button>
                </form>
              )}
              {profileError && <p className="account-profile-error" role="alert">{profileError}</p>}
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
                      <small>
                        {label === 'My List'
                          ? `${savedItems.length} saved ${savedItems.length === 1 ? 'item' : 'items'}`
                          : label === 'Liked'
                            ? 'View items you’ve liked'
                            : description}
                      </small>
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
              <LockKeyhole size={13} /> Your collection and history are synced securely to your account.
              <span>{savedItems.length} {savedItems.length === 1 ? 'saved item' : 'saved items'}</span>
            </p>
            {libraryError && <p className="account-profile-error" role="alert">{libraryError}</p>}
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
              {preferenceCards.map(({ title, description, value, icon: Icon, ...config }, index) => (
                <Reveal key={title} delay={index * 0.04}>
                  <motion.div className="account-preference-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <span className="account-preference-card__icon"><Icon size={18} strokeWidth={1.6} /></span>
                    <div className="account-preference-card__copy">
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                    {'key' in config && config.key === 'language' ? (
                      <select aria-label="Language preference" className="account-preference-card__select" value={String(value)} onChange={(event) => updatePreference('language', event.target.value)}>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    ) : 'key' in config && config.key === 'profile_visibility' ? (
                      <select aria-label="Profile visibility" className="account-preference-card__select" value={String(value)} onChange={(event) => updatePreference('profile_visibility', event.target.value)}>
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    ) : 'key' in config && typeof value === 'boolean' ? (
                      <button type="button" className={`account-preference-toggle${value ? ' is-on' : ''}`} role="switch" aria-checked={value} aria-label={`${title} ${value ? 'on' : 'off'}`} onClick={() => updatePreference(config.key, !value)}>
                        <span />
                      </button>
                    ) : (
                      <span className="account-preference-card__value">{String(value)}</span>
                    )}
                  </motion.div>
                </Reveal>
              ))}
            </div>
            <button type="button" className="account-preferences-save" disabled={saving || profileLoading} onClick={() => void saveProfile()}>
              {saving ? 'Saving preferences…' : 'Save Preferences'}
            </button>
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
            {libraryLoading ? (
              <p className="account-history-empty" role="status">Loading your recent activity…</p>
            ) : recentItems.length > 0 ? (
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
                  <span>Sign out of your Lumera account on this device.</span>
                </div>
                <button type="button" onClick={() => void handleSignOut()}>
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
