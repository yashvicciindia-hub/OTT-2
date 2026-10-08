import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Headphones,
  Play,
  Radio,
  Sparkles,
  Waves,
} from 'lucide-react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { PageWrapper } from '@/components/PageWrapper';
import { Reveal } from '@/components/Reveal';
import { IMAGES } from '@/data/content';

const HOME_ARTWORK = {
  spotlightStories: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=85',
  spotlightOriginals: 'https://images.unsplash.com/photo-1574712255236-ce5bf8395083?auto=format&fit=crop&w=1600&q=85',
  spotlightLive: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85',
  experienceWatch: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=85',
  experiencePodcasts: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=85',
  experienceLive: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85',
  experienceStories: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=1200&q=85',
  experienceOriginals: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=85',
  editorialFeature: 'https://images.unsplash.com/photo-1628015893843-5f7f6f6ccb01?auto=format&fit=crop&w=1600&q=85',
  editorialListening: 'https://images.unsplash.com/photo-1581547848545-a75a2634ba23?auto=format&fit=crop&w=1200&q=85',
  editorialFieldNotes: 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?auto=format&fit=crop&w=1200&q=85',
  editorialJournal: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=85',
  editorialLumera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
  upcomingFilms: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=85',
  upcomingPodcasts: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85',
  upcomingLive: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85',
  upcomingStories: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
};

const spotlightCards = [
  {
    title: 'Stories',
    subtitle: 'Featured editorial experiences',
    image: HOME_ARTWORK.spotlightStories,
    path: '/stories',
    action: 'Explore stories',
    className: 'spotlight-card--stories',
  },
  {
    title: 'Originals',
    subtitle: 'Coming soon',
    image: HOME_ARTWORK.spotlightOriginals,
    path: '/videos',
    action: 'Discover originals',
    className: 'spotlight-card--originals',
  },
  {
    title: 'Live Experiences',
    subtitle: 'Coming soon',
    image: HOME_ARTWORK.spotlightLive,
    path: '/live',
    action: 'Explore live',
    className: 'spotlight-card--live',
  },
];

const exploreCards = [
  {
    title: 'Watch',
    description: 'A considered home for visual stories, films and fresh perspectives.',
    image: HOME_ARTWORK.experienceWatch,
    path: '/videos',
    icon: Play,
  },
  {
    title: 'Podcasts',
    description: 'Thoughtful voices, ideas and conversations to take with you.',
    image: HOME_ARTWORK.experiencePodcasts,
    path: '/podcasts',
    icon: Headphones,
  },
  {
    title: 'Live',
    description: 'Be part of shared moments as they unfold, wherever you are.',
    image: HOME_ARTWORK.experienceLive,
    path: '/live',
    icon: Radio,
  },
  {
    title: 'Stories',
    description: 'Editorial discoveries shaped by a point of view and a sense of place.',
    image: HOME_ARTWORK.experienceStories,
    path: '/stories',
    icon: Compass,
  },
  {
    title: 'Originals',
    description: 'New ideas and original experiences are taking shape at Lumera.',
    image: HOME_ARTWORK.experienceOriginals,
    path: '/videos',
    icon: Sparkles,
  },
];

const experiencePanels = [
  {
    title: 'WATCH',
    description: 'Find a fresh perspective in every frame.',
    image: IMAGES.bokeh2,
    path: '/videos',
  },
  {
    title: 'LISTEN',
    description: 'Make room for voices worth spending time with.',
    image: IMAGES.mic3,
    path: '/podcasts',
  },
  {
    title: 'LIVE',
    description: 'Meet in the moment. Feel something together.',
    image: IMAGES.concert5,
    path: '/live',
  },
  {
    title: 'DISCOVER',
    description: 'Follow your curiosity somewhere unexpected.',
    image: IMAGES.landscape3,
    path: '/stories',
  },
];

