import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  CalendarDays,
  Check,
  Clapperboard,
  Clock3,
  FileText,
  Film,
  Grid2X2,
  Headphones,
  List,
  Plus,
  Radio,
  Search,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { usePodcastLibrary } from '@/context/PodcastLibraryContext';
import { useVideoLibrary } from '@/context/VideoLibraryContext';
import { IMAGES } from '@/data/content';

type ContentTab = 'All' | 'Videos' | 'Podcasts' | 'Live' | 'Stories';
type ContentStatus = 'Draft' | 'Scheduled' | 'Published';

interface StudioContent {
  id: string;
  title: string;
  description: string;
  category: string;
  type: Exclude<ContentTab, 'All'>;
  status: ContentStatus;
  image: string;
  href: string;
  updatedAt: number;
}

interface StoryRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  coverUrl: string;
  createdAt: number;
}

interface BroadcastRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  coverUrl: string;
  date: string;
  time: string;
}

const tabs: ContentTab[] = ['All', 'Videos', 'Podcasts', 'Live', 'Stories'];
const STUDIO_ACTIONS: { title: string; description: string; image: string; icon: LucideIcon; href: string; action: string }[] = [
  { title: 'Upload Video', description: 'Upload and publish video content.', image: IMAGES.studio2, icon: Film, href: '/videos', action: 'studio-upload-video' },
  { title: 'Upload Podcast', description: 'Upload audio and create episodes.', image: IMAGES.mic4, icon: AudioLines, href: '/podcasts', action: 'studio-upload-podcast' },
  { title: 'Go Live', description: 'Start or schedule a live broadcast.', image: IMAGES.concert3, icon: Radio, href: '/live', action: 'studio-open-live-studio' },
  { title: 'Create Story', description: 'Build an editorial story experience.', image: IMAGES.art5, icon: BookOpen, href: '/stories', action: 'studio-create-story' },
];
const QUICK_ACTIONS = [
  { title: 'Drafts', description: 'Continue work in progress', icon: FileText, status: 'Draft' as const },
  { title: 'Scheduled', description: 'Broadcasts on your calendar', icon: CalendarDays, status: 'Scheduled' as const },
  { title: 'Published', description: 'Your live content', icon: Check, status: 'Published' as const },
];

function isStoryRecord(value: unknown): value is StoryRecord {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'title' in value && typeof value.title === 'string'
    && 'description' in value && typeof value.description === 'string'
    && 'category' in value && typeof value.category === 'string'
    && 'coverUrl' in value && typeof value.coverUrl === 'string'
    && 'createdAt' in value && typeof value.createdAt === 'number';
}

function isBroadcastRecord(value: unknown): value is BroadcastRecord {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'title' in value && typeof value.title === 'string'
    && 'description' in value && typeof value.description === 'string'
    && 'category' in value && typeof value.category === 'string'
    && 'coverUrl' in value && typeof value.coverUrl === 'string'
    && 'date' in value && typeof value.date === 'string'
    && 'time' in value && typeof value.time === 'string';
}

function readSessionRecords<T>(key: string, label: string, isRecord: (value: unknown) => value is T): T[] {
  try {
    const value = window.sessionStorage.getItem(key);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error(`${label} data must be an array.`);
    return parsed.filter(isRecord);
  } catch (error) {
    console.error(`Could not read ${label} for the creator studio.`, error);
    return [];
  }
}

