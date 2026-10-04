import { motion } from 'framer-motion';

/**
 * Fade-and-rise on scroll. Wraps content in a Framer Motion element that
 * animates once when it enters the viewport. `delay` enables simple stagger.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 24,
  as = 'div',
  amount = 0.2,
  once = true,
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
