import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookmarkPlus,
  BookOpen,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Compass,
  Eye,
  ImagePlus,
  Lightbulb,
  MapPin,
  Palette,
  Plus,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { IMAGES } from '@/data/content';
import { useMyList } from '@/context/MyListContext';

const storyCategories = [
  { title: 'People', description: 'Voices, journeys and perspectives.', image: IMAGES.portrait4, icon: Users },
  { title: 'Places', description: 'Culture, spaces and landscapes.', image: IMAGES.landscape5, icon: MapPin },
  { title: 'Craft', description: 'Making, creating and preserving.', image: IMAGES.art4, icon: Palette },
  { title: 'Ideas', description: 'Perspectives, conversations and discoveries.', image: IMAGES.studio7, icon: Lightbulb },
  { title: 'Culture', description: 'Tradition, creativity and heritage.', image: IMAGES.art6, icon: Sparkles },
  { title: 'Behind the Scenes', description: 'What happens beyond the final frame.', image: IMAGES.studio4, icon: Camera },
];

const collections = [
  { title: 'The Human Story', note: 'People and perspectives.', image: IMAGES.portrait2, size: 'tall', mark: '01' },
  { title: 'Made by Hand', note: 'Craft, creativity and process.', image: IMAGES.art5, size: 'wide', mark: '02' },
  { title: 'Beyond the Frame', note: 'The making behind visual experiences.', image: IMAGES.studio3, size: 'wide', mark: '03' },
  { title: 'Living Culture', note: 'Tradition, identity and contemporary expression.', image: IMAGES.art8, size: 'tall', mark: '04' },
];

const formats = [
  { title: 'WATCH', description: 'Cinematic video stories, framed with feeling.', image: IMAGES.concert4, icon: Video, href: '/videos', action: 'Explore Videos' },
  { title: 'READ', description: 'Editorial storytelling, one thought at a time.', image: IMAGES.art3, icon: BookOpen, href: '#story-archive', action: 'Browse the Archive' },
  { title: 'LISTEN', description: 'Audio-led stories and voices worth hearing.', image: IMAGES.mic3, icon: AudioLines, href: '/podcasts', action: 'Explore Podcasts' },
  { title: 'EXPLORE', description: 'Interactive experiences that invite a closer look.', image: IMAGES.landscape3, icon: Compass, href: '#story-map', action: 'Explore the Map' },
];

const mapThemes = ['Craft', 'Culture', 'People', 'Places', 'Ideas'];

interface CreatedStory {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  coverUrl: string;
  mediaUrl: string;
  mediaName: string;
  createdAt: number;
}

const STORIES_STORAGE_KEY = 'lumera-created-stories';

