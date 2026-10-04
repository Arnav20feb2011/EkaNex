import Reveal from './Reveal';

/**
 * Navy page introduction used at the top of inner pages.
 */
export default function PageHero({ eyebrow, title, subtitle, italic = false, children }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-electric/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="container-px relative py-20 sm:py-24 lg:py-28">
        <Reveal className="max-w-4xl">
          {eyebrow ? <p className="eyebrow mb-4 text-accent">{eyebrow}</p> : null}
          <h1
            className={`text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight ${
              italic ? 'italic' : ''
            }`}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {subtitle}
            </p>
          ) : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
