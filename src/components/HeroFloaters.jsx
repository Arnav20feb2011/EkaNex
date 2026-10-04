import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CalendarClock, FileText, Award } from 'lucide-react';

/**
 * Decorative parallax layer for the hero: glass cards + orbs that drift with
 * the pointer at different depths, with a gentle idle float. Pointer-events
 * are disabled so it never blocks the hero CTAs.
 */
export default function HeroFloaters() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 50, damping: 18 });
  const sy = useSpring(py, { stiffness: 50, damping: 18 });

  useEffect(() => {
    const onMove = (e) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [px, py]);

  // Parallax offsets per depth layer.
  const orb1x = useTransform(sx, (v) => v * 70);
  const orb1y = useTransform(sy, (v) => v * 70);
  const orb2x = useTransform(sx, (v) => v * -45);
  const orb2y = useTransform(sy, (v) => v * -45);
  const c1x = useTransform(sx, (v) => v * 34);
  const c1y = useTransform(sy, (v) => v * 34);
  const c2x = useTransform(sx, (v) => v * 50);
  const c2y = useTransform(sy, (v) => v * 50);
  const c3x = useTransform(sx, (v) => v * 24);
  const c3y = useTransform(sy, (v) => v * 24);

  const cards = [
    {
      x: c1x,
      y: c1y,
      pos: 'right-[5%] top-[16%]',
      dur: 6,
      icon: CalendarClock,
      tint: 'bg-electric/30 text-white',
      title: '7-week sprint',
      sub: 'Structured & supervised',
    },
    {
      x: c2x,
      y: c2y,
      pos: 'right-[15%] top-[45%]',
      dur: 7.5,
      icon: FileText,
      tint: 'bg-white/15 text-white',
      title: 'Final report',
      sub: '+ live presentation',
    },
    {
      x: c3x,
      y: c3y,
      pos: 'right-[3%] top-[70%]',
      dur: 6.8,
      icon: Award,
      tint: 'bg-accent/30 text-white',
      title: 'Certificate + reference',
      sub: 'Portfolio-ready',
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Parallax orbs */}
      <motion.div
        style={{ x: orb1x, y: orb1y }}
        className="absolute right-[18%] top-[24%] h-40 w-40 rounded-full bg-electric/30 blur-3xl"
      />
      <motion.div
        style={{ x: orb2x, y: orb2y }}
        className="absolute bottom-[14%] right-[8%] h-48 w-48 rounded-full bg-[#5C9DF5]/20 blur-3xl"
      />

      {/* Glass cards (desktop only) */}
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            style={{ x: card.x, y: card.y }}
            className={`absolute hidden lg:block ${card.pos}`}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: card.dur, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-float backdrop-blur-md"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${card.tint}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{card.title}</p>
                <p className="text-xs text-white/65">{card.sub}</p>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
