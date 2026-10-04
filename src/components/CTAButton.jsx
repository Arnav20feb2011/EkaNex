import { Link } from 'react-router-dom';

const base =
  'group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-electric';

const sizes = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-7 py-3.5 text-base',
};

const variants = {
  // Primary navy fill — darkens on hover
  primary:
    'bg-navy text-white shadow-card ring-1 ring-inset ring-white/10 hover:bg-navy-800 hover:-translate-y-0.5 hover:shadow-cardHover',
  // Electric blue fill (used on dark backgrounds / hero)
  electric:
    'bg-electric text-white shadow-card ring-1 ring-inset ring-white/15 hover:bg-electric-dark hover:-translate-y-0.5 hover:shadow-cardHover',
  // Outlined navy — fills navy on hover
  outline: 'border-2 border-navy text-navy bg-transparent hover:bg-navy hover:text-white',
  // Amber accent fill — darkens on hover (navy text for contrast)
  amber: 'bg-accent text-navy shadow-card hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-cardHover',
  // Outlined white for dark/navy backgrounds — fills white on hover
  whiteOutline: 'border-2 border-white/70 text-white bg-transparent hover:bg-white hover:text-navy',
  // Solid white for dark backgrounds
  whiteFill: 'bg-white text-navy shadow-card hover:bg-canvas hover:-translate-y-0.5 hover:shadow-cardHover',
};

/**
 * Flexible CTA that renders as a router Link (`to`), an anchor (`href`),
 * or a button (`onClick`). Pass router `state` to prefill the contact form.
 */
export default function CTAButton({
  children,
  to,
  href,
  onClick,
  state,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ariaLabel,
  ...rest
}) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (to) {
    return (
      <Link to={to} state={state} className={classes} aria-label={ariaLabel} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    const external = /^https?:|^mailto:|^tel:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(external ? { target: href.startsWith('http') ? '_blank' : undefined, rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} aria-label={ariaLabel} {...rest}>
      {children}
    </button>
  );
}
