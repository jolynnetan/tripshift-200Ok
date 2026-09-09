import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { forwardRef } from 'react';
import { ArrowRight, CloudRain, Plane, Users, Wallet, Compass, Calendar, Clock, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/Button';

interface LandingProps {
  onStart: () => void;
  onHowItWorks: () => void;
}

export function Landing({ onStart, onHowItWorks }: LandingProps) {
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-midnight-950">
      {/* Background — subtle, not excessive */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950" />
      <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-sky-500/10 blur-[140px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 md:px-10 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Compass size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              TRIP<span className="text-sky-400">SHIFT</span>
            </span>
          </div>
          <span className="text-xs font-medium text-white/40 hidden sm:block">
            ADAPTIVE TRAVEL PLATFORM
          </span>
        </header>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-xs font-semibold text-white/60">
              DISCOVER → PLAN → TRAVEL → ADAPT
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] text-balance"
          >
            Plan the trip.
            <br />
            <span className="text-sky-400">Adapt to reality.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-7 text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl text-balance"
          >
            Travel planning doesn't end when the itinerary is created. TRIPSHIFT helps
            travellers discover destinations, build itineraries, and adapt when
            real-world disruptions happen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-2.5 rounded-lg bg-sky-500 text-white font-bold text-base px-7 py-3.5 hover:bg-sky-600 transition-colors"
            >
              Start Planning
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToHowItWorks}
              className="inline-flex items-center gap-2 text-white/70 font-medium text-sm px-5 py-3.5 hover:text-white transition-colors"
            >
              See how it works
              <ChevronDown size={16} />
            </motion.button>
          </motion.div>

          {/* Feature list — simple text, not pill cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50"
          >
            {[
              { icon: Compass, label: 'Compare & save' },
              { icon: Users, label: 'Group sync' },
              { icon: Wallet, label: 'Budget-aware' },
              { icon: CloudRain, label: 'Adaptive planning' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <span key={f.label} className="flex items-center gap-1.5">
                  <Icon size={14} className="text-sky-400" strokeWidth={2.2} />
                  {f.label}
                </span>
              );
            })}
          </motion.div>
        </div>

        {/* ── HOW IT WORKS SECTION ── */}
        <HowItWorksSection ref={howItWorksRef} onHowItWorks={onHowItWorks} />

        <footer className="px-6 py-6 text-center">
          <p className="text-xs text-white/30">
            TRIPSHIFT · Plan smarter. Adapt when reality changes.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ── How It Works Section ──

const HowItWorksSection = forwardRef<HTMLDivElement, { onHowItWorks: () => void }>((_props, ref) => {
  const inView = useInView(ref as React.RefObject<HTMLDivElement>, { once: true, margin: '-100px' });

  const steps = [
    { num: '01', title: 'DISCOVER', subtitle: 'Find where you want to go', icon: Compass, points: ['Destination recommendations', 'Estimated trip cost', 'Flight & hotel options', 'Activities & local insights'] },
    { num: '02', title: 'PLAN', subtitle: 'Build a trip around you', icon: Calendar, points: ['Travel dates & group', 'Budget slider', 'Traveller preferences', 'Must-visit places'] },
    { num: '03', title: 'TRAVEL', subtitle: 'Follow your trip in real time', icon: Clock, points: ['Current time & activity', 'Upcoming transport', 'Weather awareness', 'Remaining budget'] },
    { num: '04', title: 'ADAPT', subtitle: 'When reality changes', icon: CloudRain, points: ['Heavy rain · Missed bus', 'Flight delay · Attraction closed', 'Practical alternatives', 'Apply & restore Plan A'] },
  ];

  return (
    <section ref={ref} id="how-it-works" className="scroll-mt-8 px-6 md:px-10 py-16 md:py-20 max-w-5xl mx-auto">
      {/* Headline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Travel plans change.<br />
          <span className="text-sky-400">TRIPSHIFT changes with them.</span>
        </h2>
        <p className="mt-4 text-base md:text-lg text-white/50 max-w-2xl leading-relaxed">
          TRIPSHIFT combines trip discovery, intelligent planning and adaptive recovery into one travel experience.
        </p>
      </motion.div>

      {/* 4 Steps — simple numbered sections, not cards */}
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className="text-sky-400" strokeWidth={2.2} />
                <span className="text-xs font-extrabold text-white/30 tabular-nums">{step.num}</span>
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">{step.title}</h3>
              <p className="text-xs text-white/40 mt-0.5 mb-3">{step.subtitle}</p>
              <ul className="space-y-1.5">
                {step.points.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 text-xs text-white/60"><Check size={12} className="text-sky-400 shrink-0 mt-0.5" strokeWidth={2.5} />{p}</li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Key message */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }} className="mt-10">
        <p className="text-sm font-medium text-white/60 text-center italic">You decide what matters. TRIPSHIFT optimizes how it fits together.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }} className="mt-10 text-center">
        <p className="text-base md:text-lg font-extrabold text-white italic">
          TRIPSHIFT doesn't just help you plan a trip. <span className="text-sky-400">It helps you recover it.</span>
        </p>
      </motion.div>

    </section>
  );
});

HowItWorksSection.displayName = 'HowItWorksSection';
