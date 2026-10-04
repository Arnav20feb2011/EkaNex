import { useId } from 'react';
import { Link } from 'react-router-dom';

/**
 * EkaNex mark: a bold gradient "E" (blue → violet) with a sparkle pair — matching
 * the brand logo. Tile-less and bright enough to read on both light and dark
 * backgrounds. Renders crisply at any size (it's vector).
 */
export function LogoMark({ className = 'h-9 w-9' }) {
  const id = useId();
  const eg = `${id}-e`;
  const sg = `${id}-s`;
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="EkaNex logo" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={eg} x1="10" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E40AF" />
          <stop offset="0.5" stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={sg} x1="35" y1="9" x2="47" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* E — spine + three rounded bars */}
      <g fill={`url(#${eg})`}>
        <rect x="11" y="10" width="8" height="28" rx="4" />
        <rect x="11" y="10" width="25" height="8" rx="4" />
        <rect x="11" y="20" width="18" height="8" rx="4" />
        <rect x="11" y="30" width="25" height="8" rx="4" />
      </g>

      {/* sparkles */}
      <path d="M40 9 L41.4 12.6 L45 14 L41.4 15.4 L40 19 L38.6 15.4 L35 14 L38.6 12.6 Z" fill={`url(#${sg})`} />
      <path d="M44.5 18 L45.2 19.8 L47 20.5 L45.2 21.2 L44.5 23 L43.8 21.2 L42 20.5 L43.8 19.8 Z" fill="#8B5CF6" />
    </svg>
  );
}

/** Full logo lockup: mark + wordmark. On light the wordmark uses the brand
 *  blue→violet gradient; on dark it's white for contrast. */
export default function Logo({ onDark = false, className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="EkaNex — home">
      <LogoMark />
      <span
        className={`text-xl font-extrabold tracking-tight ${
          onDark
            ? 'text-white'
            : 'bg-gradient-to-r from-[#1E40AF] via-electric to-[#7C3AED] bg-clip-text text-transparent'
        }`}
      >
        EkaNex
      </span>
    </Link>
  );
}
