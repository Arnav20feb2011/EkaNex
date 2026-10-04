import { Check } from 'lucide-react';

/**
 * Bulleted list rendered with circular check icons. Adapts to dark backgrounds.
 */
export default function CheckList({ items, onDark = false, className = '', itemClassName = '' }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
              onDark ? 'bg-accent/20 text-accent' : 'bg-forest/10 text-forest'
            }`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className={`leading-relaxed ${onDark ? 'text-white/85' : 'text-ink/80'} ${itemClassName}`}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
