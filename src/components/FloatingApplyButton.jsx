import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Mobile-only sticky CTA. Appears after the user scrolls past the hero and
 * stays pinned to the bottom of every screen (hidden on the contact page,
 * where the form is already the focus).
 */
export default function FloatingApplyButton() {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname === '/contact') return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/apply"
            state={{ role: 'Student' }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-base font-semibold text-white shadow-float transition-transform active:scale-[0.98]"
          >
            Apply as a Student
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
