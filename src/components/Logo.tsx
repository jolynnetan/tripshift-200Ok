import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = {
    sm: { box: 'h-7 w-7', icon: 14, text: 'text-base' },
    md: { box: 'h-9 w-9', icon: 18, text: 'text-lg' },
    lg: { box: 'h-12 w-12', icon: 24, text: 'text-2xl' },
  };
  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-midnight-900';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <motion.div
        whileHover={{ rotate: -12, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={`${s.box} rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-soft`}
      >
        <Compass size={s.icon} className="text-white" strokeWidth={2.5} />
      </motion.div>
      <span className={`${s.text} font-extrabold tracking-tight ${textColor}`}>
        TRIP<span className="text-sky-500">SHIFT</span>
      </span>
    </div>
  );
}
