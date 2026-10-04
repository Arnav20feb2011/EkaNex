import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../data/site';
import Logo from './Logo';
import CTAButton from './CTAButton';

const desktopLink =
  "relative font-medium text-[15px] transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-accent after:transition-all after:duration-300 after:content-['']";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  // Close the mobile menu whenever the route or hash changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Solidify the bar once the user scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll and allow Escape-to-close while the overlay is open.
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'border-b border-white/10 bg-navy/95 shadow-nav backdrop-blur'
      }`}
    >
      <nav className="container-px flex h-[68px] items-center justify-between" aria-label="Primary">
        <Logo onDark />

        {/* Centre links — desktop */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `${desktopLink} ${
                    isActive
                      ? 'text-white after:w-full'
                      : 'text-white/70 after:w-0 hover:text-white hover:after:w-full'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA — desktop */}
        <div className="hidden items-center gap-5 lg:flex">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${desktopLink} ${isActive ? 'text-white after:w-full' : 'text-white/70 after:w-0 hover:text-white hover:after:w-full'}`
            }
          >
            Dashboard
          </NavLink>
          <CTAButton to="/apply" state={{ role: 'Student' }} variant="electric" size="sm">
            Apply Now
          </CTAButton>
        </div>

        {/* Hamburger — mobile */}
        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Full-screen slide-in overlay — mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-navy shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-[68px] items-center justify-between border-b border-white/10 px-5">
                <Logo onDark />
                <button
                  type="button"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <ul className="flex-1 overflow-y-auto px-5 py-2">
                {NAV_LINKS.map((l) => (
                  <li key={l.label} className="border-b border-white/10">
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        `block py-4 text-lg font-semibold ${isActive ? 'text-accent' : 'text-white'}`
                      }
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 p-5">
                <CTAButton to="/apply" state={{ role: 'Student' }} variant="electric" fullWidth size="lg">
                  Apply Now →
                </CTAButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
