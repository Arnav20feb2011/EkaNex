import Reveal from './Reveal';

/**
 * Eyebrow + headline + optional subtitle, with scroll reveal.
 * `onDark` adapts colours for navy backgrounds; `italic` styles the headline.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  onDark = false,
  italic = false,
  className = '',
  titleClassName = '',
}) {
  return (
    <Reveal className={`${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      {eyebrow ? (
        <p className={`eyebrow mb-3 ${onDark ? 'text-accent' : 'text-electric'}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`text-section font-bold ${italic ? 'italic' : ''} ${
          onDark ? 'text-white' : 'text-navy'
        } ${titleClassName}`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-4 text-lg leading-relaxed ${onDark ? 'text-white/80' : 'text-muted'}`}>
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
