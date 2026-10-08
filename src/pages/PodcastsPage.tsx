import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookmarkPlus,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  FileAudio2,
  Clock3,
  Headphones,
  ImagePlus,
  List,
  Mic2,
  Play,
  Radio,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { IMAGES } from '@/data/content';
import { useMyList } from '@/context/MyListContext';
import { usePodcastLibrary, type PodcastEpisode } from '@/context/PodcastLibraryContext';

const categories = [
  { title: 'Conversations', description: 'Open exchanges and unexpected perspectives.', image: IMAGES.mic2, icon: Users },
  { title: 'Stories', description: 'Narratives made to stay with you.', image: IMAGES.mic3, icon: AudioLines },
  { title: 'Insights', description: 'Ideas that bring a little more into focus.', image: IMAGES.mic5, icon: Sparkles },
  { title: 'Culture & Ideas', description: 'Creative thinking, culture and the world around us.', image: IMAGES.art6, icon: Headphones },
  { title: 'Behind the Scenes', description: 'A closer listen to the process of making.', image: IMAGES.studio3, icon: Clapperboard },
];

const formats = [
  { title: 'Interviews', description: 'One-on-one conversations with room to go deeper.', image: IMAGES.mic4, icon: Mic2 },
  { title: 'Panel Discussions', description: 'Different voices, shared curiosity.', image: IMAGES.mic6, icon: Users },
  { title: 'Narratives', description: 'Audio-led stories told with care and intention.', image: IMAGES.art3, icon: AudioLines },
  { title: 'Short Audio', description: 'A focused thought, made for a shorter listen.', image: IMAGES.mic7, icon: Radio },
];

const durations = ['Any length', 'Under 20 min', '20–45 min', '45+ min'];
const sortOptions = ['Recently added', 'Title A–Z', 'Title Z–A'];
const podcastFormats = ['Interviews', 'Panel Discussions', 'Narratives', 'Short Audio'];
const uploadSteps = ['Upload Audio', 'Podcast Details', 'Cover Art', 'Preview', 'Publish'];

interface PodcastForm {
  podcastTitle: string;
  episodeTitle: string;
  description: string;
  category: string;
  format: string;
  host: string;
  episodeNumber: string;
  seasonNumber: string;
  tags: string;
}

const emptyForm: PodcastForm = {
  podcastTitle: '',
  episodeTitle: '',
  description: '',
  category: categories[0].title,
  format: podcastFormats[0],
  host: '',
  episodeNumber: '',
  seasonNumber: '',
  tags: '',
};

function updateCardMotion(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--podcast-tilt-x', `${-y * 1.5}deg`);
  event.currentTarget.style.setProperty('--podcast-tilt-y', `${x * 1.5}deg`);
  event.currentTarget.style.setProperty('--podcast-pan-x', `${-x * 10}px`);
  event.currentTarget.style.setProperty('--podcast-pan-y', `${-y * 8}px`);
}

function resetCardMotion(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--podcast-tilt-x', '0deg');
  event.currentTarget.style.setProperty('--podcast-tilt-y', '0deg');
  event.currentTarget.style.setProperty('--podcast-pan-x', '0px');
  event.currentTarget.style.setProperty('--podcast-pan-y', '0px');
}

function moveHeroArt(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--podcast-hero-x', `${-x * 9}px`);
  event.currentTarget.style.setProperty('--podcast-hero-y', `${-y * 7}px`);
}

function resetHeroArt(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--podcast-hero-x', '0px');
  event.currentTarget.style.setProperty('--podcast-hero-y', '0px');
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—:—';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AudioPreviewPlayer({ src, playButtonId }: { src: string; playButtonId?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDuration(0);
    setCurrentTime(0);
    setPlaying(false);
    setError('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError('');
    if (audio.paused) {
      void audio.play().catch(() => setError('This audio file could not be played in your browser.'));
    } else {
      audio.pause();
    }
  };

  return (
    <div className="podcast-audio-preview">
      <audio
        id={playButtonId ? `${playButtonId}-audio` : undefined}
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError('Audio preview is unavailable for this file.')}
      />
      <button id={playButtonId} type="button" className="podcast-audio-preview__play" onClick={togglePlayback} aria-label={playing ? 'Pause audio preview' : 'Play audio preview'}>
        {playing ? <span className="podcast-pause-icon" /> : <Play size={16} fill="currentColor" />}
      </button>
      <span className="podcast-audio-preview__time">{formatDuration(currentTime)}</span>
      <input
        className="podcast-audio-preview__seek"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => {
          const nextTime = Number(event.target.value);
          if (audioRef.current) audioRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }}
        aria-label="Audio preview progress"
        disabled={!duration}
      />
      <span className="podcast-audio-preview__time">{formatDuration(duration)}</span>
      <label className="podcast-audio-preview__volume">
        <Volume2 size={16} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => {
            const nextVolume = Number(event.target.value);
            setVolume(nextVolume);
            if (audioRef.current) audioRef.current.volume = nextVolume;
          }}
          aria-label="Audio preview volume"
        />
      </label>
      {error && <span className="podcast-audio-preview__error" role="alert">{error}</span>}
    </div>
  );
}

