import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { VideosPage } from '@/pages/VideosPage';
import { PodcastsPage } from '@/pages/PodcastsPage';
import { LivePage } from '@/pages/LivePage';
import { StoriesPage } from '@/pages/StoriesPage';
import { MyListPage } from '@/pages/MyListPage';
import { StudioPage } from '@/pages/StudioPage';
import { SearchPage } from '@/pages/SearchPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/podcasts" element={<PodcastsPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-ivory">
        <Navbar />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
