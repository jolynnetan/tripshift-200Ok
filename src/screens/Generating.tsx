import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Wallet, Compass, Check } from 'lucide-react';

interface GeneratingProps {
  onDone: () => void;
}

const STEPS = [
  { icon: MapPin, label: 'Mapping destination' },
  { icon: Users, label: 'Syncing group preferences' },
  { icon: Wallet, label: 'Balancing budget' },
  { icon: Compass, label: 'Planning route' },
  { icon: Check, label: 'Finalizing itinerary' },
];

export function Generating({ onDone }: GeneratingProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="h-14 w-14 mx-auto rounded-lg bg-sky-500 flex items-center justify-center"
        >
          <Compass size={26} className="text-white" strokeWidth={2.5} />
        </motion.div>

        <h2 className="mt-6 text-2xl font-extrabold text-white tracking-tight">
          Building your trip
        </h2>
        <p className="mt-2 text-white/50 text-sm">
          Planning your itinerary and preparing backup options.
        </p>

        <div className="mt-10 space-y-3 text-left">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.45, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon size={15} className="text-sky-300" strokeWidth={2.2} />
                </div>
                <span className="text-sm font-medium text-white/70">{step.label}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.45 }}
                  className="ml-auto text-xs text-emerald-400 font-semibold"
                >
                  ✓
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
