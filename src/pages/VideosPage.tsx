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
  MoveUpRight,
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
import { useVideoLibrary, type UploadedVideo } from '@/context/VideoLibraryContext';

const videoTypes = [
  { title: 'Films', description: 'Long-form visual storytelling', icon: Film, image: IMAGES.gradient1 },
  { title: 'Documentaries', description: 'Ideas grounded in real life', icon: Clapperboard, image: IMAGES.landscape6 },
  { title: 'Series', description: 'Stories with room to unfold', icon: Video, image: IMAGES.bokeh3 },
  { title: 'Shorts', description: 'A new perspective, in a moment', icon: Sparkles, image: IMAGES.gradient5 },
  { title: 'Originals', description: 'Made for the Lumera point of view', icon: MoveUpRight, image: IMAGES.bokeh8 },
];

const spotlights = [
  { label: 'A visual study', note: 'Color, light & feeling', image: IMAGES.gradient2 },
  { label: 'Moving quietly', note: 'Form in motion', image: IMAGES.bokeh4 },
  { label: 'Open horizons', note: 'Room to imagine', image: IMAGES.landscape3 },
  { label: 'Soft focus', note: 'An abstract interlude', image: IMAGES.gradient6 },
];

const experiences = [
  { title: 'Inspire', text: 'Ideas and images that open a new door.', image: IMAGES.art2 },
  { title: 'Inform', text: 'A clearer view of subjects that matter.', image: IMAGES.landscape2 },
  { title: 'Move', text: 'Stories that stay with you after the frame.', image: IMAGES.bokeh10 },
  { title: 'Discover', text: 'Follow curiosity beyond the familiar.', image: IMAGES.gradient3 },
];

const comingSoon = [
  { title: 'Original films', note: 'New visual worlds are taking shape.', image: IMAGES.gradient4 },
  { title: 'Documentary voices', note: 'Perspectives worth making space for.', image: IMAGES.landscape1 },
  { title: 'New series', note: 'More room for ideas to unfold.', image: IMAGES.bokeh6 },
];

const categories = ['Films', 'Documentaries', 'Series', 'Shorts', 'Originals'];
const experienceTypes = ['Inspire', 'Inform', 'Move', 'Discover'];
const sortOptions = ['Recently added', 'Title A–Z', 'Title Z–A'];

function updateCardMotion(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--video-tilt-x', `${-y * 1.8}deg`);
  event.currentTarget.style.setProperty('--video-tilt-y', `${x * 1.8}deg`);
  event.currentTarget.style.setProperty('--video-pointer-x', `${(x + 0.5) * 100}%`);
  event.currentTarget.style.setProperty('--video-pointer-y', `${(y + 0.5) * 100}%`);
}

function resetCardMotion(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--video-tilt-x', '0deg');
  event.currentTarget.style.setProperty('--video-tilt-y', '0deg');
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
  const [experience, setExperience] = useState(experienceTypes[0]);
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
                <span>Experience</span>
                <select value={experience} onChange={(event) => setExperience(event.target.value)}>
                  {experienceTypes.map((item) => <option key={item}>{item}</option>)}
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
  const [playing, setPlaying] = useState(false);

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
            <button
              className={`video-player-play ${playing ? 'video-player-play--active' : ''}`}
              onClick={() => setPlaying((current) => !current)}
              aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
              {playing ? <span className="video-player-pause" /> : <Play size={25} fill="currentColor" />}
            </button>
          )}
          {!item.videoUrl && (
            <div className="video-player-controls">
              <button onClick={() => setPlaying((current) => !current)} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <span className="video-player-pause" /> : <Play size={15} fill="currentColor" />}
              </button>
              <div className={`video-player-scrubber ${playing ? 'video-player-scrubber--moving' : ''}`}><span /></div>
              <span>PREVIEW</span>
            </div>
          )}
        </div>
        <div className="video-player-caption">
          <div>
            <span className="video-player-kicker">{item.videoUrl ? 'Your upload' : 'Lumera preview'}</span>
            <h2 className="font-display text-2xl font-semibold text-ink">{item.title}</h2>
            <p>{item.description || 'A visual experience is taking shape. Preview artwork only.'}</p>
          </div>
          {!item.videoUrl && <span className="video-coming-label">Coming soon</span>}
        </div>
      </motion.section>
    </motion.div>
  );
}

