import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * Wraps each page in a subtle fade/slide transition. Rendered as <main> so
 * every page exposes a single semantic main landmark.
 */
export default function PageTransition({ children, id = 'main' }) {
  return (
    <motion.main
      id={id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}
