import { Link } from 'react-router-dom';
import { Play, Clapperboard, Mic, Radio, BookOpen, Plus } from 'lucide-react';

const footerLinks = [
  {
    title: 'Browse',
    links: [
      { label: 'Home', path: '/' },
      { label: 'Videos', path: '/videos' },
      { label: 'Podcasts', path: '/podcasts' },
      { label: 'Live', path: '/live' },
      { label: 'Stories', path: '/stories' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My List', path: '/my-list' },
      { label: 'Profile', path: '/profile' },
      { label: 'Search', path: '/search' },
      { label: 'Studio', path: '/studio' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', path: '/' },
      { label: 'Careers', path: '/' },
      { label: 'Press', path: '/' },
      { label: 'Contact', path: '/' },
    ],
  },
];

const platformLinks = [
  { icon: Play, label: 'Videos' },
  { icon: Mic, label: 'Podcasts' },
  { icon: Radio, label: 'Live' },
  { icon: BookOpen, label: 'Stories' },
  { icon: Clapperboard, label: 'Studio' },
  { icon: Plus, label: 'My List' },
];

export function Footer() {
  return (
    <footer className="bg-ivory-2 border-t border-ink/8 pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        {/* Top CTA strip */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-16 border-b border-ink/10">
          <div>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight-display">
              Ready to explore?
            </h3>
            <p className="text-slate-custom mt-2 text-lg">
              Your next favorite story is one click away.
            </p>
          </div>
          <Link
            to="/videos"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:bg-gold transition-all duration-400 hover:shadow-elevated"
          >
            Start Watching
            <span className="w-5 h-5 rounded-full bg-cream/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <Play size={12} fill="currentColor" />
            </span>
          </Link>
        </div>

        {/* Main footer */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-rose flex items-center justify-center">
                <span className="text-cream font-display font-bold text-xl">L</span>
              </div>
              <span className="font-display text-2xl font-bold text-ink">LUMERA</span>
            </Link>
            <p className="text-slate-custom text-sm leading-relaxed max-w-xs mb-8">
              A premium streaming platform for cinematic storytelling, visual essays, and original series. Light, bright, and beautifully crafted.
            </p>
            <div className="flex gap-3">
              {platformLinks.map((item) => (
                <Link
                  key={item.label}
                  to={`/${item.label.toLowerCase().replace(' ', '-')}`}
                  className="w-10 h-10 rounded-full bg-ink/5 hover:bg-gold hover:text-cream flex items-center justify-center text-ink transition-all duration-300"
                  title={item.label}
                >
                  <item.icon size={18} strokeWidth={1.6} />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink uppercase tracking-wide-display mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-slate-custom hover:text-gold text-sm transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-ink/10">
          <p className="text-slate-custom text-xs">
            &copy; 2026 LUMERA. All rights reserved. A premium streaming experience.
          </p>
          <div className="flex gap-6">
            <span className="text-slate-custom text-xs hover:text-gold cursor-pointer transition-colors">Privacy</span>
            <span className="text-slate-custom text-xs hover:text-gold cursor-pointer transition-colors">Terms</span>
            <span className="text-slate-custom text-xs hover:text-gold cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
