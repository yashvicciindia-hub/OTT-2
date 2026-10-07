import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  FileVideo2,
  Film,
  Grid2X2,
  ImagePlus,
  Info,
  List,
  Play,
  Plus,
  Search,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { IMAGES } from '@/data/content';
import { useMyList } from '@/context/MyListContext';
import { useVideoLibrary, type UploadedVideo } from '@/context/VideoLibraryContext';

const categories = ['Films', 'Series', 'Documentaries', 'Shorts', 'Originals'];
const formatOptions = ['Long-form', 'Episodic', 'Short-form', 'Live'];
const categoryCards = [
  { title: 'Films', description: 'A home for feature-length storytelling.', icon: Film, image: IMAGES.landscape6 },
  { title: 'Series', description: 'Make space for stories across episodes.', icon: Video, image: IMAGES.landscape2 },
  { title: 'Documentaries', description: 'Bring real-world perspectives into focus.', icon: Clapperboard, image: IMAGES.landscape3 },
  { title: 'Shorts', description: 'Share a complete idea in a little time.', icon: Sparkles, image: IMAGES.landscape4 },
  { title: 'Originals', description: 'Build a distinct point of view for Lumera.', icon: ArrowUpRight, image: IMAGES.art2 },
];
const spotlights = [
  { label: 'Long-form', note: 'Feature-length experiences with room to settle in.', image: IMAGES.gradient1 },
  { label: 'Episodic', note: 'Connect chapters into a series viewers can follow.', image: IMAGES.gradient3 },
  { label: 'Short-form', note: 'Focused, concise pieces made to meet the moment.', image: IMAGES.gradient5 },
  { label: 'Live', note: 'Bring audiences together as an experience unfolds.', image: IMAGES.gradient2 },
];
const sortOptions = ['Recently added', 'Title A–Z', 'Title Z–A'];

function updateCardMotion(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--video-tilt-x', `${-y * 1.8}deg`);
  event.currentTarget.style.setProperty('--video-tilt-y', `${x * 1.8}deg`);
  event.currentTarget.style.setProperty('--video-parallax-x', `${-x * 8}px`);
  event.currentTarget.style.setProperty('--video-parallax-y', `${-y * 8}px`);
  event.currentTarget.style.setProperty('--video-pointer-x', `${(x + 0.5) * 100}%`);
  event.currentTarget.style.setProperty('--video-pointer-y', `${(y + 0.5) * 100}%`);
}

function resetCardMotion(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--video-tilt-x', '0deg');
  event.currentTarget.style.setProperty('--video-tilt-y', '0deg');
  event.currentTarget.style.setProperty('--video-parallax-x', '0px');
  event.currentTarget.style.setProperty('--video-parallax-y', '0px');
}

interface PreviewItem {
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
}

interface UploadModalProps {
  onClose: () => void;
}

