import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Camera,
  Calendar,
  Check,
  ChevronDown,
  Clapperboard,
  Circle,
  Download,
  Expand,
  Eye,
  Headphones,
  ImagePlus,
  MessageCircle,
  Mic,
  MicOff,
  MonitorPlay,
  Pause,
  Play,
  Radio,
  Send,
  Share2,
  Smile,
  Sparkles,
  Square,
  Users,
  Video,
  VideoOff,
  Volume2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { IMAGES } from '@/data/content';

const experienceCategories = [
  { title: 'Conversations', description: 'Interviews, discussions and live conversations.', image: IMAGES.studio1, icon: MessageCircle },
  { title: 'Performances', description: 'Music, theatre, cultural and creative performances.', image: IMAGES.concert3, icon: Sparkles },
  { title: 'Events', description: 'Conferences, gatherings and special occasions.', image: IMAGES.studio3, icon: Users },
  { title: 'Live Podcasts', description: 'Real-time podcast conversations and recordings.', image: IMAGES.mic2, icon: AudioLines },
  { title: 'Special Broadcasts', description: 'One-time broadcasts and important moments.', image: IMAGES.studio4, icon: Radio },
];

type Visibility = 'Public' | 'Unlisted' | 'Private';

interface BroadcastDraft {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  coverUrl: string;
  visibility: Visibility;
}

const LIVE_SCHEDULE_STORAGE_KEY = 'lumera-scheduled-broadcasts';

