const bgMap = {
  white: 'bg-white',
  surface: 'bg-surface',
  canvas: 'bg-canvas',
  navy: 'bg-navy text-white',
};

/**
 * Standard page section: background variant + consistent vertical rhythm,
 * with a centered max-width container.
 */
export default function Section({ id, bg = 'white', className = '', containerClassName = '', children }) {
  return (
    <section id={id} className={`${bgMap[bg]} py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className={`container-px ${containerClassName}`}>{children}</div>
    </section>
  );
}