const editorialCards = [
  {
    title: 'Color in a quieter key',
    category: 'Visual notes',
    description: 'A study of soft palettes, shifting light and the moods they leave behind.',
    image: HOME_ARTWORK.editorialFeature,
    path: '/stories',
    className: 'editorial-card--feature',
  },
  {
    title: 'The space between sounds',
    category: 'Listening room',
    description: 'On pauses, textures and the details that bring a soundscape to life.',
    image: HOME_ARTWORK.editorialListening,
    path: '/podcasts',
    className: '',
  },
  {
    title: 'A study in movement',
    category: 'Field notes',
    description: 'Light and motion, seen from a different angle.',
    image: HOME_ARTWORK.editorialFieldNotes,
    path: '/stories',
    className: '',
  },
  {
    title: 'Light, collected',
    category: 'Image journal',
    description: 'An open-ended collection of color, form and fleeting impressions.',
    image: HOME_ARTWORK.editorialJournal,
    path: '/videos',
    className: '',
  },
  {
    title: 'An open invitation',
    category: 'At Lumera',
    description: 'A place to find a new perspective, at your own pace.',
    image: HOME_ARTWORK.editorialLumera,
    path: '/studio',
    className: '',
  },
];

const upcomingExperiences = [
  { title: 'Original Films', image: HOME_ARTWORK.upcomingFilms, path: '/videos' },
  { title: 'New Podcasts', image: HOME_ARTWORK.upcomingPodcasts, path: '/podcasts' },
  { title: 'Live Experiences', image: HOME_ARTWORK.upcomingLive, path: '/live' },
  { title: 'Exclusive Stories', image: HOME_ARTWORK.upcomingStories, path: '/stories' },
];

function applyCardTilt(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--tilt-x', `${-y * 2.5}deg`);
  event.currentTarget.style.setProperty('--tilt-y', `${x * 2.5}deg`);
  event.currentTarget.style.setProperty('--pointer-x', `${(x + 0.5) * 100}%`);
  event.currentTarget.style.setProperty('--pointer-y', `${(y + 0.5) * 100}%`);
}

function resetCardTilt(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
}

