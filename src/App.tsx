import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CorrectionModal } from './components/common/CorrectionModal';
import { Toast } from './components/ui/Toast';
import { JsonLd } from './components/common/JsonLd';

// Route-level code splitting with lazy loading
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const ProviderDetailPage = lazy(() =>
  import('./pages/ProviderDetailPage').then((m) => ({ default: m.ProviderDetailPage }))
);
const ListBusinessPage = lazy(() =>
  import('./pages/ListBusinessPage').then((m) => ({ default: m.ListBusinessPage }))
);
const EmergencyPage = lazy(() =>
  import('./pages/EmergencyPage').then((m) => ({ default: m.EmergencyPage }))
);
const AboutPrototypePage = lazy(() =>
  import('./pages/AboutPrototypePage').then((m) => ({ default: m.AboutPrototypePage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Route Fallback Spinner matching warm clinical tokens
const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-sand-200 border-t-moss-700 animate-spin" />
    <span className="text-xs text-ink-500 font-medium">Loading animal care resources…</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <DemoProvider>
      <BrowserRouter>
        <ScrollToTop />
        <JsonLd />

        {/* Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-moss-700 focus:text-white focus:rounded-btn focus:shadow-floating focus:outline-none"
        >
          Skip to main content
        </a>

        <div className="flex flex-col min-h-screen">
          <Header />
          <div id="main-content" className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/provider/:slug" element={<ProviderDetailPage />} />
                <Route path="/list-your-business" element={<ListBusinessPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/about-prototype" element={<AboutPrototypePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>

        {/* Global Overlays */}
        <CorrectionModal />
        <Toast />
      </BrowserRouter>
    </DemoProvider>
  );
};

export default App;
