import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ children, className = '', blur = 'md' }: GlassCardProps) {
  // Removed backdrop-blur for performance - using solid backgrounds instead
  // backdrop-blur causes expensive recalculations on every scroll frame
  return (
    <div
      className={`
        bg-card/80 dark:bg-card/60
        border border-border/50
        rounded-2xl
        shadow-lg
        ${className}
      `}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)', // Force GPU acceleration
      }}
    >
      {children}
    </div>
  );
}
