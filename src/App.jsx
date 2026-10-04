import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { bootstrap } from './lib/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import FloatingApplyButton from './components/FloatingApplyButton';
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import WhoWeHelp from './pages/WhoWeHelp';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import ApplyFlow from './apply/ApplyFlow';
import StudentDashboard from './dashboard/StudentDashboard';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/who-we-help" element={<WhoWeHelp />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/apply" element={<ApplyFlow />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const location = useLocation();
  // In live mode, hydrate the local cache from Supabase once on load. No-op in demo.
  useEffect(() => { bootstrap(); }, []);
  // These are full-screen experiences with their own chrome (no site nav/footer).
  const isApply = location.pathname.startsWith('/apply');
  const isFullscreen = isApply || location.pathname.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <ScrollManager />
      {!isFullscreen && <Navbar />}
      <AnimatedRoutes />
      {!isFullscreen && <Footer />}
      {!isFullscreen && <FloatingApplyButton />}
    </div>
  );
}
