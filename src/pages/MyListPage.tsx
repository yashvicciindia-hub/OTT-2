import { useMemo, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Clock3,
  GripVertical,
  Grid2X2,
  Headphones,
  List,
  Play,
  Radio,
  Search,
  Sparkles,
  Trash2,
  Video,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { useMyList } from '@/context/MyListContext';
import { IMAGES, type MediaItem } from '@/data/content';

const tabs = ['All', 'Videos', 'Podcasts', 'Stories'] as const;
type ListTab = (typeof tabs)[number];
const destinations = {
  Videos: '/videos',
  Podcasts: '/podcasts',
  Stories: '/stories',
} as const;
const exploreCards = [
  { title: 'Videos', description: 'Cinematic experiences, ready to explore.', image: IMAGES.landscape6, href: '/videos', icon: Video },
  { title: 'Podcasts', description: 'Conversations and ideas worth hearing.', image: IMAGES.mic4, href: '/podcasts', icon: Headphones },
  { title: 'Stories', description: 'Perspectives told beyond the frame.', image: IMAGES.art5, href: '/stories', icon: BookOpen },
  { title: 'Live', description: 'A home for broadcasts when they begin.', image: IMAGES.concert4, href: '/live', icon: Radio },
];

function getDestination(type: MediaItem['type']) {
  if (type === 'video') return destinations.Videos;
  if (type === 'podcast') return destinations.Podcasts;
  return destinations.Stories;
}

export function MyListPage() {
  const { savedItems, recentItems, recordViewed, removeSavedItem, reorderSavedItems } = useMyList();
  const [activeTab, setActiveTab] = useState<ListTab>('All');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('Custom order');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [draggedId, setDraggedId] = useState('');

  const tabItems = useMemo(() => {
    if (activeTab === 'All') return savedItems;
    const type = activeTab === 'Videos' ? 'video' : activeTab === 'Podcasts' ? 'podcast' : 'story';
    return savedItems.filter((item) => item.type === type);
  }, [activeTab, savedItems]);

  const categories = useMemo(() => [...new Set(tabItems.map((item) => item.category))].sort(), [tabItems]);
  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tabItems
      .filter((item) => category === 'All categories' || item.category === category)
      .filter((item) => !term || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(term))
      .sort((first, second) => {
        if (sort === 'Custom order') return 0;
        if (sort === 'Title A–Z') return first.title.localeCompare(second.title);
        if (sort === 'Title Z–A') return second.title.localeCompare(first.title);
        return (second.savedAt ?? 0) - (first.savedAt ?? 0);
      });
  }, [category, search, sort, tabItems]);

  const handleDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();
    if (draggedId && draggedId !== targetId) reorderSavedItems(draggedId, targetId);
    setDraggedId('');
  };

  return (
    <PageWrapper>
      <section className="my-list-hero">
        <div className="my-list-hero__art" aria-hidden="true"><img src={IMAGES.studio6} alt="" /></div>
        <div className="my-list-hero__wash" aria-hidden="true" />
        <div className="my-list-container my-list-hero__inner">
          <Reveal>
            <span className="my-list-eyebrow"><Bookmark size={14} /> MY LIST</span>
            <h1>Your collection,<br /><em>your way.</em></h1>
            <p>Save videos, podcasts and stories to experience later.</p>
          </Reveal>
          <span className="my-list-hero__folio">A PERSONAL COLLECTION · {String(savedItems.length).padStart(2, '0')}</span>
        </div>
      </section>

      <section className="my-list-library" aria-labelledby="my-list-library-title">
        <div className="my-list-container">
          <Reveal>
            <div className="my-list-library__heading">
              <div><span className="my-list-eyebrow">KEPT CLOSE FOR LATER</span><h2 id="my-list-library-title">Your saved collection</h2></div>
              <span className="my-list-total">{savedItems.length} {savedItems.length === 1 ? 'item' : 'items'}</span>
            </div>
          </Reveal>

          <div className="my-list-tabs" role="tablist" aria-label="Filter saved content by type">
            {tabs.map((tab) => {
              const type = tab === 'Videos' ? 'video' : tab === 'Podcasts' ? 'podcast' : tab === 'Stories' ? 'story' : '';
              const count = type ? savedItems.filter((item) => item.type === type).length : savedItems.length;
              const selected = activeTab === tab;
              return <button key={tab} type="button" role="tab" aria-selected={selected} className={selected ? 'is-active' : ''} onClick={() => {
                setActiveTab(tab);
                setCategory('All categories');
              }}>{tab}<span>{count}</span></button>;
            })}
          </div>

          <div className="my-list-controls">
            <label className="my-list-search"><Search size={16} /><input type="search" placeholder="Search your list" aria-label="Search saved content" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}</label>
            <label className="my-list-select"><span>Category</span><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="my-list-select"><ArrowDownUp size={14} /><select aria-label="Sort saved content" value={sort} onChange={(event) => setSort(event.target.value)}><option>Custom order</option><option>Recently added</option><option>Title A–Z</option><option>Title Z–A</option></select></label>
            <div className="my-list-view-toggle" role="group" aria-label="Saved content layout">
              <button type="button" className={layout === 'grid' ? 'is-active' : ''} onClick={() => setLayout('grid')} aria-label="Grid view" aria-pressed={layout === 'grid'}><Grid2X2 size={16} /></button>
              <button type="button" className={layout === 'list' ? 'is-active' : ''} onClick={() => setLayout('list')} aria-label="List view" aria-pressed={layout === 'list'}><List size={17} /></button>
            </div>
          </div>

          <div className="my-list-results" aria-live="polite">
            {savedItems.length === 0 ? (
              <Reveal>
                <div className="my-list-empty">
                  <div className="my-list-empty__art"><span /><span /><Bookmark size={25} /><i /><i /></div>
                  <span className="my-list-eyebrow">A SPACE TO RETURN TO</span>
                  <h3>Your list is waiting.</h3>
                  <p>Save videos, podcasts and stories and they'll appear here.</p>
                  <Link to="/videos" className="my-list-button my-list-button--dark">Explore Content <ArrowRight size={16} /></Link>
                </div>
              </Reveal>
            ) : visibleItems.length === 0 ? (
              <motion.div className="my-list-no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Search size={21} /><h3>No saved items match these filters.</h3><p>Try a different search or category.</p>
                <button type="button" onClick={() => { setSearch(''); setCategory('All categories'); }}>Clear filters</button>
              </motion.div>
            ) : (
              <motion.div layout className={`my-list-grid ${layout === 'list' ? 'is-list' : ''}`}>
                <AnimatePresence mode="popLayout">
                  {visibleItems.map((item) => {
                    const Icon = item.type === 'video' ? Video : item.type === 'podcast' ? Headphones : BookOpen;
                    return (
                      <motion.article
                        layout
                        key={item.id}
                        className={`my-list-card ${draggedId === item.id ? 'is-dragging' : ''}`}
                        draggable
                        onDragStartCapture={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          setDraggedId(item.id);
                        }}
                        onDragEndCapture={() => setDraggedId('')}
                        onDragOverCapture={(event) => event.preventDefault()}
                        onDropCapture={(event) => handleDrop(event, item.id)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Link to={getDestination(item.type)} className="my-list-card__art" aria-label={`Open ${item.title}`} onClick={() => recordViewed(item)}>
                          <img src={item.image} alt="" />
                          <span className="my-list-card__wash" />
                          <span className="my-list-card__type"><Icon size={13} />{item.type}</span>
                          <span className="my-list-card__play"><Play size={17} fill="currentColor" /></span>
                        </Link>
                        <div className="my-list-card__body">
                          <span className="my-list-card__category">{item.category}</span>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          <div className="my-list-card__actions">
                            <Link to={getDestination(item.type)} className="my-list-card__open" onClick={() => recordViewed(item)}>Open content <ArrowUpRight size={14} /></Link>
                            <button type="button" onClick={() => removeSavedItem(item.id)} aria-label={`Remove ${item.title} from My List`} title="Remove from My List"><Trash2 size={15} /> Remove</button>
                          </div>
                        </div>
                        <span className="my-list-card__drag" aria-hidden="true"><GripVertical size={15} /></span>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="my-list-recent-section">
        <div className="my-list-container">
          <Reveal><div className="my-list-section-title"><div><span className="my-list-eyebrow"><Clock3 size={13} /> YOUR HISTORY</span><h2>Recently Viewed</h2></div></div></Reveal>
          <Reveal delay={0.05}>
            {recentItems.length ? (
              <div className="my-list-recent-grid">
                {recentItems.slice(0, 4).map((item) => <Link key={item.id} to={getDestination(item.type)} className="my-list-recent-card" onClick={() => recordViewed(item)}><img src={item.image} alt="" /><span><small>{item.category}</small><strong>{item.title}</strong></span><ArrowUpRight size={15} /></Link>)}
              </div>
            ) : (
              <div className="my-list-recent-empty">
                <div><span className="my-list-recent-empty__icon"><Clock3 size={19} /></span><h3>Nothing watched yet.</h3><p>Explore Lumera and your recently viewed content will appear here.</p></div>
                <Link to="/videos" className="my-list-button my-list-button--soft">Start Exploring <ArrowRight size={15} /></Link>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="my-list-explore-section">
        <div className="my-list-container">
          <Reveal><div className="my-list-section-title"><div><span className="my-list-eyebrow"><Sparkles size={13} /> FIND YOUR NEXT EXPERIENCE</span><h2>What would you like to explore?</h2></div></div></Reveal>
          <div className="my-list-explore-grid">
            {exploreCards.map(({ title, description, image, href, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 0.06}>
                <Link to={href} className="my-list-explore-card">
                  <img src={image} alt="" loading="lazy" /><span className="my-list-explore-card__wash" />
                  <span className="my-list-explore-card__icon"><Icon size={17} /></span>
                  <span className="my-list-explore-card__copy"><strong>{title}</strong><small>{description}</small></span>
                  <ArrowUpRight className="my-list-explore-card__arrow" size={19} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