function readCreatedStories(): CreatedStory[] {
  try {
    const stored = window.sessionStorage.getItem(STORIES_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Story archive data is not an array.');
    return parsed.filter((story): story is CreatedStory => (
      typeof story === 'object'
      && story !== null
      && typeof story.id === 'string'
      && typeof story.title === 'string'
      && typeof story.category === 'string'
      && typeof story.description === 'string'
      && typeof story.content === 'string'
      && typeof story.coverUrl === 'string'
      && typeof story.mediaUrl === 'string'
      && typeof story.mediaName === 'string'
      && typeof story.createdAt === 'number'
    )).map((story) => ({
      ...story,
      coverUrl: story.coverUrl?.startsWith('blob:') ? '' : story.coverUrl,
      mediaUrl: '',
    }));
  } catch (error) {
    console.error('Could not read the story archive from this browser session.', error);
    return [];
  }
}

function storyListItem(story: CreatedStory) {
  return {
    id: `created-story-${story.id}`,
    title: story.title,
    category: story.category,
    type: 'story' as const,
    image: story.coverUrl || IMAGES.art2,
    description: story.description,
    status: 'new' as const,
  };
}

function StoryCreationModal({ initialCategory, onClose, onPublish }: { initialCategory: string; onClose: () => void; onPublish: (story: CreatedStory) => void }) {
  const coverInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);
  const urls = useRef({ cover: '', media: '' });
  const retained = useRef(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaName, setMediaName] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const onCloseRef = useRef(onClose);
  const publishingRef = useRef(publishing);
  onCloseRef.current = onClose;
  publishingRef.current = publishing;

  useEffect(() => {
    const currentUrls = urls.current;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !publishingRef.current) onCloseRef.current();
      if (event.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>('.story-create-modal');
        const focusable = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not([type="file"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)');
        if (!focusable?.length) return;
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    };
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.story-create-modal input:not([type="file"])')?.focus());
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (!retained.current) {
        if (currentUrls.cover) URL.revokeObjectURL(currentUrls.cover);
        if (currentUrls.media) URL.revokeObjectURL(currentUrls.media);
      }
    };
  }, []);

  const selectFile = (event: ChangeEvent<HTMLInputElement>, type: 'cover' | 'media') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (type === 'cover' && !file.type.startsWith('image/')) {
      setError('Choose an image for your story cover.');
      return;
    }
    if (type === 'media' && !file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setError('Choose an image, video or audio file for your story media.');
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    if (type === 'cover') {
      if (urls.current.cover) URL.revokeObjectURL(urls.current.cover);
      urls.current.cover = nextUrl;
      setCoverUrl(nextUrl);
    } else {
      if (urls.current.media) URL.revokeObjectURL(urls.current.media);
      urls.current.media = nextUrl;
      setMediaUrl(nextUrl);
      setMediaName(file.name);
    }
    setError('');
  };

  const publish = async () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      setError('Add a title, short description and story content before publishing.');
      return;
    }
    setPublishing(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
    retained.current = true;
    onPublish({
      id: `story-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      content: content.trim(),
      coverUrl,
      mediaUrl,
      mediaName,
      createdAt: Date.now(),
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void publish();
  };

  return (
    <motion.div
      className="story-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !publishing) onClose();
      }}
    >
      <motion.section
        className="story-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-create-title"
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="story-modal-header">
          <div><span className="story-eyebrow">LUMERA STORIES · CREATOR</span><h2 id="story-create-title">{preview ? 'Preview your story' : 'Create a story'}</h2><p>Shape the story you want to share. Your draft stays in this browser.</p></div>
          <button type="button" className="story-icon-button" onClick={onClose} disabled={publishing} aria-label="Close story creator"><X size={19} /></button>
        </header>
        {preview ? (
          <div className="story-modal-preview">
            <div className="story-modal-preview__cover">
              {coverUrl ? <img src={coverUrl} alt="" /> : <span><BookOpen size={27} /></span>}
              <span>{category}</span>
            </div>
            <div className="story-modal-preview__copy"><span className="story-eyebrow">STORY PREVIEW</span><h3>{title || 'Your story title'}</h3><p>{description || 'A short introduction to your story will appear here.'}</p><div className="story-modal-preview__content">{content || 'Your story content will appear here.'}</div>{mediaName && <span className="story-media-chip"><CirclePlay size={15} /> {mediaName}</span>}</div>
          </div>
        ) : (
          <form className="story-create-form" onSubmit={submit}>
            <label className="story-form-field story-form-field--wide"><span>Story title <i>*</i></span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Give your story a title" required /></label>
            <div className="story-form-field story-form-field--wide"><span>Cover image <small>Optional</small></span><input ref={coverInput} className="sr-only" type="file" accept="image/*" onChange={(event) => selectFile(event, 'cover')} />{coverUrl ? <div className="story-file-selected"><img src={coverUrl} alt="Story cover preview" /><span>Cover image selected</span><button type="button" onClick={() => coverInput.current?.click()}>Replace</button><button type="button" aria-label="Remove cover image" onClick={() => { URL.revokeObjectURL(coverUrl); urls.current.cover = ''; setCoverUrl(''); }}><X size={15} /></button></div> : <button type="button" className="story-file-picker" onClick={() => coverInput.current?.click()}><ImagePlus size={17} /> Add a cover image</button>}</div>
            <label className="story-form-field"><span>Category</span><span className="story-select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value)}>{storyCategories.map((item) => <option key={item.title}>{item.title}</option>)}</select><ChevronRight size={14} /></span></label>
            <label className="story-form-field"><span>Short description <i>*</i></span><input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={260} placeholder="A few words to invite readers in" required /></label>
            <label className="story-form-field story-form-field--wide"><span>Story content <i>*</i></span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={7} maxLength={12000} placeholder="Begin your story here…" required /></label>
            <div className="story-form-field story-form-field--wide"><span>Supporting media <small>Optional</small></span><input ref={mediaInput} className="sr-only" type="file" accept="image/*,video/*,audio/*" onChange={(event) => selectFile(event, 'media')} />{mediaUrl ? <div className="story-media-chip"><CirclePlay size={15} /><span>{mediaName}</span><button type="button" onClick={() => mediaInput.current?.click()}>Replace</button><button type="button" aria-label="Remove supporting media" onClick={() => { URL.revokeObjectURL(mediaUrl); urls.current.media = ''; setMediaUrl(''); setMediaName(''); }}><X size={15} /></button></div> : <button type="button" className="story-file-picker" onClick={() => mediaInput.current?.click()}><Plus size={16} /> Add image, video or audio</button>}</div>
            {error && <p className="story-form-error" role="alert">{error}</p>}
            <footer className="story-form-footer"><span>Publishing adds your story to this browser session. No content is uploaded to a server.</span><button type="button" className="story-button story-button--soft" onClick={() => setPreview(true)}><Eye size={15} /> Preview</button><button type="submit" className="story-button story-button--dark" disabled={publishing}>{publishing ? 'Publishing…' : 'Publish Story'} <ArrowRight size={15} /></button></footer>
          </form>
        )}
        {preview && <footer className="story-preview-footer"><button type="button" className="story-button story-button--soft" onClick={() => setPreview(false)}><ArrowLeft size={15} /> Back to edit</button><button type="button" className="story-button story-button--dark" onClick={() => void publish()} disabled={publishing}>{publishing ? 'Publishing…' : 'Publish Story'} <ArrowRight size={15} /></button></footer>}
      </motion.section>
    </motion.div>
  );
}

export function StoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSaved, recordViewed, retainObjectUrl, toggleSave } = useMyList();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hoveredMapTheme, setHoveredMapTheme] = useState('');
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [creationOpen, setCreationOpen] = useState(false);
  const [stories, setStories] = useState<CreatedStory[]>(readCreatedStories);
  const [notification, setNotification] = useState('');
  const collectionsRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
  const activeFormat = formats[selectedFormat];
  const ActiveFormatIcon = activeFormat.icon;

  useEffect(() => {
    const state = location.state as { studioAction?: unknown } | null;
    if (state?.studioAction !== 'studio-create-story') return;
    setCreationOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
    } catch (error) {
      console.error('Could not persist the story archive in this browser session.', error);
    }
  }, [stories]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(''), 3800);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const publishStory = (story: CreatedStory) => {
    retainObjectUrl(story.coverUrl);
    retainObjectUrl(story.mediaUrl);
    setStories((current) => [story, ...current]);
    setCreationOpen(false);
    setNotification('Your story was published in this session.');
  };

  const scrollCollections = (direction: -1 | 1) => {
    collectionsRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });
  };

  const onCollectionWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      event.currentTarget.scrollLeft += event.deltaY;
    }
  };

  const onCollectionPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    dragState.current = { active: true, moved: false, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
    event.currentTarget.classList.add('is-dragging');
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onCollectionPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const distance = event.clientX - dragState.current.startX;
    if (Math.abs(distance) > 4) dragState.current.moved = true;
    event.currentTarget.scrollLeft = dragState.current.scrollLeft - distance;
  };

  const onCollectionPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    event.currentTarget.classList.remove('is-dragging');
  };

  const exploreFeatured = () => {
    setSelectedCategory('Craft');
    document.getElementById('story-types')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageWrapper>
      <section className="story-hero" onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--story-pointer-x', `${((event.clientX - bounds.left) / bounds.width - 0.5) * -8}px`);
        event.currentTarget.style.setProperty('--story-pointer-y', `${((event.clientY - bounds.top) / bounds.height - 0.5) * -7}px`);
      }} onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--story-pointer-x', '0px');
        event.currentTarget.style.setProperty('--story-pointer-y', '0px');
      }}>
        <div className="story-hero__art"><img src={IMAGES.art7} alt="" /></div>
        <div className="story-hero__wash" />
        <div className="story-container story-hero__inner">
          <Reveal>
            <div className="story-hero__copy"><span className="story-kicker"><BookOpen size={15} /> STORIES · EDITORIAL COLLECTION</span><h1>Stories worth<br /><em>staying for.</em></h1><p>People, places, ideas and moments — told beyond the frame.</p><a href="#story-featured" className="story-button story-button--dark">Explore Stories <ArrowRight size={16} /></a></div>
          </Reveal>
        </div>
      </section>

      <section className="story-featured-section" id="story-featured">
        <div className="story-container">
          <Reveal><div className="story-section-top"><span className="story-eyebrow">A STORYTELLING CONCEPT · NOT A PUBLISHED STORY</span><span className="story-section-index">01 — 08</span></div></Reveal>
          <Reveal delay={0.05}>
            <article className="story-featured-card">
              <div className="story-featured-card__art"><img src={IMAGES.studio6} alt="" loading="lazy" /><span className="story-featured-card__shade" /><span className="story-featured-card__art-mark">LUMERA<br />EDITORIAL</span><span className="story-featured-card__art-caption">PROCESS · PERSPECTIVE · POSSIBILITY</span><div className="story-featured-card__seal">01<br /><i /> STORY</div></div>
              <div className="story-featured-card__copy"><span className="story-eyebrow"><i /> FEATURED · EDITORIAL CONCEPT</span><h2>The craft behind<br />the frame</h2><p>Discover the people, ideas and creative processes that shape meaningful stories.</p><button type="button" className="story-text-link" onClick={exploreFeatured}>Explore Story <ArrowRight size={16} /></button><span className="story-featured-card__folio">A STUDY IN MAKING</span></div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="story-types-section" id="story-types">
        <div className="story-container">
          <Reveal><div className="story-section-heading"><div><span className="story-eyebrow">BROWSE BY STORY TYPE</span><h2>What kind of story<br />are you looking for?</h2></div><p>Choose a perspective to explore. These are editorial themes, not published stories.</p></div></Reveal>
          <div className="story-type-grid">
            {storyCategories.map((item, index) => {
              const Icon = item.icon;
              const selected = selectedCategory === item.title;
              return <Reveal key={item.title} delay={index * 0.045}><button type="button" className={`story-type-card ${selected ? 'is-selected' : ''}`} aria-pressed={selected} onClick={() => setSelectedCategory(selected ? '' : item.title)}><img src={item.image} alt="" loading="lazy" /><span className="story-type-card__wash" /><span className="story-type-card__index">0{index + 1}</span><span className="story-type-card__icon"><Icon size={16} /></span><span className="story-type-card__copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="story-type-card__arrow"><ArrowUpRight size={17} /></span></button></Reveal>;
            })}
          </div>
          {selectedCategory && <div className="story-category-note" role="status"><span><Check size={15} /> Exploring the <strong>{selectedCategory}</strong> perspective</span><button type="button" onClick={() => setCreationOpen(true)}>Create a {selectedCategory} story <ArrowRight size={15} /></button></div>}
        </div>
      </section>

      <section className="story-collections-section" id="story-collections">
        <div className="story-container">
          <Reveal><div className="story-section-heading story-collections-heading"><div><span className="story-eyebrow">EDITORIAL PATHWAYS</span><h2>Explore Collections</h2></div><div className="story-collection-controls"><span>Drag to discover</span><button type="button" aria-label="Scroll collections left" onClick={() => scrollCollections(-1)}><ChevronLeft size={18} /></button><button type="button" aria-label="Scroll collections right" onClick={() => scrollCollections(1)}><ChevronRight size={18} /></button></div></div></Reveal>
          <div className="story-collection-track" ref={collectionsRef} onWheel={onCollectionWheel} onPointerDown={onCollectionPointerDown} onPointerMove={onCollectionPointerMove} onPointerUp={onCollectionPointerUp} onPointerCancel={onCollectionPointerUp} onLostPointerCapture={onCollectionPointerUp} aria-label="Story collections">
            {collections.map((collection) => <article className={`story-collection-card story-collection-card--${collection.size}`} key={collection.title} role="button" tabIndex={0} onClick={() => {
              if (dragState.current.moved) {
                dragState.current.moved = false;
                return;
              }
              setSelectedCategory(collection.title === 'Made by Hand' ? 'Craft' : collection.title === 'Living Culture' ? 'Culture' : collection.title === 'The Human Story' ? 'People' : 'Behind the Scenes');
            }} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedCategory(collection.title === 'Made by Hand' ? 'Craft' : collection.title === 'Living Culture' ? 'Culture' : collection.title === 'The Human Story' ? 'People' : 'Behind the Scenes');
              }
            }}><img src={collection.image} alt="" loading="lazy" /><span className="story-collection-card__wash" /><span className="story-collection-card__mark">{collection.mark}</span><div><span className="story-eyebrow">COLLECTION CONCEPT</span><h3>{collection.title}</h3><p>{collection.note}</p></div><ArrowUpRight className="story-collection-card__arrow" size={20} /></article>)}
          </div>
          {selectedCategory && <p className="story-collection-selection" aria-live="polite"><Check size={14} /> Collection perspective selected: {selectedCategory}</p>}
        </div>
      </section>

      <section className="story-formats-section" id="story-formats">
        <div className="story-container">
          <Reveal><div className="story-section-heading"><div><span className="story-eyebrow">CHOOSE YOUR WAY IN</span><h2>Every story has a different<br />way of being told.</h2></div><span className="story-section-aside">Select a format to see where it can take you.</span></div></Reveal>
          <div className="story-formats-layout">
            <div className="story-format-list" role="tablist" aria-label="Story formats">
              {formats.map((format, index) => {
                const Icon = format.icon;
                const active = selectedFormat === index;
                return <button key={format.title} type="button" className={`story-format-option ${active ? 'is-active' : ''}`} role="tab" aria-selected={active} onClick={() => setSelectedFormat(index)}><span className="story-format-option__icon"><Icon size={19} /></span><span><strong>{format.title}</strong><small>{format.description}</small></span><ArrowRight size={16} /></button>;
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeFormat.title} className="story-format-preview" role="tabpanel" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.24 }}>
                <img src={activeFormat.image} alt="" loading="lazy" /><span className="story-format-preview__wash" /><span className="story-format-preview__folio">FORMAT STUDY · 0{selectedFormat + 1}</span><div className="story-format-preview__center"><span><ActiveFormatIcon size={24} /></span><strong>{activeFormat.title}</strong><small>{activeFormat.description}</small><Link to={activeFormat.href} className="story-button story-button--cream">{activeFormat.action} <ArrowUpRight size={15} /></Link></div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="story-map-section" id="story-map">
        <div className="story-container">
          <Reveal><div className="story-section-heading"><div><span className="story-eyebrow">A COUNTRY OF MANY PERSPECTIVES</span><h2>Stories Across India</h2></div><p>A stylized map inviting stories from everywhere — no locations or published stories are pinned.</p></div></Reveal>
          <Reveal delay={0.05}>
            <div className="story-map-panel">
              <div className="story-map-copy"><span className="story-map-index">INDIA · STORY ATLAS</span><h3>A map of stories<br />waiting to be told.</h3><p>Every place holds many ways of seeing. Explore a storytelling theme to begin imagining what could be shared.</p><div className="story-map-legend">{['Craft', 'Culture', 'People', 'Places', 'Ideas'].map((theme, index) => <button type="button" key={theme} className={selectedCategory === theme ? 'is-selected' : ''} onClick={() => setSelectedCategory(selectedCategory === theme ? '' : theme)}><i className={`story-map-dot story-map-dot--${index + 1}`} />{theme}</button>)}</div>{selectedCategory && <p className="story-map-selection"><Sparkles size={14} /> {selectedCategory} is a theme only—there are no story pins yet.</p>}</div>
              <div className="story-map-art" onPointerLeave={() => setHoveredMapTheme('')}>
                <svg className="story-map-svg" viewBox="0 0 540 510" role="img" aria-label="Illustrative India-shaped story map with no locations or story pins">
                  <defs><linearGradient id="storyIndiaFill" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#e9dbc1" /><stop offset=".55" stopColor="#c6a67a" /><stop offset="1" stopColor="#a76d58" /></linearGradient><pattern id="storyIndiaPattern" width="18" height="18" patternTransform="rotate(35)" patternUnits="userSpaceOnUse"><path d="M0 0h1v18" stroke="#fff7e9" strokeOpacity=".2" /></pattern><clipPath id="storyIndiaClip"><path d="M173 30 204 43 226 37 249 51 275 48 291 65 321 61 333 84 359 91 372 113 396 124 401 151 423 172 415 196 436 215 423 239 434 262 416 282 427 304 412 325 418 349 400 365 399 389 379 404 373 429 349 435 331 455 309 447 289 473 270 455 255 432 239 421 228 396 210 386 197 360 179 350 169 325 153 314 145 291 128 277 130 253 110 240 119 217 105 196 120 178 115 155 136 143 139 119 158 108 157 82 175 67Z" /></clipPath></defs>
                  <path className="story-map-outline" d="M173 30 204 43 226 37 249 51 275 48 291 65 321 61 333 84 359 91 372 113 396 124 401 151 423 172 415 196 436 215 423 239 434 262 416 282 427 304 412 325 418 349 400 365 399 389 379 404 373 429 349 435 331 455 309 447 289 473 270 455 255 432 239 421 228 396 210 386 197 360 179 350 169 325 153 314 145 291 128 277 130 253 110 240 119 217 105 196 120 178 115 155 136 143 139 119 158 108 157 82 175 67Z" fill="url(#storyIndiaFill)" />
                  <path d="M173 30 204 43 226 37 249 51 275 48 291 65 321 61 333 84 359 91 372 113 396 124 401 151 423 172 415 196 436 215 423 239 434 262 416 282 427 304 412 325 418 349 400 365 399 389 379 404 373 429 349 435 331 455 309 447 289 473 270 455 255 432 239 421 228 396 210 386 197 360 179 350 169 325 153 314 145 291 128 277 130 253 110 240 119 217 105 196 120 178 115 155 136 143 139 119 158 108 157 82 175 67Z" fill="url(#storyIndiaPattern)" />
                  <g clipPath="url(#storyIndiaClip)" className="story-map-lines"><path d="M88 144 445 310M98 210 401 116M132 81 351 433M108 269 390 185M154 38 273 480M126 331 424 241M185 75 414 367M110 185 362 449" /></g>
                  <path className="story-map-route" d="M190 115Q275 151 314 200T339 315Q320 374 294 412" />
                  {[[186,126],[298,186],[348,246],[315,324],[275,408]].map(([x,y], index) => {
                    const theme = mapThemes[index];
                    return <g key={theme} className={`story-map-point story-map-point--${index + 1} ${selectedCategory === theme || hoveredMapTheme === theme ? 'is-active' : ''}`} role="button" tabIndex={0} aria-label={`Explore ${theme} storytelling theme; no stories are pinned`} onPointerEnter={() => setHoveredMapTheme(theme)} onFocus={() => setHoveredMapTheme(theme)} onBlur={() => setHoveredMapTheme('')} onClick={() => setSelectedCategory(selectedCategory === theme ? '' : theme)} onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedCategory(selectedCategory === theme ? '' : theme);
                      }
                    }}><circle cx={x} cy={y} r="10" /><circle cx={x} cy={y} r="3" /><title>{theme} storytelling theme</title></g>;
                  })}
                  <text x="385" y="474" className="story-map-label">A STORY ATLAS</text>
                  <text x="46" y="110" className="story-map-label story-map-label--small">NO LOCATIONS PINNED</text>
                </svg>
                <div className={`story-map-theme-preview ${hoveredMapTheme || selectedCategory ? 'is-visible' : ''}`} aria-live="polite">
                  <span>STORYTELLING THEME</span>
                  <strong>{hoveredMapTheme || selectedCategory || 'Explore a theme'}</strong>
                  <small>No published stories or locations are pinned.</small>
                </div>
                <div className="story-map-compass" aria-hidden="true">N<i /></div>
                <div className="story-map-caption"><span /><span>Open for stories<br />from every perspective</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="story-creation-section" id="story-create">
        <div className="story-container">
          <Reveal>
            <div className="story-creation-card"><div className="story-creation-card__art"><img src={IMAGES.studio5} alt="" loading="lazy" /><span /><div className="story-creation-card__frame"><span>BEGIN<br />ANYWHERE</span><i /><i /><i /><i /></div><span className="story-creation-card__caption">AN INVITATION TO CREATE</span></div><div className="story-creation-card__copy"><span className="story-eyebrow">FOR THE STORIES STILL UNWRITTEN</span><h2>Have a story<br />to tell?</h2><h3>Every story begins somewhere.</h3><p>Create and publish stories that deserve to be experienced.</p><button type="button" className="story-button story-button--dark" onClick={() => setCreationOpen(true)}>Create a Story <ArrowRight size={16} /></button></div><span className="story-creation-card__mark" aria-hidden="true">कथा</span></div>
          </Reveal>
        </div>
      </section>

      <section className="story-archive-section" id="story-archive">
        <div className="story-container">
          <Reveal><div className="story-section-heading"><div><span className="story-eyebrow">A COLLECTION TAKING SHAPE</span><h2>The story archive</h2></div>{stories.length > 0 && <button type="button" className="story-button story-button--soft" onClick={() => setCreationOpen(true)}><Plus size={15} /> Create a Story</button>}</div></Reveal>
          {stories.length ? (
            <div className="story-published-grid">{stories.map((story, index) => {
              const listItem = storyListItem(story);
              const saved = isSaved(listItem.id);
              return <Reveal key={story.id} delay={index * 0.05}><article className="story-published-card">{story.coverUrl ? <img src={story.coverUrl} alt="" /> : <div className="story-published-card__art"><BookOpen size={24} /></div>}<div className="story-published-card__copy"><span>{story.category} · YOUR STORY</span><h3>{story.title}</h3><p>{story.description}</p><details onToggle={(event) => { if (event.currentTarget.open) recordViewed(listItem); }}><summary>Read story <ArrowDown size={13} /></summary><div>{story.content}{story.mediaName && <span className="story-media-chip"><CirclePlay size={14} /> {story.mediaName}</span>}</div></details><button type="button" className={`story-save-button ${saved ? 'is-saved' : ''}`} onClick={() => toggleSave(listItem)} aria-pressed={saved}>{saved ? <><Check size={14} /> Added to My List</> : <><BookmarkPlus size={14} /> + My List</>}</button></div></article></Reveal>;
            })}</div>
          ) : (
            <Reveal delay={0.05}><div className="story-archive-empty"><div className="story-archive-empty__art"><img src={IMAGES.art2} alt="" loading="lazy" /><span /><div><BookOpen size={26} /><i /><i /></div><small>ROOM FOR THE FIRST STORY</small></div><div className="story-archive-empty__copy"><span className="story-eyebrow">AN OPENING CHAPTER</span><h3>The archive is just beginning.</h3><p>New stories will appear here as they are created and published.</p><button type="button" className="story-button story-button--dark" onClick={() => setCreationOpen(true)}>Create a Story <ArrowRight size={15} /></button></div></div></Reveal>
          )}
        </div>
      </section>

      <AnimatePresence>{creationOpen && <StoryCreationModal key="story-create-modal" initialCategory={storyCategories.some((item) => item.title === selectedCategory) ? selectedCategory : storyCategories[0].title} onClose={() => setCreationOpen(false)} onPublish={publishStory} />}</AnimatePresence>
      <AnimatePresence>{notification && <motion.div className="story-toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={16} /><span>{notification}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotification('')}><X size={15} /></button></motion.div>}</AnimatePresence>
    </PageWrapper>
  );
}