function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travelDistance, setTravelDistance] = useState(0);
  const [activePanel, setActivePanel] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const trackX = useTransform(scrollYProgress, (progress) => -travelDistance * progress);

  useEffect(() => {
    const measureTrack = () => {
      if (trackRef.current && stageRef.current) {
        setTravelDistance(
          Math.max(0, trackRef.current.scrollWidth - stageRef.current.clientWidth),
        );
      }
    };

    measureTrack();
    window.addEventListener('resize', measureTrack);
    return () => window.removeEventListener('resize', measureTrack);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setActivePanel(Math.min(experiencePanels.length - 1, Math.floor(progress * experiencePanels.length)));
  });

  return (
    <section
      ref={sectionRef}
      className="experience-story bg-[#f6f3ed]"
      aria-label="The Lumera Experience"
    >
      <div ref={stageRef} className="experience-story__stage">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 md:px-10">
          <div className="mb-7 flex items-end justify-between gap-6 md:mb-9">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                The Lumera Experience
              </p>
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight-display text-ink md:text-5xl">
                One place. Many ways in.
              </h2>
            </div>
            <span className="hidden items-center gap-2 pb-2 text-xs text-slate-custom sm:flex">
              <ArrowDown size={14} className="rotate-[-90deg]" />
              Scroll to explore
            </span>
          </div>

          <div className="experience-story__viewport">
            <motion.div ref={trackRef} style={{ x: trackX }} className="experience-story__track">
              {experiencePanels.map((panel, index) => (
                <Link
                  key={panel.title}
                  to={panel.path}
                  onMouseEnter={() => setActivePanel(index)}
                  onFocus={() => setActivePanel(index)}
                  className={`experience-panel ${
                    activePanel === index ? 'experience-panel--active' : ''
                  }`}
                  style={{ backgroundImage: `url(${panel.image})` }}
                >
                  <span className="experience-panel__index">0{index + 1}</span>
                  <div className="experience-panel__content">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/75">
                      Lumera, your way
                    </p>
                    <h3 className="font-display text-4xl font-semibold tracking-tight-display text-white sm:text-5xl md:text-7xl">
                      {panel.title}
                    </h3>
                    <p
                      className={`experience-panel__description ${
                        activePanel === index ? 'experience-panel__description--visible' : ''
                      }`}
                    >
                      {panel.description}
                    </p>
                    <span className="experience-panel__arrow" aria-hidden="true">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>

          <div className="mt-6 flex items-center gap-2" aria-label={`Panel ${activePanel + 1} of 4`}>
            {experiencePanels.map((panel, index) => (
              <span
                key={panel.title}
                className={`experience-progress ${
                  activePanel === index ? 'experience-progress--active' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroSceneY = useTransform(heroScrollProgress, [0, 1], [0, reduceMotion ? 0 : 32]);
  const heroSceneScale = useTransform(heroScrollProgress, [0, 1], [1, reduceMotion ? 1 : 1.04]);
  const heroSceneOpacity = useTransform(heroScrollProgress, [0, 1], [1, reduceMotion ? 1 : 0.88]);

  const moveHeroScene = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--home-pointer-x', `${-x * 12}px`);
    event.currentTarget.style.setProperty('--home-pointer-y', `${-y * 9}px`);
  };

  const resetHeroScene = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--home-pointer-x', '0px');
    event.currentTarget.style.setProperty('--home-pointer-y', '0px');
  };

  return (
    <PageWrapper>
      <section
        ref={heroRef}
        onPointerMove={moveHeroScene}
        onPointerLeave={resetHeroScene}
        className="home-hero relative flex min-h-[690px] items-center overflow-hidden md:min-h-[780px]"
      >
        <motion.div
          className="home-hero__art"
          style={{ y: heroSceneY, scale: heroSceneScale, opacity: heroSceneOpacity }}
          aria-hidden="true"
        >
          <img
            className="home-hero__image"
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=90"
            alt=""
          />
        </motion.div>
        <div className="home-hero__wash" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-12 pt-32 md:px-10 md:pt-36">
          <Reveal>
            <div className="home-hero__copy max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/75 shadow-soft backdrop-blur-md">
                <Sparkles size={13} className="text-gold-dark" />
                A world of stories
              </div>
              <h1 className="max-w-3xl font-display text-6xl font-semibold leading-[0.94] tracking-tight-display text-ink sm:text-7xl md:text-8xl">
                Find your next
                <br />
                <span className="font-normal italic">point of view.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
                Films, voices, live moments and ideas — thoughtfully brought together in one
                bright new world.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/videos" className="home-magnetic-cta">
                  <Play size={16} fill="currentColor" />
                  Explore Lumera
                  <ArrowRight size={16} className="home-cta-arrow" />
                </Link>
                <Link to="/stories" className="home-secondary-cta">
                  Discover stories
                  <ArrowUpRight size={16} className="home-cta-arrow" />
                </Link>
              </div>
            </div>
          </Reveal>
          <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-ink/45 md:flex">
            <span>Curiosity looks good on you</span>
            <span className="h-px w-12 bg-ink/25" />
          </div>
        </div>
      </section>

      <section className="bg-ivory-gradient py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-10 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Lumera Spotlight
                </p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-6xl">
                  Discover What&apos;s Next
                </h2>
                <p className="mt-3 text-base text-slate-custom md:text-lg">
                  A glimpse into the experiences coming to Lumera.
                </p>
              </div>
              <Link to="/stories" className="home-text-link">
                Find your next story <ArrowRight size={16} className="home-cta-arrow" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {spotlightCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 0.08}>
                <Link
                  to={card.path}
                  onPointerMove={applyCardTilt}
                  onPointerLeave={resetCardTilt}
                  className={`home-interactive-card spotlight-card ${card.className}`}
                >
                  <span
                    className="home-card-art"
                    style={{ backgroundImage: `url(${card.image})` }}
                    aria-hidden="true"
                  />
                  <span className="spotlight-card__eyebrow">{card.subtitle}</span>
                  <span className="spotlight-card__copy">
                    <span className="font-display text-4xl font-semibold tracking-tight-display sm:text-5xl">
                      {card.title}
                    </span>
                    <span className="spotlight-card__action">
                      {card.action}
                      <ArrowUpRight size={18} className="home-cta-arrow" />
                    </span>
                  </span>
                  <span className="spotlight-card__glow" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-10 text-center md:mb-14">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Explore Lumera
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-6xl">
                Find Your Experience
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-slate-custom md:text-lg">
                Watch, listen, discover and experience stories your way.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {exploreCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <Reveal key={card.title} delay={index * 0.05}>
                  <Link
                    to={card.path}
                    onPointerMove={applyCardTilt}
                    onPointerLeave={resetCardTilt}
                    className="home-interactive-card explore-card"
                  >
                    <span
                      className="home-card-art"
                      style={{ backgroundImage: `url(${card.image})` }}
                      aria-hidden="true"
                    />
                    <span className="explore-card__icon">
                      <Icon size={17} strokeWidth={1.7} />
                    </span>
                    <span className="explore-card__content">
                      <span className="font-display text-3xl font-semibold tracking-tight-display">
                        {card.title}
                      </span>
                      <span className="explore-card__description">{card.description}</span>
                      <span className="explore-card__arrow">
                        <ArrowUpRight size={18} />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <ExperienceSection />

      <section className="bg-ivory-gradient py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-10 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  The Lumera Edit
                </p>
                <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-6xl">
                  A little more to explore.
                </h2>
              </div>
              <p className="max-w-sm text-base leading-relaxed text-slate-custom">
                Visual notes, listening rooms and thoughtful ideas for wherever curiosity leads.
              </p>
            </div>
          </Reveal>

          <div className="editorial-grid">
            {editorialCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 0.05} className={card.className}>
                <Link
                  to={card.path}
                  onPointerMove={applyCardTilt}
                  onPointerLeave={resetCardTilt}
                  className="home-interactive-card editorial-card"
                >
                  <span
                    className="home-card-art"
                    style={{ backgroundImage: `url(${card.image})` }}
                    aria-hidden="true"
                  />
                  <span className="editorial-card__content">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/75">
                      {card.category}
                    </span>
                    <span className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight-display text-white md:text-3xl">
                      {card.title}
                    </span>
                    <span className="editorial-card__description">{card.description}</span>
                    <span className="editorial-card__arrow">
                      <ArrowUpRight size={17} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <Reveal>
            <div className="mb-10 text-center md:mb-14">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Coming Soon
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-6xl">
                The next chapter is taking shape.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingExperiences.map((experience, index) => (
              <Reveal key={experience.title} delay={index * 0.07}>
                <Link
                  to={experience.path}
                  onPointerMove={applyCardTilt}
                  onPointerLeave={resetCardTilt}
                  className="home-interactive-card upcoming-card"
                >
                  <span
                    className="home-card-art"
                    style={{ backgroundImage: `url(${experience.image})` }}
                    aria-hidden="true"
                  />
                  <span className="upcoming-card__index">0{index + 1}</span>
                  <span className="upcoming-card__title">{experience.title}</span>
                  <span className="upcoming-card__arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory px-6 py-20 md:px-10 md:py-28">
        <Reveal>
          <div className="home-closing mx-auto max-w-[1360px] overflow-hidden rounded-[2rem] px-7 py-16 text-center md:px-16 md:py-24">
            <div className="home-closing__orb home-closing__orb--one" />
            <div className="home-closing__orb home-closing__orb--two" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Waves size={24} strokeWidth={1.4} className="mx-auto mb-6 text-gold-dark" />
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Made for curiosity
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight-display text-ink md:text-6xl">
                Your next perspective is waiting.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-custom md:text-lg">
                Take the path that feels right. There&apos;s always something new to see, hear or
                experience.
              </p>
              <Link to="/search" className="home-magnetic-cta mt-8">
                Start exploring <ArrowRight size={16} className="home-cta-arrow" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PageWrapper>
  );
}