interface PodcastUploadModalProps {
  onClose: () => void;
  onPublish: (episode: PodcastEpisode) => void;
}

function PodcastUploadModal({ onClose, onPublish }: PodcastUploadModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PodcastForm>(emptyForm);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioStatus, setAudioStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioDuration, setAudioDuration] = useState(0);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [dragTarget, setDragTarget] = useState<'audio' | 'cover' | null>(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const retainedUrls = useRef(false);
  const currentUrls = useRef({ audio: '', cover: '' });
  const onCloseRef = useRef(onClose);
  const publishingRef = useRef(publishing);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  onCloseRef.current = onClose;
  publishingRef.current = publishing;

  useEffect(() => {
    const urls = currentUrls.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !publishingRef.current) onCloseRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (!retainedUrls.current) {
        if (urls.audio) URL.revokeObjectURL(urls.audio);
        if (urls.cover) URL.revokeObjectURL(urls.cover);
      }
    };
  }, []);

  const updateForm = (key: keyof PodcastForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseAudio = (file?: File) => {
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['mp3', 'wav', 'm4a'].includes(extension)) {
      setError('Choose an MP3, WAV or M4A audio file.');
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(file);
    const nextUrl = URL.createObjectURL(file);
    currentUrls.current.audio = nextUrl;
    setAudioUrl(nextUrl);
    setAudioDuration(0);
    setAudioStatus('loading');
    setError('');
  };

  const chooseCover = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your cover art.');
      return;
    }
    if (coverUrl) URL.revokeObjectURL(coverUrl);
    setCoverFile(file);
    const nextUrl = URL.createObjectURL(file);
    currentUrls.current.cover = nextUrl;
    setCoverUrl(nextUrl);
    setError('');
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (type === 'audio') chooseAudio(file);
    else chooseCover(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, type: 'audio' | 'cover') => {
    event.preventDefault();
    setDragTarget(null);
    if (type === 'audio') chooseAudio(event.dataTransfer.files[0]);
    else chooseCover(event.dataTransfer.files[0]);
  };

  const removeAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    currentUrls.current.audio = '';
    setAudioFile(null);
    setAudioUrl('');
    setAudioDuration(0);
    setAudioStatus('idle');
    setError('');
  };

  const removeCover = () => {
    if (coverUrl) URL.revokeObjectURL(coverUrl);
    currentUrls.current.cover = '';
    setCoverFile(null);
    setCoverUrl('');
  };

  const canContinue = () => {
    if (step === 0 && (!audioFile || audioStatus !== 'ready' || !audioDuration)) {
      setError('Add an audio file and wait for it to finish preparing.');
      return false;
    }
    if (step === 1 && (!form.podcastTitle.trim() || !form.episodeTitle.trim())) {
      setError('Add a podcast title and episode title to continue.');
      return false;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (canContinue()) setStep((current) => Math.min(uploadSteps.length - 1, current + 1));
  };

  const publish = async () => {
    if (!canContinue() || !audioFile || !audioUrl) return;
    setPublishing(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 380));
    const episode: PodcastEpisode = {
      id: `podcast-${Date.now()}`,
      podcastTitle: form.podcastTitle.trim(),
      episodeTitle: form.episodeTitle.trim(),
      description: form.description.trim(),
      category: form.category,
      format: form.format,
      host: form.host.trim(),
      episodeNumber: form.episodeNumber ? Number(form.episodeNumber) : null,
      seasonNumber: form.seasonNumber ? Number(form.seasonNumber) : null,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      duration: audioDuration,
      audioUrl,
      coverUrl,
      publishedAt: Date.now(),
    };
    retainedUrls.current = true;
    onPublish(episode);
    setPublishing(false);
    onClose();
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="podcast-upload-audio-step">
          <div
            className={`podcast-dropzone ${dragTarget === 'audio' ? 'is-dragging' : ''} ${audioFile ? 'has-file' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragTarget('audio'); }}
            onDragLeave={() => setDragTarget(null)}
            onDrop={(event) => onDrop(event, 'audio')}
          >
            <input ref={audioInputRef} className="sr-only" type="file" accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a" onChange={(event) => onFileChange(event, 'audio')} />
            {audioFile ? (
              <div className="podcast-selected-file">
                <span className="podcast-upload-file-icon"><AudioLines size={24} /></span>
                <div className="podcast-selected-file__details">
                  <strong title={audioFile.name}>{audioFile.name}</strong>
                  <span>{formatFileSize(audioFile.size)} <i /> {audioStatus === 'ready' ? formatDuration(audioDuration) : 'Preparing preview…'}</span>
                  {audioStatus === 'loading' && <div className="podcast-upload-progress"><span /></div>}
                  {audioStatus === 'error' && <span className="podcast-inline-error">Unable to read audio metadata. Try another file.</span>}
                </div>
                <div className="podcast-file-actions">
                  <button type="button" onClick={() => audioInputRef.current?.click()}>Replace</button>
                  <button type="button" onClick={removeAudio} aria-label="Remove audio file"><Trash2 size={16} /></button>
                </div>
              </div>
            ) : (
              <div className="podcast-dropzone__prompt">
                <span className="podcast-upload-file-icon"><FileAudio2 size={25} /></span>
                <strong>Drop your audio file here</strong>
                <span>MP3, WAV or M4A</span>
                <button type="button" className="podcast-button podcast-button--light" onClick={() => audioInputRef.current?.click()}>
                  <Upload size={15} /> Choose Audio File
                </button>
              </div>
            )}
            {audioUrl && (
              <audio
                className="sr-only"
                src={audioUrl}
                preload="metadata"
                onLoadedMetadata={(event) => {
                  const nextDuration = event.currentTarget.duration;
                  if (Number.isFinite(nextDuration) && nextDuration > 0) {
                    setAudioDuration(nextDuration);
                    setAudioStatus('ready');
                  } else {
                    setAudioStatus('error');
                  }
                }}
                onError={() => setAudioStatus('error')}
              />
            )}
          </div>
          {audioUrl && (
            <div className="podcast-local-note">
              <AudioLines size={16} />
              <span>Audio is being prepared for local preview. Publishing in this demo saves it to this browser session.</span>
            </div>
          )}
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="podcast-form-grid">
          <label className="podcast-field podcast-field--wide">
            <span>Podcast title <i>*</i></span>
            <input value={form.podcastTitle} onChange={(event) => updateForm('podcastTitle', event.target.value)} maxLength={100} placeholder="Name your podcast" />
          </label>
          <label className="podcast-field podcast-field--wide">
            <span>Episode title <i>*</i></span>
            <input value={form.episodeTitle} onChange={(event) => updateForm('episodeTitle', event.target.value)} maxLength={120} placeholder="Give this episode a title" />
          </label>
          <label className="podcast-field podcast-field--wide">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} maxLength={1000} rows={4} placeholder="What will listeners discover?" />
          </label>
          <label className="podcast-field">
            <span>Category</span>
            <select value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
              {categories.map((category) => <option key={category.title}>{category.title}</option>)}
            </select>
          </label>
          <label className="podcast-field">
            <span>Format</span>
            <select value={form.format} onChange={(event) => updateForm('format', event.target.value)}>
              {podcastFormats.map((format) => <option key={format}>{format}</option>)}
            </select>
          </label>
          <label className="podcast-field podcast-field--wide">
            <span>Host / creator</span>
            <input value={form.host} onChange={(event) => updateForm('host', event.target.value)} maxLength={90} placeholder="Add a host or creator name" />
          </label>
          <label className="podcast-field">
            <span>Episode number</span>
            <input type="number" min="1" value={form.episodeNumber} onChange={(event) => updateForm('episodeNumber', event.target.value)} placeholder="Optional" />
          </label>
          <label className="podcast-field">
            <span>Season number</span>
            <input type="number" min="1" value={form.seasonNumber} onChange={(event) => updateForm('seasonNumber', event.target.value)} placeholder="Optional" />
          </label>
          <label className="podcast-field podcast-field--wide">
            <span>Tags <small>Separate with commas</small></span>
            <input value={form.tags} onChange={(event) => updateForm('tags', event.target.value)} placeholder="Add a few useful tags" />
          </label>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="podcast-cover-layout">
          <div
            className={`podcast-cover-drop ${dragTarget === 'cover' ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragTarget('cover'); }}
            onDragLeave={() => setDragTarget(null)}
            onDrop={(event) => onDrop(event, 'cover')}
          >
            <input ref={coverInputRef} className="sr-only" type="file" accept="image/*" onChange={(event) => onFileChange(event, 'cover')} />
            {coverUrl ? (
              <img src={coverUrl} alt="Uploaded podcast cover artwork" />
            ) : (
              <div className="podcast-cover-drop__prompt">
                <ImagePlus size={26} />
                <strong>Drop cover artwork here</strong>
                <span>Square images work best. You can add this later.</span>
              </div>
            )}
            <div className="podcast-cover-drop__actions">
              <button type="button" className="podcast-button podcast-button--light" onClick={() => coverInputRef.current?.click()}>
                <Upload size={14} /> {coverFile ? 'Replace cover' : 'Choose cover'}
              </button>
              {coverFile && <button type="button" className="podcast-cover-remove" onClick={removeCover} aria-label="Remove cover art"><Trash2 size={16} /></button>}
            </div>
          </div>
          <div className="podcast-cover-art-preview">
            <span className="podcast-eyebrow">ARTWORK PREVIEW</span>
            <div className="podcast-cover-card">
              {coverUrl ? <img src={coverUrl} alt="" /> : <div className="podcast-cover-card__placeholder"><AudioLines size={27} /></div>}
              <div>
                <strong>{form.podcastTitle || 'Your podcast title'}</strong>
                <span>{form.episodeTitle || 'Your episode title'}</span>
              </div>
            </div>
            <p>Your cover is used as the episode artwork in the library.</p>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="podcast-preview-layout">
          <article className="podcast-preview-card">
            {coverUrl ? <img className="podcast-preview-card__cover" src={coverUrl} alt="" /> : <div className="podcast-preview-card__cover podcast-cover-card__placeholder"><AudioLines size={28} /></div>}
            <div className="podcast-preview-card__copy">
              <span className="podcast-eyebrow">{form.category} · {formatDuration(audioDuration)}</span>
              <h3>{form.podcastTitle}</h3>
              <h4>{form.episodeTitle}</h4>
              {form.description && <p>{form.description}</p>}
              {form.host && <span className="podcast-preview-card__host">Hosted by {form.host}</span>}
              <button type="button" className="podcast-preview-card__play" onClick={() => document.getElementById('podcast-upload-audio-preview')?.click()}>
                <Play size={14} fill="currentColor" /> Play preview
              </button>
            </div>
          </article>
          <div>
            <span className="podcast-eyebrow">AUDIO PREVIEW</span>
            <AudioPreviewPlayer src={audioUrl} playButtonId="podcast-upload-audio-preview" />
          </div>
        </div>
      );
    }

    return (
      <div className="podcast-publish-review">
        <span className="podcast-publish-review__check"><Check size={23} /></span>
        <span className="podcast-eyebrow">READY TO PUBLISH</span>
        <h3>{form.episodeTitle}</h3>
        <p>{form.podcastTitle} · {form.category} · {formatDuration(audioDuration)}</p>
        <span className="podcast-publish-review__note">This episode will be added to your library for this browser session.</span>
      </div>
    );
  };

  return (
    <motion.div
      className="podcast-upload-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !publishing) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="podcast-upload-title"
        className="podcast-upload-modal"
        initial={{ opacity: 0, y: 22, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="podcast-upload-header">
          <div>
            <span className="podcast-eyebrow">LUMERA STUDIO · PODCASTS</span>
            <h2 id="podcast-upload-title">Create an episode</h2>
          </div>
          <button type="button" className="podcast-upload-close" onClick={onClose} disabled={publishing} aria-label="Close podcast upload">
            <X size={19} />
          </button>
        </header>

        <nav className="podcast-upload-steps" aria-label="Podcast publishing steps">
          {uploadSteps.map((label, index) => (
            <button
              type="button"
              key={label}
              className={`podcast-upload-step ${step === index ? 'is-current' : ''} ${step > index ? 'is-complete' : ''}`}
              onClick={() => {
                if (index < step) setStep(index);
                else if (index === step + 1) nextStep();
              }}
              aria-current={step === index ? 'step' : undefined}
              aria-label={`${String(index + 1).padStart(2, '0')} ${label}`}
            >
              <span>{step > index ? <Check size={13} /> : String(index + 1).padStart(2, '0')}</span>
              <small>{label}</small>
            </button>
          ))}
        </nav>

        <div className="podcast-upload-content">
          <div className="podcast-upload-step-title">
            <span>0{step + 1} / 0{uploadSteps.length}</span>
            <h3>{uploadSteps[step]}</h3>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          {error && <p className="podcast-upload-error" role="alert"><AlertCircle size={15} /> {error}</p>}
        </div>

        <footer className="podcast-upload-footer">
          <button type="button" className="podcast-button podcast-button--light" onClick={() => step > 0 ? setStep((current) => current - 1) : onClose()} disabled={publishing}>
            {step > 0 ? <><ChevronLeft size={15} /> Back</> : 'Cancel'}
          </button>
          <span>Progress saves locally until you publish.</span>
          {step < uploadSteps.length - 1 ? (
            <button type="button" className="podcast-button podcast-button--dark" onClick={nextStep}>
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button type="button" className="podcast-button podcast-button--dark" onClick={() => void publish()} disabled={publishing}>
              {publishing ? <><span className="podcast-button-spinner" /> Publishing</> : <><Upload size={15} /> Publish Podcast</>}
            </button>
          )}
        </footer>
      </motion.section>
    </motion.div>
  );
}

function PodcastEpisodeCard({ episode, onPlay }: { episode: PodcastEpisode; onPlay: () => void }) {
  const { isSaved, toggleSave } = useMyList();
  const listItem = podcastListItem(episode);
  const saved = isSaved(listItem.id);

  return (
    <article className="podcast-episode-card">
      <button type="button" className="podcast-episode-card__cover" onClick={onPlay} aria-label={`Play ${episode.episodeTitle}`}>
        {episode.coverUrl ? <img src={episode.coverUrl} alt="" /> : <span><AudioLines size={26} /></span>}
        <i><Play size={16} fill="currentColor" /></i>
      </button>
      <div className="podcast-episode-card__copy">
        <div className="podcast-episode-card__meta">
          <span>{episode.category}</span><i /> <span>{episode.format}</span>
        </div>
        <h3>{episode.episodeTitle}</h3>
        <p className="podcast-episode-card__show">{episode.podcastTitle}</p>
        {episode.description && <p className="podcast-episode-card__description">{episode.description}</p>}
        <div className="podcast-episode-card__footer">
          <span><Clock3 size={13} /> {formatDuration(episode.duration)}</span>
          {episode.host && <span>Host · {episode.host}</span>}
          <button type="button" className={`podcast-save-action ${saved ? 'is-saved' : ''}`} onClick={() => toggleSave(listItem)} aria-pressed={saved}>
            {saved ? <><Check size={13} /> Added</> : <><BookmarkPlus size={13} /> + My List</>}
          </button>
          <button type="button" onClick={onPlay}>Listen <ArrowRight size={14} /></button>
        </div>
      </div>
    </article>
  );
}

function podcastListItem(episode: PodcastEpisode) {
  return {
    id: `uploaded-podcast-${episode.id}`,
    title: episode.episodeTitle,
    category: episode.category,
    type: 'podcast' as const,
    image: episode.coverUrl || IMAGES.mic3,
    duration: formatDuration(episode.duration),
    description: episode.description || episode.podcastTitle,
    status: 'new' as const,
  };
}

function PodcastPlayerActions({ episode }: { episode: PodcastEpisode }) {
  const { isSaved, toggleSave } = useMyList();
  const listItem = podcastListItem(episode);
  const saved = isSaved(listItem.id);
  const [message, setMessage] = useState('');

  const shareEpisode = async () => {
    setMessage('');
    if (navigator.share) {
      try {
        await navigator.share({ title: episode.episodeTitle, text: episode.podcastTitle, url: window.location.href });
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name !== 'AbortError') {
          setMessage('Sharing is unavailable in this browser.');
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage('Page link copied.');
    } catch {
      setMessage('Could not copy the link. Copy it from your browser address bar.');
    }
  };

  return (
    <>
      <button type="button" className={saved ? 'is-saved' : ''} onClick={() => toggleSave(listItem)} aria-label={saved ? 'Added to My List' : 'Add to My List'} title={saved ? 'Added to My List' : 'Add to My List'} aria-pressed={saved}>
        {saved ? <><Check size={18} /><span className="sr-only">Added</span></> : <BookmarkPlus size={18} />}
      </button>
      <button type="button" onClick={() => void shareEpisode()} aria-label="Share episode" title="Share episode"><ArrowUpRight size={18} /></button>
      {message && <span className="podcast-share-message" role="status">{message}</span>}
    </>
  );
}

function PodcastFullPlayer({ episode }: { episode: PodcastEpisode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode.duration);
  const [volume, setVolume] = useState(0.65);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentTime(0);
    setDuration(episode.duration);
    setPlaying(false);
    setError('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [episode.audioUrl, episode.duration]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, Math.min(audio.duration || duration, audio.currentTime + seconds));
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError('');
    if (audio.paused) {
      void audio.play().catch(() => setError('This audio file could not be played in your browser.'));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : episode.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError('Audio playback is unavailable for this file.')}
      />
      <div className="podcast-player__progress">
        <span>{formatDuration(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const nextTime = Number(event.target.value);
            if (audioRef.current) audioRef.current.currentTime = nextTime;
            setCurrentTime(nextTime);
          }}
          aria-label="Episode progress"
          disabled={!duration}
        />
        <span>{formatDuration(duration)}</span>
      </div>
      <div className="podcast-player__controls">
        <button type="button" className="podcast-player__speed" onClick={() => {
          const speeds = [1, 1.25, 1.5, 2];
          const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
          setSpeed(nextSpeed);
          if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
        }} aria-label={`Playback speed ${speed} times`}>{speed}×</button>
        <button type="button" onClick={() => skip(-15)} aria-label="Back 15 seconds"><SkipBack size={18} /><small>15</small></button>
        <button type="button" className="podcast-player__play" onClick={togglePlayback} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <span className="podcast-pause-icon" /> : <Play size={17} fill="currentColor" />}
        </button>
        <button type="button" onClick={() => skip(15)} aria-label="Forward 15 seconds"><SkipForward size={18} /><small>15</small></button>
        <label className="podcast-player__volume">
          <Volume2 size={17} />
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => {
            const nextVolume = Number(event.target.value);
            setVolume(nextVolume);
            if (audioRef.current) audioRef.current.volume = nextVolume;
          }} aria-label="Episode volume" />
        </label>
      </div>
      {error && <p className="podcast-player__error" role="alert">{error}</p>}
    </>
  );
}

