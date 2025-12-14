import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FloatingElement({ 
  children, 
  delay = 0, 
  duration = 3,
  className = '' 
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
