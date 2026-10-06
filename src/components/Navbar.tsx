import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, Search, UserRound, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Videos', path: '/videos' },
  { label: 'Podcasts', path: '/podcasts' },
  { label: 'Live', path: '/live' },
  { label: 'Stories', path: '/stories' },
  { label: 'My List', path: '/my-list' },
  { label: 'Studio', path: '/studio' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const previousScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (menuOpen || currentScrollY <= 100) {
        setHidden(false);
      } else if (Math.abs(currentScrollY - previousScrollY.current) > 3) {
        setHidden(currentScrollY > previousScrollY.current);
      }

      previousScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`lumera-navbar fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4 ${
        hidden && !menuOpen ? 'lumera-navbar--hidden' : ''
      }`}
    >
      <nav
        aria-label="Main navigation"
        className={`lumera-navbar__surface mx-auto max-w-[1440px] ${
          scrolled ? 'lumera-navbar__surface--scrolled' : ''
        }`}
      >
        <div className="flex min-h-[64px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Lumera home">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-rose transition-transform duration-300 group-hover:scale-105">
              <span className="font-display text-lg font-bold text-cream">L</span>
            </div>
            <span className="font-display text-[1.35rem] font-bold tracking-tight-display text-ink">
              LUMERA
            </span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`lumera-nav-link ${active ? 'lumera-nav-link--active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Link to="/search" className="lumera-nav-action" aria-label="Search">
              <Search size={19} strokeWidth={1.7} />
            </Link>
            <button
              type="button"
              className="lumera-nav-action hidden sm:flex"
              aria-label="Notifications"
            >
              <Bell size={19} strokeWidth={1.7} />
            </button>
            <Link to="/profile" className="lumera-profile-action" aria-label="Profile">
              <UserRound size={18} strokeWidth={1.8} />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="lumera-nav-action xl:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="lumera-mobile-menu"
            >
              {menuOpen ? <X size={21} strokeWidth={1.8} /> : <Menu size={21} strokeWidth={1.8} />}
            </button>
          </div>
        </div>

        <div
          id="lumera-mobile-menu"
          className={`lumera-mobile-menu xl:hidden ${menuOpen ? 'lumera-mobile-menu--open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <div className="flex flex-col px-5 pb-4 pt-1 sm:px-7">
            {navLinks.map((link, index) => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  className={`lumera-mobile-link ${
                    active ? 'lumera-mobile-link--active' : ''
                  }`}
                  style={{ '--menu-index': index } as CSSProperties}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