export function PodcastsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { episodes, addEpisode } = usePodcastLibrary();
  const { recordViewed } = useMyList();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFormat, setActiveFormat] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(sortOptions[0]);
  const [duration, setDuration] = useState(durations[0]);
  const [listView, setListView] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const state = location.state as { studioAction?: unknown } | null;
    if (state?.studioAction !== 'studio-upload-podcast') return;
    setShowUpload(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate]);

  const visibleEpisodes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return episodes
      .filter((episode) => activeCategory === 'All' || episode.category === activeCategory)
      .filter((episode) => !activeFormat || episode.format === activeFormat)
      .filter((episode) => !term || [
        episode.podcastTitle,
        episode.episodeTitle,
        episode.description,
        episode.category,
        episode.host,
        ...episode.tags,
      ].some((value) => value.toLowerCase().includes(term)))
      .filter((episode) => {
        if (duration === 'Under 20 min') return episode.duration < 20 * 60;
        if (duration === '20–45 min') return episode.duration >= 20 * 60 && episode.duration <= 45 * 60;
        if (duration === '45+ min') return episode.duration > 45 * 60;
        return true;
      })
      .sort((first, second) => {
        if (sort === 'Title A–Z') return first.episodeTitle.localeCompare(second.episodeTitle);
        if (sort === 'Title Z–A') return second.episodeTitle.localeCompare(first.episodeTitle);
        return second.publishedAt - first.publishedAt;
      });
  }, [activeCategory, activeFormat, duration, episodes, search, sort]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const publishEpisode = (episode: PodcastEpisode) => {
    addEpisode(episode);
    setActiveEpisode(episode);
    setActiveCategory('All');
    setActiveFormat('');
    setSearch('');
    setDuration(durations[0]);
    setNotification('Podcast published successfully.');
  };

  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    setActiveFormat('');
    document.getElementById('podcast-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageWrapper>
      <section className="podcast-hero" onPointerMove={moveHeroArt} onPointerLeave={resetHeroArt}>
        <div className="podcast-hero__art" aria-hidden="true">
          <img src={IMAGES.mic1} alt="" />
        </div>
        <div className="podcast-hero__wash" />
        <div className="podcast-hero__content">
          <Reveal>
            <span className="podcast-kicker"><span /> PODCASTS</span>
            <h1 className="podcast-hero__title">
              Ideas Worth
              <br />
              <em>Listening To</em>
            </h1>
            <p className="podcast-hero__description">
              Conversations, perspectives and stories — coming together in sound.
            </p>
            <div className="podcast-hero__actions">
              <a href="#podcast-library" className="podcast-button podcast-button--dark">
                Explore Podcasts <ArrowRight size={16} />
              </a>
              <a href="#podcast-categories" className="podcast-button podcast-button--light">
                Browse Categories
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="podcast-categories" className="podcast-section podcast-discover">
        <div className="podcast-container">
          <Reveal>
            <div className="podcast-section-heading">
              <div>
                <span className="podcast-eyebrow">DISCOVER BY EXPERIENCE</span>
                <h2>Find something worth hearing.</h2>
              </div>
              <span className="podcast-section-note">A listening space ready for your next discovery.</span>
            </div>
          </Reveal>
          <div className="podcast-category-grid">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Reveal key={category.title} delay={index * 0.055}>
                  <button
                    type="button"
                    className={`podcast-art-card podcast-category-card ${activeCategory === category.title ? 'podcast-art-card--selected' : ''}`}
                    onPointerMove={updateCardMotion}
                    onPointerLeave={resetCardMotion}
                    onClick={() => chooseCategory(activeCategory === category.title ? 'All' : category.title)}
                    aria-pressed={activeCategory === category.title}
                  >
                    <img src={category.image} alt="" loading="lazy" />
                    <span className="podcast-art-card__wash" />
                    <span className="podcast-art-card__icon"><Icon size={17} /></span>
                    <span className="podcast-art-card__copy">
                      <strong>{category.title}</strong>
                      <small>{category.description}</small>
                    </span>
                    <span className="podcast-art-card__arrow"><ArrowUpRight size={18} /></span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="podcast-library" className="podcast-section podcast-library">
        <div className="podcast-container">
          <Reveal>
            <div className="podcast-section-heading podcast-library__heading">
              <div>
                <span className="podcast-eyebrow">PODCAST LIBRARY</span>
                <h2>A listening library, curated by you.</h2>
                <p>Search and browse categories as the collection takes shape.</p>
              </div>
              <div className="podcast-library__actions">
                <span className="podcast-episode-count">{episodes.length} {episodes.length === 1 ? 'Episode' : 'Episodes'}</span>
                <button type="button" className="podcast-button podcast-button--dark" onClick={() => setShowUpload(true)}>
                  <Upload size={15} /> Upload Podcast
                </button>
              </div>
            </div>
          </Reveal>

          <div className="podcast-toolbar">
            <label className="podcast-search">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search podcasts" aria-label="Search podcast episodes" />
            </label>
            <label className="podcast-select">
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort episodes">
                {sortOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <label className="podcast-select podcast-duration-select">
              <Clock3 size={14} />
              <select value={duration} onChange={(event) => setDuration(event.target.value)} aria-label="Filter by duration">
                {durations.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <div className="podcast-view-toggle" aria-label="Episode display">
              <button type="button" className={!listView ? 'is-active' : ''} onClick={() => setListView(false)} aria-label="Grid view"><span className="podcast-grid-icon" /></button>
              <button type="button" className={listView ? 'is-active' : ''} onClick={() => setListView(true)} aria-label="List view"><List size={17} /></button>
            </div>
          </div>

          <div className="podcast-filter-row" aria-label="Podcast categories">
            {['All', ...categories.map((item) => item.title)].map((category) => (
              <button
                key={category}
                type="button"
                className={`podcast-filter-chip ${activeCategory === category ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {visibleEpisodes.length ? (
              <motion.div
                key={`episodes-${listView}`}
                className={`podcast-episode-grid ${listView ? 'is-list' : ''}`}
                initial={{ opacity: 0, y: 9 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {visibleEpisodes.map((episode) => (
                  <PodcastEpisodeCard key={episode.id} episode={episode} onPlay={() => {
                    setActiveEpisode(episode);
                    recordViewed(podcastListItem(episode));
                    document.getElementById('podcast-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }} />
                ))}
              </motion.div>
            ) : episodes.length ? (
              <motion.div key="no-results" className="podcast-library-no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3>No episodes match these filters.</h3>
                <p>Try another search or adjust your category and duration.</p>
                <button type="button" onClick={() => {
                  setSearch('');
                  setActiveCategory('All');
                  setActiveFormat('');
                  setDuration(durations[0]);
                }}>Clear filters</button>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                className="podcast-empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="podcast-empty-art" aria-hidden="true">
                  <span className="podcast-empty-art__disc"><AudioLines size={28} /></span>
                  <span className="podcast-empty-art__wave podcast-empty-art__wave--one" />
                  <span className="podcast-empty-art__wave podcast-empty-art__wave--two" />
                </div>
                <div className="podcast-empty-copy">
                  <span className="podcast-eyebrow">A NEW LISTENING SPACE</span>
                  <h3>Your listening library is ready.</h3>
                  <p>Podcast episodes will appear here when published.</p>
                  <div className="podcast-empty-copy__actions">
                    <a href="#podcast-categories" className="podcast-button podcast-button--dark">
                      Explore Categories <ArrowRight size={15} />
                    </a>
                    <button type="button" className="podcast-button podcast-button--light" onClick={() => setShowUpload(true)}>
                      <Upload size={15} /> Upload Podcast
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="podcast-section podcast-player-section">
        <div className="podcast-container">
          <Reveal>
            <div className="podcast-section-heading">
              <div>
                <span className="podcast-eyebrow">THE LISTENING ROOM</span>
                <h2>Settle into the sound.</h2>
              </div>
            </div>
          </Reveal>
          <div id="podcast-player" className="podcast-player">
            <div className="podcast-player__art" aria-hidden="true">
              {activeEpisode?.coverUrl ? <img src={activeEpisode.coverUrl} alt="" /> : <span><AudioLines size={28} /></span>}
            </div>
            <div className="podcast-player__main">
              <div className="podcast-player__heading">
                <div>
                  <span className="podcast-eyebrow">LUMERA AUDIO</span>
                  <h3>{activeEpisode?.episodeTitle || 'Your next listen will appear here.'}</h3>
                  {activeEpisode && <p className="podcast-player__subtitle">{activeEpisode.podcastTitle} · {activeEpisode.category}</p>}
                </div>
                {activeEpisode && <div className="podcast-player__actions"><PodcastPlayerActions episode={activeEpisode} /></div>}
              </div>
              {activeEpisode ? <PodcastFullPlayer episode={activeEpisode} /> : (
                <>
                  <div className="podcast-player__progress"><span>0:00</span><div><span /></div><span>0:00</span></div>
                  <div className="podcast-player__controls">
                    <button type="button" className="podcast-player__speed" disabled>1×</button>
                    <button type="button" disabled aria-label="Back 15 seconds"><SkipBack size={18} /><small>15</small></button>
                    <button type="button" className="podcast-player__play" disabled aria-label="Play"><Play size={17} fill="currentColor" /></button>
                    <button type="button" disabled aria-label="Forward 15 seconds"><SkipForward size={18} /><small>15</small></button>
                    <label className="podcast-player__volume"><Volume2 size={17} /><input type="range" min="0" max="100" defaultValue="65" disabled aria-label="Volume" /></label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="podcast-section podcast-formats">
        <div className="podcast-container">
          <Reveal>
            <div className="podcast-section-heading">
              <div>
                <span className="podcast-eyebrow">PODCAST FORMATS</span>
                <h2>Many ways to hear a story.</h2>
              </div>
              <span className="podcast-section-note">Explore a format to filter the library.</span>
            </div>
          </Reveal>
          <div className="podcast-format-track no-scrollbar">
            {formats.map((format, index) => {
              const Icon = format.icon;
              const selected = activeFormat === format.title;
              return (
                <Reveal key={format.title} delay={index * 0.06}>
                  <button
                    type="button"
                    className={`podcast-art-card podcast-format-card ${selected ? 'podcast-art-card--selected' : ''}`}
                    onPointerMove={updateCardMotion}
                    onPointerLeave={resetCardMotion}
                    onClick={() => {
                      setActiveFormat(selected ? '' : format.title);
                      setActiveCategory('All');
                      document.getElementById('podcast-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    aria-pressed={selected}
                  >
                    <img src={format.image} alt="" loading="lazy" />
                    <span className="podcast-art-card__wash" />
                    <span className="podcast-art-card__icon"><Icon size={17} /></span>
                    <span className="podcast-art-card__copy">
                      <strong>{format.title}</strong>
                      <small>{format.description}</small>
                    </span>
                    <span className="podcast-art-card__arrow"><ArrowUpRight size={18} /></span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="podcast-studio-section">
        <Reveal>
          <div className="podcast-studio-card">
            <span className="podcast-studio-card__orb" />
            <div className="podcast-studio-card__icon"><Mic2 size={19} /></div>
            <div>
              <span className="podcast-eyebrow">FOR THE MAKERS</span>
              <h2>Have something to say?</h2>
              <p>Create and publish your next podcast through Studio.</p>
            </div>
            <Link to="/studio" className="podcast-button podcast-button--dark">
              Open Studio <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
      <AnimatePresence>
        {showUpload && <PodcastUploadModal key="podcast-upload" onClose={() => setShowUpload(false)} onPublish={publishEpisode} />}
        {notification && (
          <motion.div className="podcast-success-toast" role="status" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Check size={17} /> {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
