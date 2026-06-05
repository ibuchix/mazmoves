// MotionSection.tsx - Wraps children in a subtle whileInView fade + rise.
// Used across town-page sections to give a sense of polish without flashy motion.
// Triggers once, with a generous viewport margin so content is visible before scrolling fully in.
import { motion } from "framer-motion";

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionSection({ children, className, delay = 0 }: MotionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
