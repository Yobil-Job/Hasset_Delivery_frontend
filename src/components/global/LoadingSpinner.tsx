import { motion } from 'motion/react';
import { Package } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Package className="h-12 w-12 text-primary" />
      </motion.div>
    </div>
  );
}