function UploadModal({ onClose }: UploadModalProps) {
  const { addVideo } = useVideoLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef('');
  const thumbnailUrlRef = useRef('');
  const retainUrls = useRef(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailName, setThumbnailName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [experience, setExperience] = useState(formatOptions[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  useEffect(
    () => () => {
      if (!retainUrls.current) {
        if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
        if (thumbnailUrlRef.current) URL.revokeObjectURL(thumbnailUrlRef.current);
      }
    },
    [],
  );

  const chooseVideo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Choose a video file to continue.');
      return;
    }
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    videoUrlRef.current = nextUrl;
    setVideoFile(file);
    setVideoUrl(nextUrl);
    setError('');
    setConfirmation('');
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
  };

  const onVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseVideo(event.target.files?.[0]);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseVideo(event.dataTransfer.files[0]);
  };

  const onThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for the thumbnail.');
      return;
    }
    if (thumbnailUrlRef.current) URL.revokeObjectURL(thumbnailUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    thumbnailUrlRef.current = nextUrl;
    setThumbnailUrl(nextUrl);
    setThumbnailName(file.name);
    setError('');
  };

  const submit = async (status: UploadedVideo['status'], event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (saving) return;
    if (status === 'Published' && !videoFile) {
      setError('Add a video file before publishing.');
      return;
    }
    if (!title.trim()) {
      setError('Add a title for this video.');
      return;
    }

    setError('');
    setSaving(true);
    setProgress(0);
    await new Promise<void>((resolve) => {
      const timer = window.setInterval(() => {
        setProgress((current) => {
          const next = Math.min(100, current + Math.ceil(Math.random() * 13) + 8);
          if (next >= 100) {
            window.clearInterval(timer);
            resolve();
          }
          return next;
        });
      }, 90);
    });

    const placeholderPoster =
      thumbnailUrl || IMAGES.gradient1;
    const video: UploadedVideo = {
      id: `upload-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      experience,
      videoUrl,
      thumbnailUrl: placeholderPoster,
      tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
      status,
      createdAt: Date.now(),
    };

    if (videoUrl || thumbnailUrl) retainUrls.current = true;
    addVideo(video);
    setSaving(false);
    setConfirmation(status === 'Published' ? 'Published to your video library.' : 'Draft saved for this session.');
    window.setTimeout(onClose, 750);
  };

  return (
    <motion.div
      className="video-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-video-title"
        className="video-upload-modal"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="video-modal-heading">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
              Lumera Studio
            </p>
            <h2 id="upload-video-title" className="font-display text-3xl font-semibold text-ink">
              Add a video
            </h2>
          </div>
          <button type="button" className="video-icon-button" onClick={onClose} disabled={saving} aria-label="Close upload">
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            void submit('Published', event);
          }}
        >
          <div className="video-upload-layout">
            <div className="video-upload-media">
              <div
                className={`video-drop-zone ${dragging ? 'video-drop-zone--active' : ''} ${
                  videoUrl ? 'video-drop-zone--has-video' : ''
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                {videoUrl ? (
                  <video src={videoUrl} className="video-file-preview" controls playsInline />
                ) : (
                  <div className="video-drop-prompt">
                    <span className="video-upload-icon"><Upload size={22} /></span>
                    <strong>Drop a video here</strong>
                    <span>or choose a file from your device</span>
                    <button type="button" className="video-browse-button" onClick={() => fileInputRef.current?.click()}>
                      Browse files
                    </button>
                    <small>Video files only · Preview stays on this device</small>
                  </div>
                )}
                {videoUrl && (
                  <button
                    type="button"
                    className="video-replace-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace video
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="video/*"
                onChange={onVideoChange}
              />

              <div className="video-thumbnail-row">
                {thumbnailUrl ? (
                  <img className="video-thumbnail-preview" src={thumbnailUrl} alt="Selected thumbnail preview" />
                ) : (
                  <span className="video-thumbnail-placeholder"><ImagePlus size={19} /></span>
                )}
                <div className="min-w-0 flex-1">
                  <strong>Thumbnail</strong>
                  <span>{thumbnailName || 'Optional · use abstract artwork if omitted'}</span>
                </div>
                <button type="button" className="video-choose-thumbnail" onClick={() => thumbnailInputRef.current?.click()}>
                  Choose
                </button>
                <input
                  ref={thumbnailInputRef}
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={onThumbnailChange}
                />
              </div>
            </div>

            <div className="video-upload-fields">
              <label className="video-field">
                <span>Title <i>*</i></span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} placeholder="Give your video a title" />
              </label>
              <label className="video-field">
                <span>Description</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={500} placeholder="What would you like people to know?" />
              </label>
              <label className="video-field">
                <span>Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="video-field">
                <span>Format</span>
                <select value={experience} onChange={(event) => setExperience(event.target.value)}>
                  {formatOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="video-field">
                <span>Tags <small>Separate with commas</small></span>
                <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="cinematic, nature, short" />
              </label>
              <div className="video-upload-note">
                <Info size={15} />
                <span>Files are previewed locally; publishing adds this video to your current session library.</span>
              </div>
            </div>
          </div>

          {error && <p className="video-form-message video-form-message--error" role="alert">{error}</p>}
          {confirmation && <p className="video-form-message video-form-message--success"><Check size={15} />{confirmation}</p>}
          {saving && (
            <div className="video-progress" role="status" aria-label={`Saving video ${progress}%`}>
              <div className="video-progress__label"><span>Preparing your video</span><span>{progress}%</span></div>
              <div className="video-progress__track"><span style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          <div className="video-modal-footer">
            <span className="video-status-hint">Save a draft to finish later, or publish to your library.</span>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="video-button video-button--quiet"
                disabled={saving}
                onClick={() => void submit('Draft')}
              >
                Save draft
              </button>
              <button type="submit" className="video-button video-button--primary" disabled={saving}>
                <Upload size={15} /> Publish
              </button>
            </div>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}

function VideoPreviewModal({ item, onClose }: { item: PreviewItem; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="video-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} preview`}
        className="video-player-modal"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
      >
        <button className="video-player-close" onClick={onClose} aria-label="Close preview"><X size={20} /></button>
        <div className="video-player-screen" style={{ backgroundImage: `url(${item.image})` }}>
          {item.videoUrl ? (
            <video src={item.videoUrl} className="video-player-native" controls autoPlay playsInline />
          ) : (
            <span className="video-artwork-preview-label">Thumbnail artwork · no video file attached</span>
          )}
        </div>
        <div className="video-player-caption">
          <div>
            <span className="video-player-kicker">Your upload</span>
            <h2 className="font-display text-2xl font-semibold text-ink">{item.title}</h2>
            <p>{item.description || (item.videoUrl ? 'No description added.' : 'This draft contains thumbnail artwork only. Add a video file to preview playback.')}</p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export function VideosPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videos } = useVideoLibrary();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const [activeType, setActiveType] = useState('All');
  const [activeFormat, setActiveFormat] = useState('All');
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(sortOptions[0]);
  const [status, setStatus] = useState<'Published' | 'Draft' | 'All'>('All');
  const [listView, setListView] = useState(false);

  useEffect(() => {
    const state = location.state as { studioAction?: unknown } | null;
    if (state?.studioAction !== 'studio-upload-video') return;
    setShowUpload(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate]);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos
      .filter((video) => status === 'All' || video.status === status)
      .filter((video) => activeType === 'All' || video.category === activeType)
      .filter((video) => activeFormat === 'All' || video.experience === activeFormat)
      .filter((video) =>
        !term ||
        video.title.toLowerCase().includes(term) ||
        video.description.toLowerCase().includes(term) ||
        video.tags.some((tag) => tag.toLowerCase().includes(term)),
      )
      .sort((first, second) => {
        if (sort === 'Title A–Z') return first.title.localeCompare(second.title);
        if (sort === 'Title Z–A') return second.title.localeCompare(first.title);
        return second.createdAt - first.createdAt;
      });
  }, [activeFormat, activeType, search, sort, status, videos]);

  const scrollSpotlight = (direction: -1 | 1) => {
    spotlightRef.current?.scrollBy({
      left: direction * (spotlightRef.current.clientWidth * 0.72),
      behavior: 'smooth',
    });
  };

  const selectType = (type: string) => {
    setActiveType(type === activeType ? 'All' : type);
    document.getElementById('video-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openUpload = () => setShowUpload(true);
  const moveHeroArt = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch' || !heroArtRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroArtRef.current.style.setProperty('--hero-parallax-x', `${-x * 10}px`);
    heroArtRef.current.style.setProperty('--hero-parallax-y', `${-y * 8}px`);
  };
  const resetHeroArt = () => {
    heroArtRef.current?.style.setProperty('--hero-parallax-x', '0px');
    heroArtRef.current?.style.setProperty('--hero-parallax-y', '0px');
  };

  return (
    <PageWrapper>
      <section className="video-page-hero" onPointerMove={moveHeroArt} onPointerLeave={resetHeroArt}>
        <div
          ref={heroArtRef}
          className="video-page-hero__art"
          aria-hidden="true"
        >
          <img src={IMAGES.studio2} alt="" />
        </div>
        <div className="video-page-hero__wash" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-36 md:px-10 md:pb-28 md:pt-40">
          <Reveal>
            <span className="video-kicker">VIDEO COLLECTION</span>
            <h1 className="video-hero-title mt-5 max-w-3xl font-display text-6xl font-semibold leading-[0.95] tracking-tight-display text-ink sm:text-7xl md:text-8xl">
              Stories in
              <br className="sm:hidden" /> Motion
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">
              Explore cinematic experiences, visual stories and moments made to be watched.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#video-library" className="video-button video-button--primary">
                Explore Videos <ArrowRight size={16} />
              </a>
              <a href="#video-categories" className="video-button video-button--glass">
                Browse Categories
              </a>
            </div>
          </Reveal>
        </div>
        <span className="video-hero-index">LUMERA / VIDEO COLLECTION</span>
      </section>

      <section id="video-categories" className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Browse by experience</p>
                <h2 className="font-display text-3xl font-semibold tracking-tight-display text-ink md:text-4xl">A format for every story.</h2>
              </div>
              <span className="text-xs text-slate-custom">Explore platform categories and filter the library</span>
            </div>
          </Reveal>
          <div className="video-type-grid">
            {categoryCards.map((type, index) => {
              const Icon = type.icon;
              const selected = activeType === type.title;
              return (
                <Reveal key={type.title} delay={index * 0.05}>
                  <button
                    className={`video-type-card video-tilt-card ${selected ? 'video-type-card--active' : ''}`}
                    onPointerMove={updateCardMotion}
                    onPointerLeave={resetCardMotion}
                    onClick={() => selectType(type.title)}
                  >
                    <span className="video-card-art" style={{ backgroundImage: `url(${type.image})` }} />
                    <span className="video-type-card__icon"><Icon size={17} /></span>
                    <span className="video-type-card__copy">
                      <strong>{type.title}</strong>
                      <small>{type.description}</small>
                    </span>
                    <ArrowUpRight className="video-type-card__arrow" size={17} />
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="video-spotlight-section bg-ivory-gradient py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Video formats</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-5xl">Shape the way it moves.</h2>
                <p className="mt-2 text-sm text-slate-custom">Choose a format to explore its place in your library.</p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button className="video-round-control" onClick={() => scrollSpotlight(-1)} aria-label="Previous spotlight"><ChevronLeft size={19} /></button>
                <button className="video-round-control" onClick={() => scrollSpotlight(1)} aria-label="Next spotlight"><ChevronRight size={19} /></button>
              </div>
            </div>
          </Reveal>
          <div ref={spotlightRef} className="video-spotlight-track no-scrollbar">
            {spotlights.map((item, index) => (
              <Reveal key={item.label} delay={index * 0.05}>
                <button
                  className={`video-spotlight-card video-tilt-card ${expandedFormat === item.label ? 'video-spotlight-card--selected' : ''}`}
                  onPointerMove={updateCardMotion}
                  onPointerLeave={resetCardMotion}
                  onClick={() => {
                    setExpandedFormat(expandedFormat === item.label ? null : item.label);
                    setActiveFormat(activeFormat === item.label ? 'All' : item.label);
                    document.getElementById('video-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span className="video-card-art" style={{ backgroundImage: `url(${item.image})` }} />
                  <span className="video-spotlight-card__tag">FORMAT · 0{index + 1}</span>
                  <span className="video-spotlight-card__copy">
                    <span>{item.note}</span>
                    <strong>{item.label}</strong>
                    <span className="video-spotlight-card__link">{expandedFormat === item.label ? 'Selected' : 'Explore format'} <ArrowUpRight size={16} /></span>
                  </span>
                  <span className="video-spotlight-card__play"><ArrowUpRight size={18} /></span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="video-library" className="video-library-section bg-ivory-gradient py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Your video library</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-5xl">A home for your videos.</h2>
                <p className="mt-2 text-sm text-slate-custom">Search, sort, and organize your uploaded collection.</p>
              </div>
              <button className="video-button video-button--primary self-start lg:self-auto" onClick={openUpload}>
                <Plus size={16} /> Upload Video
              </button>
            </div>
          </Reveal>

          <div className="video-library-count">{filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}</div>
          <div className="video-library-toolbar">
            <div className="video-search">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, descriptions or tags" aria-label="Search video library" />
              {search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
            </div>
            <label className="video-select">
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort videos">
                {sortOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <div className="video-view-toggle" aria-label="Library layout">
              <button className={!listView ? 'video-view-toggle__active' : ''} onClick={() => setListView(false)} aria-label="Grid view"><Grid2X2 size={17} /></button>
              <button className={listView ? 'video-view-toggle__active' : ''} onClick={() => setListView(true)} aria-label="List view"><List size={17} /></button>
            </div>
          </div>

          <div className="video-library-filters">
            {['All', ...categories].map((filter) => (
              <button
                key={filter}
                className={`video-filter-chip ${activeType === filter ? 'video-filter-chip--active' : ''}`}
                onClick={() => setActiveType(filter)}
              >
                {filter}
                {activeType === filter && <span />}
              </button>
            ))}
            <span className="video-filter-divider" />
            {(['Published', 'Draft', 'All'] as const).map((item) => (
              <button
                key={item}
                className={`video-status-filter ${status === item ? 'video-status-filter--active' : ''}`}
                onClick={() => setStatus(item)}
              >
                {item}
              </button>
            ))}
            <span className="video-filter-divider" />
            {formatOptions.map((item) => (
              <button
                key={item}
                className={`video-status-filter ${activeFormat === item ? 'video-status-filter--active' : ''}`}
                onClick={() => setActiveFormat(activeFormat === item ? 'All' : item)}
              >
                {item}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {filteredVideos.length ? (
              <motion.div
                key={`${status}-${activeType}-${sort}-${listView ? 'list' : 'grid'}`}
                className={`video-library-grid ${listView ? 'video-library-grid--list' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {filteredVideos.map((video) => (
                  <VideoLibraryCard key={video.id} video={video} listView={listView} onPreview={setPreview} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="video-library-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="video-empty-icon"><FileVideo2 size={23} /></span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
                  {videos.length ? 'No matching videos' : 'Ready when you are'}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                  {videos.length ? 'Try another search or filter.' : 'Your video library is ready.'}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-custom">
                  {videos.length
                    ? 'Adjust your filters, or add another video to your session library.'
                    : 'Upload your first video to begin building your collection.'}
                </p>
                <button className="video-button video-button--primary mt-5" onClick={openUpload}>
                  <Upload size={15} /> Upload Video
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {showUpload && <UploadModal key="upload" onClose={() => setShowUpload(false)} />}
        {preview && <VideoPreviewModal key="preview" item={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </PageWrapper>
  );
}

function VideoLibraryCard({
  video,
  listView,
  onPreview,
}: {
  video: UploadedVideo;
  listView: boolean;
  onPreview: (item: PreviewItem) => void;
}) {
  const { isSaved, recordViewed, toggleSave } = useMyList();
  const listItem = {
    id: `uploaded-video-${video.id}`,
    title: video.title,
    category: video.category,
    type: 'video' as const,
    image: video.thumbnailUrl || IMAGES.landscape6,
    description: video.description,
    status: 'new' as const,
  };
  const saved = isSaved(listItem.id);
  const openPreview = (item: PreviewItem) => {
    recordViewed(listItem);
    onPreview(item);
  };

  return (
    <article className={`video-library-card ${listView ? 'video-library-card--list' : ''}`}>
      <button
        className="video-library-card__media"
        onClick={() => openPreview({
          title: video.title,
          description: video.description,
          image: video.thumbnailUrl,
          videoUrl: video.videoUrl,
        })}
        aria-label={`Preview ${video.title}`}
      >
        {video.videoUrl ? (
          <video src={video.videoUrl} poster={video.thumbnailUrl} muted playsInline preload="metadata" />
        ) : (
          <span className="video-card-art" style={{ backgroundImage: `url(${video.thumbnailUrl})` }} />
        )}
        <span className="video-library-card__play"><Play size={17} fill="currentColor" /></span>
        <span className={`video-library-status ${video.status === 'Published' ? 'video-library-status--published' : ''}`}>
          {video.status}
        </span>
      </button>
      <div className="video-library-card__details">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-dark">{video.category}</p>
            <h3 className="mt-1 truncate font-display text-xl font-semibold text-ink">{video.title}</h3>
          </div>
          <button
            className="video-library-card__open"
              onClick={() => openPreview({
              title: video.title,
              description: video.description,
              image: video.thumbnailUrl,
              videoUrl: video.videoUrl,
            })}
            aria-label={`Open ${video.title}`}
          >
            <ArrowUpRight size={17} />
          </button>
        </div>
        {video.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-custom">{video.description}</p>}
        {video.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{video.tags.map((tag) => <span className="video-tag" key={tag}>{tag}</span>)}</div>}
        <button type="button" className={`video-library-save ${saved ? 'is-saved' : ''}`} onClick={() => toggleSave(listItem)} aria-pressed={saved}>
          {saved ? <><Check size={14} /> Added</> : <><Plus size={14} /> + My List</>}
        </button>
      </div>
    </article>
  );
}