export function VideosPage() {
  const { videos } = useVideoLibrary();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const [activeType, setActiveType] = useState('All');
  const [activeExperience, setActiveExperience] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(sortOptions[0]);
  const [status, setStatus] = useState<'Published' | 'Draft' | 'All'>('Published');
  const [listView, setListView] = useState(false);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos
      .filter((video) => status === 'All' || video.status === status)
      .filter((video) => activeType === 'All' || video.category === activeType)
      .filter((video) => activeExperience === 'All' || video.experience === activeExperience)
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
  }, [activeExperience, activeType, search, sort, status, videos]);

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

  return (
    <PageWrapper>
      <section className="video-page-hero">
        <div className="video-page-hero__art" style={{ backgroundImage: `url(${IMAGES.hero2})` }} />
        <div className="video-page-hero__wash" />
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-10 px-6 pb-20 pt-36 md:grid-cols-[1fr_0.9fr] md:px-10 md:pb-24 md:pt-40">
          <Reveal>
            <span className="video-kicker"><span /> The Lumera Moving Image</span>
            <h1 className="mt-5 max-w-2xl font-display text-6xl font-semibold leading-[0.95] tracking-tight-display text-ink sm:text-7xl md:text-8xl">
              A new way
              <br />
              <span className="font-normal italic">to see.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70 md:text-lg">
              A thoughtful home for films, visual ideas and stories still taking shape.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#video-library" className="video-button video-button--primary">
                Browse the library <ArrowRight size={16} />
              </a>
              <button className="video-button video-button--glass" onClick={openUpload}>
                <Plus size={17} /> Upload video
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="md:justify-self-end">
            <button
              className="video-hero-preview"
              onClick={() =>
                setPreview({
                  title: 'An invitation to look closer',
                  description: 'A preview of the visual worlds coming to Lumera.',
                  image: IMAGES.hero3,
                })
              }
            >
              <span className="video-hero-preview__art" style={{ backgroundImage: `url(${IMAGES.hero3})` }} />
              <span className="video-hero-preview__badge"><Sparkles size={13} /> Visual preview</span>
              <span className="video-hero-preview__play"><Play size={22} fill="currentColor" /></span>
              <span className="video-hero-preview__caption">
                <span>See it differently</span>
                <ArrowUpRight size={17} />
              </span>
            </button>
          </Reveal>
        </div>
        <span className="video-hero-index">01 / VISUAL STORIES</span>
      </section>

      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Explore by type</p>
                <h2 className="font-display text-3xl font-semibold tracking-tight-display text-ink md:text-4xl">Choose a point of view.</h2>
              </div>
              <span className="text-xs text-slate-custom">Select a format to filter the library</span>
            </div>
          </Reveal>
          <div className="video-type-grid">
            {videoTypes.map((type, index) => {
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
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Featured / Spotlight</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-5xl">A first look at Lumera.</h2>
                <p className="mt-2 text-sm text-slate-custom">Artwork previews · Experiences in development</p>
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
                  className="video-spotlight-card video-tilt-card"
                  onPointerMove={updateCardMotion}
                  onPointerLeave={resetCardMotion}
                  onClick={() => setPreview({ title: item.label, description: `${item.note}. Artwork preview only; experience coming soon.`, image: item.image })}
                >
                  <span className="video-card-art" style={{ backgroundImage: `url(${item.image})` }} />
                  <span className="video-spotlight-card__tag">Spotlight · 0{index + 1}</span>
                  <span className="video-spotlight-card__copy">
                    <span>{item.note}</span>
                    <strong>{item.label}</strong>
                    <span className="video-spotlight-card__link">Preview <ArrowUpRight size={16} /></span>
                  </span>
                  <span className="video-spotlight-card__play"><Play size={18} fill="currentColor" /></span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Browse by experience</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-5xl">How do you want to feel?</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <button
                  className="video-experience-card video-tilt-card"
                  onPointerMove={updateCardMotion}
                  onPointerLeave={resetCardMotion}
                  onClick={() => {
                    setActiveExperience(activeExperience === item.title ? 'All' : item.title);
                    document.getElementById('video-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span className="video-card-art" style={{ backgroundImage: `url(${item.image})` }} />
                  <span className="video-experience-card__index">0{index + 1}</span>
                  <span className="video-experience-card__copy">
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                  <span className="video-experience-card__arrow"><ArrowUpRight size={18} /></span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="video-coming-section bg-ivory-gradient py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Coming soon</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-5xl">The frame is just beginning.</h2>
              </div>
              <span className="hidden items-center gap-2 text-xs text-slate-custom md:flex"><span className="video-live-dot" /> New visual worlds in progress</span>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {comingSoon.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <button
                  className="video-coming-card video-tilt-card"
                  onPointerMove={updateCardMotion}
                  onPointerLeave={resetCardMotion}
                  onClick={() => setPreview({ title: item.title, description: item.note, image: item.image })}
                >
                  <span className="video-card-art" style={{ backgroundImage: `url(${item.image})` }} />
                  <span className="video-coming-card__badge">Coming soon</span>
                  <span className="video-coming-card__copy">
                    <span>{item.note}</span>
                    <strong>{item.title}</strong>
                    <span className="video-coming-card__arrow"><ArrowUpRight size={18} /></span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="video-upload-banner">
              <div className="video-upload-banner__orb" />
              <div className="relative z-10 max-w-2xl">
                <span className="video-banner-icon"><Upload size={20} /></span>
                <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">For the makers</p>
                <h2 className="font-display text-3xl font-semibold tracking-tight-display text-ink md:text-5xl">Bring your perspective to Lumera.</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-custom md:text-base">Add a video, shape its details, and preview how it will look in your library.</p>
              </div>
              <button className="video-button video-button--primary relative z-10" onClick={openUpload}>
                <Upload size={16} /> Upload video <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="video-library" className="video-library-section bg-ivory-gradient py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Your video library</p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-5xl">Browse at your pace.</h2>
                <p className="mt-2 text-sm text-slate-custom">Published videos from this session appear here.</p>
              </div>
              <button className="video-button video-button--primary self-start lg:self-auto" onClick={openUpload}>
                <Plus size={16} /> Add a video
              </button>
            </div>
          </Reveal>

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
            {experienceTypes.map((item) => (
              <button
                key={item}
                className={`video-status-filter ${activeExperience === item ? 'video-status-filter--active' : ''}`}
                onClick={() => setActiveExperience(activeExperience === item ? 'All' : item)}
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
                  {videos.length ? 'No matching videos' : 'A space for what’s next'}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                  {videos.length ? 'Try another search or filter.' : 'Your library is ready when you are.'}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-custom">
                  {videos.length
                    ? 'Adjust your filters, or add another video to your session library.'
                    : 'Add a video to preview it here. Your uploads stay in this browser session and are not sent to a server.'}
                </p>
                <button className="video-button video-button--primary mt-5" onClick={openUpload}>
                  <Upload size={15} /> Upload a video
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
  return (
    <article className={`video-library-card ${listView ? 'video-library-card--list' : ''}`}>
      <button
        className="video-library-card__media"
        onClick={() => onPreview({
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
            onClick={() => onPreview({
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
      </div>
    </article>
  );
}