function readScheduledBroadcasts(): BroadcastDraft[] {
  try {
    const value = window.sessionStorage.getItem(LIVE_SCHEDULE_STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error('Broadcast schedule data must be an array.');
    return parsed.filter((item): item is BroadcastDraft => (
      typeof item === 'object'
      && item !== null
      && 'id' in item && typeof item.id === 'string'
      && 'title' in item && typeof item.title === 'string'
      && 'description' in item && typeof item.description === 'string'
      && 'date' in item && typeof item.date === 'string'
      && 'time' in item && typeof item.time === 'string'
      && 'duration' in item && typeof item.duration === 'string'
      && 'category' in item && typeof item.category === 'string'
      && 'coverUrl' in item && typeof item.coverUrl === 'string'
      && 'visibility' in item && ['Public', 'Unlisted', 'Private'].includes(item.visibility)
    )).map((item) => item.coverUrl.startsWith('blob:') ? { ...item, coverUrl: '' } : item);
  } catch (error) {
    console.error('Could not read scheduled broadcasts from this browser session.', error);
    return [];
  }
}

interface DeviceOption {
  deviceId: string;
  label: string;
}

function moveHeroArt(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--live-parallax-x', `${x * -10}px`);
  event.currentTarget.style.setProperty('--live-parallax-y', `${y * -8}px`);
}

function resetHeroArt(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--live-parallax-x', '0px');
  event.currentTarget.style.setProperty('--live-parallax-y', '0px');
}

function ScheduleModal({
  initialCategory,
  onClose,
  onSchedule,
}: {
  initialCategory: string;
  onClose: () => void;
  onSchedule: (broadcast: BroadcastDraft) => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const coverUrlRef = useRef('');
  const keepCover = useRef(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60 minutes');
  const [category, setCategory] = useState(initialCategory);
  const [visibility, setVisibility] = useState<Visibility>('Public');
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not([type="file"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLInputElement>('input:not([type="file"])')?.focus();
    });
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (!keepCover.current && coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    };
  }, [onClose]);

  const chooseCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for the broadcast cover.');
      return;
    }
    if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    coverUrlRef.current = nextUrl;
    setCoverUrl(nextUrl);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !date || !time) {
      setError('Add a title, date and start time to schedule your broadcast.');
      return;
    }
    if (new Date(`${date}T${time}`).getTime() <= Date.now()) {
      setError('Choose a future date and start time.');
      return;
    }
    keepCover.current = Boolean(coverUrl);
    onSchedule({
      id: `broadcast-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      duration,
      category,
      coverUrl,
      visibility,
    });
  };

  const today = new Date();
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <motion.div
      className="live-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        ref={dialogRef}
        className="live-schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-schedule-title"
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="live-modal-header">
          <div>
            <span className="live-eyebrow">LUMERA LIVE · PLANNING</span>
            <h2 id="live-schedule-title">Schedule a broadcast</h2>
            <p>Set the details for your next live moment.</p>
          </div>
          <button type="button" className="live-icon-button" onClick={onClose} aria-label="Close schedule form"><X size={19} /></button>
        </header>
        <form className="live-schedule-form" onSubmit={submit}>
          <label className="live-form-field live-form-field--wide">
            <span>Broadcast title <i>*</i></span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="Name your broadcast" required />
          </label>
          <label className="live-form-field live-form-field--wide">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={500} placeholder="What will your audience experience?" />
          </label>
          <label className="live-form-field">
            <span>Date <i>*</i></span>
            <input type="date" value={date} min={minimumDate} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <label className="live-form-field">
            <span>Start time <i>*</i></span>
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          </label>
          <label className="live-form-field">
            <span>Duration</span>
            <span className="live-select-wrap">
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                {['30 minutes', '60 minutes', '90 minutes', '2 hours', '3 hours'].map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown size={15} />
            </span>
          </label>
          <label className="live-form-field">
            <span>Category</span>
            <span className="live-select-wrap">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {experienceCategories.map((item) => <option key={item.title}>{item.title}</option>)}
              </select>
              <ChevronDown size={15} />
            </span>
          </label>
          <div className="live-form-field live-form-field--wide">
            <span>Cover image <small>Optional</small></span>
            <input ref={coverInput} className="sr-only" type="file" accept="image/*" onChange={chooseCover} />
            {coverUrl ? (
              <div className="live-cover-selected">
                <img src={coverUrl} alt="Selected broadcast cover" />
                <span>Cover image selected</span>
                <button type="button" onClick={() => coverInput.current?.click()}>Replace</button>
                <button type="button" aria-label="Remove cover image" onClick={() => {
                  URL.revokeObjectURL(coverUrl);
                  coverUrlRef.current = '';
                  setCoverUrl('');
                }}><X size={15} /></button>
              </div>
            ) : (
              <button type="button" className="live-cover-picker" onClick={() => coverInput.current?.click()}>
                <ImagePlus size={18} /> Add a cover image
              </button>
            )}
          </div>
          <fieldset className="live-form-field live-form-field--wide live-visibility-field">
            <legend>Audience visibility</legend>
            <div className="live-visibility-options">
              {(['Public', 'Unlisted', 'Private'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={visibility === option ? 'is-selected' : ''}
                  onClick={() => setVisibility(option)}
                  aria-pressed={visibility === option}
                >
                  <span>{option === 'Public' ? <Users size={15} /> : option === 'Unlisted' ? <Eye size={15} /> : <Check size={15} />}</span>
                  <strong>{option}</strong>
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="live-form-error" role="alert">{error}</p>}
          <footer className="live-form-footer">
            <span>Your schedule stays on this page for this visit. Live publishing is not connected yet.</span>
            <button type="submit" className="live-button live-button--dark">Schedule Broadcast <ArrowRight size={16} /></button>
          </footer>
        </form>
      </motion.section>
    </motion.div>
  );
}

export function LivePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [scheduled, setScheduled] = useState<BroadcastDraft[]>(readScheduledBroadcasts);
  const [studioControls, setStudioControls] = useState({ camera: true, microphone: true, captions: false, chat: true });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [studioStarting, setStudioStarting] = useState(false);
  const [studioError, setStudioError] = useState('');
  const [videoDevices, setVideoDevices] = useState<DeviceOption[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceOption[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState('');
  const [audioDeviceId, setAudioDeviceId] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingClip, setRecordingClip] = useState<{ url: string; filename: string } | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewVolume, setPreviewVolume] = useState(0.72);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [notification, setNotification] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const studioVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const recordingUrlRef = useRef('');
  const coverUrls = useRef<string[]>([]);

  useEffect(() => {
    const state = location.state as { studioAction?: unknown } | null;
    if (state?.studioAction === 'studio-schedule-live') {
      setScheduleOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    } else if (state?.studioAction === 'studio-open-live-studio') {
      window.setTimeout(() => document.getElementById('live-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.key, location.pathname, location.state, navigate]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(LIVE_SCHEDULE_STORAGE_KEY, JSON.stringify(scheduled.map((item) => ({ ...item, coverUrl: '' }))));
    } catch (error) {
      console.error('Could not save the broadcast schedule in this browser session.', error);
    }
  }, [scheduled]);

  useEffect(() => {
    if (studioVideoRef.current) studioVideoRef.current.srcObject = mediaStream;
  }, [mediaStream]);

  useEffect(() => () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.ondataavailable = null;
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    coverUrls.current.forEach((url) => URL.revokeObjectURL(url));
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(''), 3800);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const scheduleBroadcast = (broadcast: BroadcastDraft) => {
    if (broadcast.coverUrl) coverUrls.current.push(broadcast.coverUrl);
    setScheduled((current) => [broadcast, ...current]);
    setSelectedCategory(broadcast.category);
    setScheduleOpen(false);
    setNotification('Broadcast scheduled.');
  };

  const removeBroadcast = (broadcast: BroadcastDraft) => {
    setScheduled((current) => current.filter((item) => item.id !== broadcast.id));
    if (broadcast.coverUrl) {
      URL.revokeObjectURL(broadcast.coverUrl);
      coverUrls.current = coverUrls.current.filter((url) => url !== broadcast.coverUrl);
    }
    setNotification('Scheduled broadcast removed.');
  };

  const openSchedule = () => setScheduleOpen(true);

  const startStudio = async () => {
    if (mediaStreamRef.current || studioStarting) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStudioError('Camera access requires a supported browser on HTTPS or localhost.');
      return;
    }
    setStudioStarting(true);
    setStudioError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      });
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput').map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      }));
      const microphones = devices.filter((device) => device.kind === 'audioinput').map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Microphone ${index + 1}`,
      }));
      setVideoDevices(cameras);
      setAudioDevices(microphones);
      setVideoDeviceId(stream.getVideoTracks()[0]?.getSettings().deviceId || '');
      setAudioDeviceId(stream.getAudioTracks()[0]?.getSettings().deviceId || '');
      setStudioControls((current) => ({
        ...current,
        camera: stream.getVideoTracks().some((track) => track.enabled),
        microphone: stream.getAudioTracks().some((track) => track.enabled),
      }));
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          setStudioControls((current) => ({ ...current, camera: false }));
        });
      });
      stream.getAudioTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          setStudioControls((current) => ({ ...current, microphone: false }));
        });
      });
    } catch (error) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setMediaStream(null);
      }
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setStudioError('Camera and microphone access was denied. Allow access in your browser settings and try again.');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setStudioError('No camera or microphone was found. Connect a device and try again.');
      } else if (error instanceof DOMException && error.name === 'NotReadableError') {
        setStudioError('Your camera or microphone is already in use by another app.');
      } else {
        setStudioError(error instanceof Error ? error.message : 'Unable to start the local studio.');
      }
    } finally {
      setStudioStarting(false);
    }
  };

  const stopStudio = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setMediaStream(null);
    setStudioControls((current) => ({ ...current, camera: false, microphone: false }));
  };

  const toggleStudioDevice = (key: 'camera' | 'microphone') => {
    const trackType = key === 'camera' ? 'video' : 'audio';
    const track = mediaStreamRef.current?.getTracks().find((item) => item.kind === trackType);
    if (!track) {
      setStudioError(`Start the local studio before changing ${key === 'camera' ? 'camera' : 'microphone'} settings.`);
      return;
    }
    track.enabled = !track.enabled;
    setStudioControls((current) => ({ ...current, [key]: track.enabled }));
    setStudioError('');
  };

  const refreshDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(devices.filter((device) => device.kind === 'videoinput').map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      })));
      setAudioDevices(devices.filter((device) => device.kind === 'audioinput').map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Microphone ${index + 1}`,
      })));
    } catch {
      setStudioError('Unable to list available camera and microphone devices.');
    }
  };

  const changeDevice = async (kind: 'video' | 'audio', deviceId: string) => {
    if (!mediaStreamRef.current) {
      if (kind === 'video') setVideoDeviceId(deviceId);
      else setAudioDeviceId(deviceId);
      return;
    }
    setStudioError('');
    try {
      const replacement = await navigator.mediaDevices.getUserMedia({
        video: kind === 'video' ? { deviceId: { exact: deviceId } } : false,
        audio: kind === 'audio' ? { deviceId: { exact: deviceId } } : false,
      });
      const nextTrack = kind === 'video' ? replacement.getVideoTracks()[0] : replacement.getAudioTracks()[0];
      if (!nextTrack) throw new Error(`The selected ${kind === 'video' ? 'camera' : 'microphone'} is unavailable.`);
      const currentStream = mediaStreamRef.current;
      const previousTrack = kind === 'video' ? currentStream.getVideoTracks()[0] : currentStream.getAudioTracks()[0];
      if (previousTrack) {
        currentStream.removeTrack(previousTrack);
        previousTrack.stop();
      }
      nextTrack.enabled = kind === 'video' ? studioControls.camera : studioControls.microphone;
      currentStream.addTrack(nextTrack);
      if (kind === 'video') setVideoDeviceId(deviceId);
      else setAudioDeviceId(deviceId);
      nextTrack.addEventListener('ended', () => {
        setStudioControls((current) => ({ ...current, [kind === 'video' ? 'camera' : 'microphone']: false }));
      });
      setMediaStream(new MediaStream(currentStream.getTracks()));
      replacement.getTracks().filter((track) => track !== nextTrack).forEach((track) => track.stop());
    } catch (error) {
      setStudioError(error instanceof Error ? error.message : 'Unable to switch the selected device.');
    }
  };

  const startRecording = () => {
    const stream = mediaStreamRef.current;
    if (!stream) {
      setStudioError('Start the local studio before recording.');
      return;
    }
    if (!window.MediaRecorder) {
      setStudioError('Local recording is not supported in this browser.');
      return;
    }
    try {
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recordingChunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunks.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunks.current, { type: recorder.mimeType || 'video/webm' });
        recordingChunks.current = [];
        if (!blob.size) {
          setStudioError('The recording was empty. Check your camera and microphone permissions and try again.');
          setRecording(false);
          return;
        }
        if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
        const url = URL.createObjectURL(blob);
        recordingUrlRef.current = url;
        setRecordingClip({ url, filename: `lumera-live-${new Date().toISOString().replace(/[:.]/g, '-')}.webm` });
        setRecording(false);
      };
      recorder.onerror = () => {
        setStudioError('Recording stopped because the browser reported a media error.');
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
      setStudioError('');
      setNotification('Local recording started. Nothing is being streamed.');
    } catch (error) {
      setStudioError(error instanceof Error ? error.message : 'Unable to start local recording.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const sharePreview = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Lumera Live Experience Preview', url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setNotification('Preview link copied.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setNotification('Sharing is unavailable. Copy the page link from your browser.');
    }
  };

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await previewRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setNotification('Fullscreen is unavailable in this browser.');
    }
  };

  return (
    <PageWrapper>
      <section className="live-hero" onPointerMove={moveHeroArt} onPointerLeave={resetHeroArt}>
        <div className="live-hero__art"><img src={IMAGES.studio3} alt="" /></div>
        <div className="live-hero__wash" />
        <div className="live-hero__grain" aria-hidden="true" />
        <div className="live-container live-hero__inner">
          <Reveal>
            <div className="live-hero__copy">
              <span className="live-kicker"><i /> LIVE BROADCASTING</span>
              <h1>Live, when the{' '}<br /><em>moment</em> happens.</h1>
              <p>Experience conversations, performances and special broadcasts as they unfold.</p>
              <div className="live-hero__actions">
                <a href="#live-now" className="live-button live-button--dark">Explore Live <ArrowRight size={16} /></a>
                <button type="button" className="live-button live-button--light" onClick={openSchedule}>Schedule a Live <Calendar size={16} /></button>
              </div>
            </div>
          </Reveal>
          <div className="live-hero__side-note" aria-hidden="true"><span>IN THE MOMENT</span><i /></div>
          <a className="live-hero__scroll" href="#live-now" aria-label="Scroll to Live Now"><ArrowDown size={17} /><span>SCROLL TO EXPLORE</span></a>
        </div>
        <div className="live-hero__signal" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="live-section live-now-section" id="live-now">
        <div className="live-container">
          <Reveal>
            <div className="live-section-heading">
              <div><span className="live-eyebrow">IN THE MOMENT</span><h2>Live Now</h2></div>
              <span className="live-now-count"><i /> No active broadcasts</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="live-empty-panel">
              <div className="live-empty-panel__visual">
                <img src={IMAGES.studio5} alt="" loading="lazy" />
                <div className="live-empty-panel__shade" />
                <div className="live-radar" aria-hidden="true"><span /><span /><span /><i /></div>
                <div className="live-empty-panel__camera"><Camera size={34} strokeWidth={1.2} /><span>ON AIR<br />READY</span></div>
                <div className="live-live-badge"><i /> LIVE</div>
                <span className="live-empty-panel__visual-caption">A STAGE FOR WHAT’S NEXT</span>
              </div>
              <div className="live-empty-panel__copy">
                <span className="live-empty-panel__number">01 <i /> LIVE STATUS</span>
                <h3>Nothing is live{' '}<br />right now.</h3>
                <p>Live broadcasts will appear here when they begin. Your next moment is ready to be planned.</p>
                <button type="button" className="live-text-link" onClick={openSchedule}>Schedule a Live <ArrowRight size={16} /></button>
                <div className="live-empty-panel__foot"><span><i /> Broadcast status</span><strong>No active broadcasts</strong></div>
              </div>
              <span className="live-empty-panel__decor" aria-hidden="true">LIVE<br />ON</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="live-section live-schedule-section" id="live-schedule">
        <div className="live-container">
          <Reveal>
            <div className="live-section-heading live-schedule-heading">
              <div><span className="live-eyebrow">MADE FOR YOUR MOMENT</span><h2>Your Live Schedule</h2><p>Plan your next broadcast, on your terms.</p></div>
              <button type="button" className="live-button live-button--dark" onClick={openSchedule}><Calendar size={16} /> Schedule Broadcast</button>
            </div>
          </Reveal>
          {scheduled.length ? (
            <div className="live-schedule-list">
              {scheduled.map((broadcast, index) => (
                <Reveal key={broadcast.id} delay={index * 0.05}>
                  <article className="live-scheduled-card">
                    {broadcast.coverUrl ? <img src={broadcast.coverUrl} alt="" /> : <div className="live-scheduled-card__art"><Radio size={25} /></div>}
                    <div className="live-scheduled-card__date"><strong>{new Date(`${broadcast.date}T00:00:00`).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{new Date(`${broadcast.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span></div>
                    <div className="live-scheduled-card__copy"><span>{broadcast.category} · {broadcast.visibility}</span><h3>{broadcast.title}</h3><p>{broadcast.description || 'Broadcast details can be added in your Studio.'}</p></div>
                    <div className="live-scheduled-card__time"><strong>{broadcast.time}</strong><span>{broadcast.duration}</span></div>
                    <button type="button" className="live-icon-button" aria-label={`Remove ${broadcast.title} from schedule`} onClick={() => removeBroadcast(broadcast)}><X size={17} /></button>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={0.05}>
              <div className="live-schedule-empty">
                <div className="live-schedule-empty__art"><div className="live-orbit live-orbit--one" /><div className="live-orbit live-orbit--two" /><Calendar size={28} /><span>YOUR NEXT<br />MOMENT</span></div>
                <div><span className="live-eyebrow">A SPACE ON THE CALENDAR</span><h3>Your next broadcast will appear here.</h3><p>Schedule an event whenever you're ready to go live.</p></div>
                <button type="button" className="live-button live-button--light" onClick={openSchedule}>Schedule Broadcast <ArrowRight size={15} /></button>
              </div>
            </Reveal>
          )}
          {selectedCategory && (
            <div className="live-schedule-filter-note" role="status">
              <span>Planning for <strong>{selectedCategory}</strong></span>
              <button type="button" onClick={() => setSelectedCategory('')}>Clear category <X size={14} /></button>
            </div>
          )}
        </div>
      </section>

      <section className="live-section live-experiences-section" id="live-experiences">
        <div className="live-container">
          <Reveal>
            <div className="live-section-heading"><div><span className="live-eyebrow">A PLACE FOR EVERY KIND OF MOMENT</span><h2>Find Your Live Experience</h2></div><span className="live-section-aside">Explore the ways to bring people together.</span></div>
          </Reveal>
          <div className="live-experience-grid">
            {experienceCategories.map((item, index) => {
              const Icon = item.icon;
              const selected = selectedCategory === item.title;
              return (
                <Reveal key={item.title} delay={index * 0.055}>
                  <button type="button" className={`live-experience-card ${index === 0 ? 'live-experience-card--wide' : ''} ${selected ? 'is-selected' : ''}`} onClick={() => {
                    setSelectedCategory(selected ? '' : item.title);
                    document.getElementById('live-schedule')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }} aria-pressed={selected}>
                    <img src={item.image} alt="" loading="lazy" />
                    <span className="live-experience-card__wash" />
                    <span className="live-experience-card__ornament" aria-hidden="true" />
                    <span className="live-experience-card__icon"><Icon size={17} /></span>
                    <span className="live-experience-card__copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                    <span className="live-experience-card__arrow"><ArrowUpRight size={19} /></span>
                    <span className="live-experience-card__index">0{index + 1}</span>
                  </button>
                </Reveal>
              );
            })}
          </div>
          {selectedCategory && (
            <div className="live-selected-category" aria-live="polite">
              <span><Check size={15} /> {selectedCategory} selected</span>
              <button type="button" onClick={openSchedule}>Schedule this experience <ArrowRight size={15} /></button>
            </div>
          )}
        </div>
      </section>

      <section className="live-section live-studio-section" id="live-studio">
        <div className="live-container">
          <Reveal>
            <div className="live-section-heading"><div><span className="live-eyebrow">PREPARE · CONNECT · GO LIVE</span><h2>Your Broadcast Studio</h2><p>Everything you need to prepare, schedule and manage a live experience.</p></div><span className={`live-studio-status ${mediaStream ? 'is-connected' : ''}`}><i /> {mediaStream ? 'Devices connected · Local only' : studioStarting ? 'Connecting devices…' : 'Studio ready'}</span></div>
          </Reveal>
          <Reveal delay={0.07}>
            <div className="live-studio-dashboard">
              <div className="live-studio-dashboard__main">
                <div className="live-studio-dashboard__top"><span><MonitorPlay size={17} /> BROADCAST CONTROL ROOM</span><span className={`live-preview-chip ${mediaStream ? 'is-connected' : ''}`}><i /> {mediaStream ? 'CAMERA PREVIEW' : 'LOCAL STUDIO'}</span></div>
                <div className={`live-studio-preview ${mediaStream && studioControls.camera ? 'has-camera' : ''} ${mediaStream && !studioControls.camera ? 'is-camera-off' : ''}`}>
                  <video ref={studioVideoRef} autoPlay playsInline muted aria-label="Your local camera preview" />
                  {!mediaStream && <img src={IMAGES.studio1} alt="" loading="lazy" />}
                  <div className="live-studio-preview__wash" />
                  <div className="live-studio-preview__message" aria-live="polite">
                    {mediaStream ? (studioControls.camera ? <Video size={28} /> : <VideoOff size={28} />) : <Camera size={28} />}
                    <strong>{mediaStream ? (studioControls.camera ? 'Camera preview active' : 'Camera is off') : studioStarting ? 'Waiting for device access…' : 'Start your local studio'}</strong>
                    <span>{mediaStream ? `${mediaStream.getVideoTracks().length ? 'Camera connected' : 'No camera track'} · ${mediaStream.getAudioTracks().length ? 'Microphone connected' : 'No microphone track'} · Not streamed` : 'Your camera and microphone stay in this browser'}</span>
                  </div>
                  <span className="live-studio-preview__safe">{mediaStream ? 'LOCAL PREVIEW · NOT STREAMING' : 'DEVICE PREVIEW'}</span>
                  {recording && <span className="live-recording-indicator"><i /> RECORDING LOCALLY</span>}
                </div>
                <div className="live-studio-controls">
                  <StudioControl icon={studioControls.camera ? Camera : VideoOff} label="Camera" active={studioControls.camera} disabled={!mediaStream?.getVideoTracks().length} onClick={() => toggleStudioDevice('camera')} />
                  <StudioControl icon={studioControls.microphone ? Mic : MicOff} label="Microphone" active={studioControls.microphone} disabled={!mediaStream?.getAudioTracks().length} onClick={() => toggleStudioDevice('microphone')} />
                  <StudioControl icon={MessageCircle} label="Chat panel" active={studioControls.chat} onClick={() => setStudioControls((current) => ({ ...current, chat: !current.chat }))} />
                  <StudioControl icon={AudioLines} label="Captions" active={studioControls.captions} onClick={() => setStudioControls((current) => ({ ...current, captions: !current.captions }))} />
                </div>
                {(videoDevices.length > 1 || audioDevices.length > 1) && (
                  <div className="live-device-selectors">
                    {videoDevices.length > 1 && <label><Camera size={14} /><span>Camera</span><select value={videoDeviceId} disabled={recording} onChange={(event) => void changeDevice('video', event.target.value)}>{videoDevices.map((device, index) => <option key={device.deviceId || index} value={device.deviceId}>{device.label}</option>)}</select><ChevronDown size={13} /></label>}
                    {audioDevices.length > 1 && <label><Mic size={14} /><span>Microphone</span><select value={audioDeviceId} disabled={recording} onChange={(event) => void changeDevice('audio', event.target.value)}>{audioDevices.map((device, index) => <option key={device.deviceId || index} value={device.deviceId}>{device.label}</option>)}</select><ChevronDown size={13} /></label>}
                  </div>
                )}
                {studioError && <p className="live-studio-error" role="alert">{studioError}</p>}
                <div className="live-studio-dashboard__notice"><span><i /> Studio status</span><strong>{recording ? 'Recording locally' : mediaStream ? 'Local camera and microphone preview' : 'Devices not connected'}</strong><small>Remote live streaming requires a broadcast service and is not enabled here.</small></div>
              </div>
              <aside className="live-studio-dashboard__side">
                <div className="live-studio-side-heading"><span>DEVICE STATUS</span><button type="button" onClick={() => void refreshDevices()} aria-label="Refresh camera and microphone list"><MonitorPlay size={14} /></button></div>
                <div className="live-studio-side-item"><span><Camera size={16} /></span><div><strong>Camera</strong><small>{mediaStream ? studioControls.camera ? videoDevices.find((device) => device.deviceId === videoDeviceId)?.label || 'Camera connected' : 'Camera paused' : 'Not connected'}</small></div><i className={mediaStream && studioControls.camera ? 'is-on' : ''} /></div>
                <div className="live-studio-side-item"><span><Headphones size={16} /></span><div><strong>Microphone</strong><small>{mediaStream ? studioControls.microphone ? audioDevices.find((device) => device.deviceId === audioDeviceId)?.label || 'Microphone connected' : 'Muted' : 'Not connected'}</small></div><i className={mediaStream && studioControls.microphone ? 'is-on' : ''} /></div>
                <div className="live-studio-side-item"><span><Users size={16} /></span><div><strong>Audience</strong><small>{mediaStream ? 'No remote audience · Local preview' : 'Audience joins a real broadcast'}</small></div><b>—</b></div>
                <div className="live-studio-side-item"><span><MessageCircle size={16} /></span><div><strong>Chat</strong><small>{studioControls.chat ? 'Ready for a broadcast' : 'Chat preview paused'}</small></div><i className={studioControls.chat ? 'is-on' : ''} /></div>
                <div className="live-studio-side-item"><span><AudioLines size={16} /></span><div><strong>Captions</strong><small>{studioControls.captions ? 'Preview enabled' : 'Not enabled'}</small></div><i className={studioControls.captions ? 'is-on' : ''} /></div>
                <div className="live-studio-actions">
                  {!mediaStream ? (
                    <button type="button" className="live-button live-button--dark" onClick={() => void startStudio()} disabled={studioStarting}><Camera size={16} /> {studioStarting ? 'Connecting…' : 'Connect Camera & Mic'}</button>
                  ) : (
                    <button type="button" className="live-button live-button--light" onClick={stopStudio}><X size={15} /> End Local Studio</button>
                  )}
                  {!recording ? (
                    <button type="button" className="live-button live-button--record" onClick={startRecording} disabled={!mediaStream}><Circle size={13} fill="currentColor" /> Record Locally</button>
                  ) : (
                    <button type="button" className="live-button live-button--record is-recording" onClick={stopRecording}><Square size={13} fill="currentColor" /> Stop Recording</button>
                  )}
                  {recordingClip && <a className="live-recording-download" href={recordingClip.url} download={recordingClip.filename}><Download size={15} /> Download recording</a>}
                  <button type="button" className="live-button live-button--light" onClick={openSchedule}>Schedule Broadcast <ArrowRight size={15} /></button>
                </div>
              </aside>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="live-section live-preview-section" id="live-preview">
        <div className="live-container">
          <Reveal>
            <div className="live-section-heading"><div><span className="live-eyebrow">A LOOK INSIDE THE EXPERIENCE</span><h2>Live Experience Preview</h2><p>A product interface preview — not a real broadcast.</p></div><span className="live-preview-label"><i /> INTERFACE PREVIEW</span></div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="live-preview-layout">
              <div className="live-player-shell">
                <div className={`live-player-visual ${previewPlaying ? 'is-playing' : ''}`} ref={previewRef}>
                  <img src={IMAGES.concert6} alt="" loading="lazy" />
                  <div className="live-player-visual__wash" />
                  <div className="live-player-visual__grain" />
                  <div className="live-player-top"><span className="live-live-badge"><i /> LIVE</span><span>PRODUCT PREVIEW</span></div>
                  <div className="live-player-center">
                    <span className="live-player-center__icon"><Radio size={28} /></span>
                    <strong>{previewPlaying ? 'Preview in motion' : 'Your live moment, here'}</strong>
                    <small>This is an interface preview. No video is playing.</small>
                  </div>
                  <div className="live-player-controls">
                    <div className="live-player-controls__top"><button type="button" onClick={() => setPreviewPlaying((value) => !value)} aria-label={previewPlaying ? 'Pause preview animation' : 'Play preview animation'}>{previewPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}</button><span className="live-player-control-note">{previewPlaying ? 'Preview motion on' : 'Interface preview'}</span><span className="live-player-spacer" /><button type="button" className={captionsEnabled ? 'is-active' : ''} onClick={() => setCaptionsEnabled((value) => !value)} aria-label={captionsEnabled ? 'Turn captions preview off' : 'Turn captions preview on'}>CC</button><label className="live-player-volume"><Volume2 size={16} /><input type="range" min="0" max="1" step="0.01" value={previewVolume} onChange={(event) => setPreviewVolume(Number(event.target.value))} aria-label="Preview volume" /></label><button type="button" onClick={() => void sharePreview()} aria-label="Share preview"><Share2 size={16} /></button><button type="button" onClick={() => void enterFullscreen()} aria-label="Toggle fullscreen preview"><Expand size={16} /></button></div>
                    <div className="live-player-controls__bottom"><span className="live-player-progress"><i /></span><span>PREVIEW</span></div>
                  </div>
                  {captionsEnabled && <div className="live-player-caption">Caption preview · words will appear during a real broadcast</div>}
                </div>
                <div className="live-player-footer"><span><Clapperboard size={15} /> A window for the next live experience</span><span>Broadcast video appears when live</span></div>
              </div>
              <aside className="live-chat-panel">
                <div className="live-chat-panel__header"><div><MessageCircle size={17} /><h3>Live Conversation</h3></div><span><i /> AUDIENCE + CHAT</span></div>
                <div className="live-chat-panel__body">
                  <div className="live-chat-orbit"><MessageCircle size={22} /><span /><span /></div>
                  <strong>Chat will appear when a broadcast begins.</strong>
                  <p>When you go live, your audience can join the conversation here.</p>
                </div>
                <div className="live-chat-panel__tools"><button type="button" disabled aria-label="Reactions unavailable in preview"><Smile size={16} /></button><input disabled placeholder="Messages open during a broadcast" aria-label="Preview message field" /><button type="button" disabled aria-label="Sending unavailable in preview"><Send size={16} /></button></div>
                <span className="live-chat-panel__foot">Chat controls are shown for product preview only.</span>
              </aside>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="live-section live-archive-section">
        <div className="live-container">
          <Reveal>
            <div className="live-archive-card">
              <div className="live-archive-card__art"><img src={IMAGES.studio6} alt="" loading="lazy" /><span /><div><Radio size={23} /><i /></div><small>AFTER THE MOMENT</small></div>
              <div className="live-archive-card__copy"><span className="live-eyebrow">THE MOMENTS THAT STAY</span><h2>Live Archive</h2><h3>Your live archive starts here.</h3><p>Completed broadcasts can appear here after they are published.</p><Link to="/videos" className="live-button live-button--dark">Explore Videos <ArrowRight size={16} /></Link></div>
              <span className="live-archive-card__ornament" aria-hidden="true">L</span>
            </div>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {scheduleOpen && <ScheduleModal key="schedule-modal" initialCategory={selectedCategory || experienceCategories[0].title} onClose={() => setScheduleOpen(false)} onSchedule={scheduleBroadcast} />}
      </AnimatePresence>
      <AnimatePresence>
        {notification && <motion.div className="live-toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={16} /><span>{notification}</span><button type="button" onClick={() => setNotification('')} aria-label="Dismiss notification"><X size={15} /></button></motion.div>}
      </AnimatePresence>
    </PageWrapper>
  );
}

function StudioControl({
  icon: Icon,
  label,
  active,
  disabled = false,
  onClick,
}: {
  icon: typeof Camera;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`live-studio-control ${active ? 'is-active' : ''}`} onClick={onClick} aria-pressed={active} disabled={disabled}>
      <Icon size={17} /><span>{label}</span><i />
    </button>
  );
}