export function StudioPage() {
  const { videos } = useVideoLibrary();
  const { episodes } = usePodcastLibrary();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ContentTab>('All');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Recently updated');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const stories = useMemo(() => readSessionRecords('lumera-created-stories', 'story archive', isStoryRecord), []);
  const broadcasts = useMemo(() => readSessionRecords('lumera-scheduled-broadcasts', 'broadcast schedule', isBroadcastRecord), []);
  const content = useMemo<StudioContent[]>(() => [
    ...videos.map((video) => ({
      id: `video-${video.id}`,
      title: video.title,
      description: video.description,
      category: video.category,
      type: 'Videos' as const,
      status: video.status as ContentStatus,
      image: video.thumbnailUrl || IMAGES.landscape6,
      href: '/videos',
      updatedAt: video.createdAt,
    })),
    ...episodes.map((episode) => ({
      id: `podcast-${episode.id}`,
      title: episode.episodeTitle,
      description: episode.description || episode.podcastTitle,
      category: episode.category,
      type: 'Podcasts' as const,
      status: 'Published' as const,
      image: episode.coverUrl.startsWith('blob:') ? IMAGES.mic3 : episode.coverUrl || IMAGES.mic3,
      href: '/podcasts',
      updatedAt: episode.publishedAt,
    })),
    ...broadcasts.map((broadcast) => ({
      id: `live-${broadcast.id}`,
      title: broadcast.title,
      description: broadcast.description,
      category: broadcast.category,
      type: 'Live' as const,
      status: 'Scheduled' as const,
      image: broadcast.coverUrl.startsWith('blob:') ? IMAGES.studio1 : broadcast.coverUrl || IMAGES.studio1,
      href: '/live',
      updatedAt: new Date(`${broadcast.date}T${broadcast.time || '00:00'}`).getTime(),
    })),
    ...stories.map((story) => ({
      id: `story-${story.id}`,
      title: story.title,
      description: story.description,
      category: story.category,
      type: 'Stories' as const,
      status: 'Published' as const,
      image: story.coverUrl?.startsWith('blob:') ? IMAGES.art2 : story.coverUrl || IMAGES.art2,
      href: '/stories',
      updatedAt: story.createdAt,
    })),
  ], [broadcasts, episodes, stories, videos]);

  const tabContent = useMemo(() => activeTab === 'All' ? content : content.filter((item) => item.type === activeTab), [activeTab, content]);
  const visibleContent = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tabContent
      .filter((item) => statusFilter === 'All statuses' || item.status === statusFilter)
      .filter((item) => !term || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(term))
      .sort((first, second) => {
        if (sort === 'Title A–Z') return first.title.localeCompare(second.title);
        if (sort === 'Title Z–A') return second.title.localeCompare(first.title);
        return second.updatedAt - first.updatedAt;
      });
  }, [search, sort, statusFilter, tabContent]);

  const quickActionCounts = {
    Draft: content.filter((item) => item.status === 'Draft').length,
    Scheduled: content.filter((item) => item.status === 'Scheduled').length,
    Published: content.filter((item) => item.status === 'Published').length,
  };

  return (
    <PageWrapper>
      <section className="creator-hero" onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--creator-x', `${((event.clientX - bounds.left) / bounds.width - 0.5) * -8}px`);
        event.currentTarget.style.setProperty('--creator-y', `${((event.clientY - bounds.top) / bounds.height - 0.5) * -6}px`);
      }} onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--creator-x', '0px');
        event.currentTarget.style.setProperty('--creator-y', '0px');
      }}>
        <div className="creator-hero__image"><img src={IMAGES.studio1} alt="" /></div>
        <div className="creator-hero__wash" />
        <div className="creator-container creator-hero__inner">
          <Reveal>
            <span className="creator-eyebrow"><Clapperboard size={14} /> CREATOR STUDIO</span>
            <h1>Create. Publish.<br /><em>Share.</em></h1>
            <p>Everything you need to bring videos, podcasts, live broadcasts and stories to life.</p>
            <a href="#creator-actions" className="creator-primary-link">Open your studio <ArrowRight size={16} /></a>
          </Reveal>
          <span className="creator-hero__folio">YOUR CREATIVE WORKSPACE</span>
        </div>
      </section>

      <section className="creator-actions-section" id="creator-actions">
        <div className="creator-container">
          <Reveal><div className="creator-section-heading"><div><span className="creator-eyebrow">MAKE SOMETHING MEANINGFUL</span><h2>What would you like to create?</h2></div><span>Choose a workflow to get started.</span></div></Reveal>
          <div className="creator-action-grid">
            {STUDIO_ACTIONS.map(({ title, description, image, icon: Icon, href, action }, index) => (
              <Reveal key={title} delay={index * 0.055}>
                <Link to={href} state={{ studioAction: action }} className="creator-action-card">
                  <img src={image} alt="" loading="lazy" />
                  <span className="creator-action-card__wash" />
                  <span className="creator-action-card__index">0{index + 1}</span>
                  <span className="creator-action-card__icon"><Icon size={18} /></span>
                  <span className="creator-action-card__copy"><strong>{title}</strong><small>{description}</small></span>
                  <ArrowUpRight className="creator-action-card__arrow" size={20} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="creator-content-section" id="creator-content">
        <div className="creator-container">
          <Reveal>
            <div className="creator-section-heading creator-content-heading">
              <div><span className="creator-eyebrow">YOUR WORKSPACE</span><h2>Your Content</h2><p>Manage the videos, episodes, broadcasts and stories you create.</p></div>
              <Link to="#creator-actions" className="creator-inline-link">Create content <Plus size={15} /></Link>
            </div>
          </Reveal>

          <div className="creator-tabs" role="tablist" aria-label="Filter your content by type">
            {tabs.map((tab) => {
              const count = tab === 'All' ? content.length : content.filter((item) => item.type === tab).length;
              return <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)}>{tab}<span>{count}</span></button>;
            })}
          </div>
          <div className="creator-controls">
            <label className="creator-search"><Search size={16} /><input type="search" placeholder="Search your content" aria-label="Search your content" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <label className="creator-control-select"><span>Status</span><select aria-label="Filter by content status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Draft</option><option>Scheduled</option><option>Published</option></select></label>
            <label className="creator-control-select"><ArrowDownUp size={14} /><select aria-label="Sort content" value={sort} onChange={(event) => setSort(event.target.value)}><option>Recently updated</option><option>Title A–Z</option><option>Title Z–A</option></select></label>
            <div className="creator-view-toggle" role="group" aria-label="Content layout">
              <button type="button" aria-label="Grid view" aria-pressed={layout === 'grid'} className={layout === 'grid' ? 'is-active' : ''} onClick={() => setLayout('grid')}><Grid2X2 size={16} /></button>
              <button type="button" aria-label="List view" aria-pressed={layout === 'list'} className={layout === 'list' ? 'is-active' : ''} onClick={() => setLayout('list')}><List size={17} /></button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {content.length === 0 ? (
              <motion.div key="creator-empty" className="creator-empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <div className="creator-empty__art"><span /><Clapperboard size={26} /><i /><i /></div>
                <span className="creator-eyebrow">A CANVAS READY FOR YOU</span>
                <h3>Your studio is ready.</h3>
                <p>Create your first piece of content to start building your collection.</p>
                <a href="#creator-actions" className="creator-primary-link">Create Content <ArrowRight size={15} /></a>
              </motion.div>
            ) : visibleContent.length === 0 ? (
              <motion.div key="creator-no-results" className="creator-no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Search size={20} /><h3>No content matches these filters.</h3><button type="button" onClick={() => { setSearch(''); setStatusFilter('All statuses'); }}>Clear filters</button>
              </motion.div>
            ) : (
              <motion.div key={`${activeTab}-${layout}`} className={`creator-content-grid ${layout === 'list' ? 'is-list' : ''}`} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                {visibleContent.map((item) => {
                  const Icon = item.type === 'Videos' ? Video : item.type === 'Podcasts' ? Headphones : item.type === 'Live' ? Radio : BookOpen;
                  return <article key={item.id} className="creator-content-card">
                    <Link to={item.href} className="creator-content-card__image"><img src={item.image} alt="" /><span className="creator-content-card__image-wash" /><span><Icon size={13} /> {item.type}</span><i><ArrowUpRight size={17} /></i></Link>
                    <div className="creator-content-card__body"><span className="creator-content-card__category">{item.category} · {item.status}</span><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<Link to={item.href} className="creator-content-card__manage">Manage content <ArrowRight size={14} /></Link></div>
                  </article>;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="creator-quick-section">
        <div className="creator-container">
          <Reveal><div className="creator-section-heading"><div><span className="creator-eyebrow">AT A GLANCE</span><h2>Quick Actions</h2></div></div></Reveal>
          <div className="creator-quick-grid">
            {QUICK_ACTIONS.map(({ title, description, icon: Icon, status }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <button type="button" className={`creator-quick-card creator-quick-card--${status.toLowerCase()}`} onClick={() => {
                  if (status === 'Scheduled') {
                    navigate('/live', { state: { studioAction: 'studio-schedule-live' } });
                    return;
                  }
                  setStatusFilter(status);
                  setActiveTab('All');
                  document.getElementById('creator-content')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <span className="creator-quick-card__icon"><Icon size={18} /></span><span><strong>{title}</strong><small>{description}</small></span><b>{quickActionCounts[status]}</b><ArrowUpRight className="creator-quick-card__arrow" size={16} />
                </button>
              </Reveal>
            ))}
            <Reveal delay={0.15}>
              <a href="#creator-content" className="creator-quick-card creator-quick-card--manage"><span className="creator-quick-card__icon"><Clapperboard size={18} /></span><span><strong>Manage Content</strong><small>Review your whole collection</small></span><ArrowRight className="creator-quick-card__arrow" size={16} /></a>
            </Reveal>
          </div>
          <p className="creator-quick-note"><Clock3 size={13} /> Status counts reflect content available in this browser session.</p>
        </div>
      </section>
    </PageWrapper>
  );
}
