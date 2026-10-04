import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On navigation: scroll to the top of a new page, or smooth-scroll to a hash
 * target (e.g. /#pricing). Retries briefly so it works even while the target
 * page is still mounting behind a page transition.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToTarget = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      if (scrollToTarget()) return;

      let tries = 0;
      const interval = setInterval(() => {
        tries += 1;
        if (scrollToTarget() || tries > 20) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
