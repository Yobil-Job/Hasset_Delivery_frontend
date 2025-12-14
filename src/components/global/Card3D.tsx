import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ReactNode, useRef } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function Card3D({ children, className = '', glowColor = '#FF6600' }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      <div
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor}40, transparent 70%)`,
          filter: 'blur(20px)',
          zIndex: -1,
        }}
        whileHover={{ opacity: 0.6 }}
      />
    </motion.div>
  );
}
