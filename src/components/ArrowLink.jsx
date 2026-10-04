import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const tones = {
  navy: 'text-navy hover:text-electric',
  amber: 'text-accent hover:text-accent-dark',
  white: 'text-white hover:text-accent',
};

/**
 * Inline text link with an arrow that slides on hover. The arrow icon stands
 * in for the trailing "→" used throughout the approved copy.
 */
export default function ArrowLink({ to, href, state, children, tone = 'navy', className = '' }) {
  const classes = `group inline-flex items-center gap-1.5 font-semibold ${tones[tone]} transition-colors ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </>
  );

  if (href) {
    const external = /^https?:|^mailto:|^tel:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: href.startsWith('http') ? '_blank' : undefined, rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={to} state={state} className={classes}>
      {inner}
    </Link>
  );
}
