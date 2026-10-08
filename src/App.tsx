import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { useEffect, type ReactNode } from 'react';
import { VideoLibraryProvider } from '@/context/VideoLibraryContext';
import { PodcastLibraryProvider } from '@/context/PodcastLibraryContext';
import { MyListProvider } from '@/context/MyListContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/pages/AuthPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-[50vh] bg-ivory" aria-live="polite" />;
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
}

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
        <Route path="/my-list" element={<RequireAuth><MyListPage /></RequireAuth>} />
        <Route path="/studio" element={<RequireAuth><StudioPage /></RequireAuth>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VideoLibraryProvider>
          <PodcastLibraryProvider>
            <MyListProvider>
              <ScrollToTop />
              <div className="min-h-screen bg-ivory">
                <Navbar />
                <main>
                  <AnimatedRoutes />
                </main>
                <Footer />
              </div>
            </MyListProvider>
          </PodcastLibraryProvider>
        </VideoLibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
