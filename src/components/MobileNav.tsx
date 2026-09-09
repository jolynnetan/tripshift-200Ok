import { motion } from 'framer-motion';
import { LayoutGrid, Briefcase, Compass, Users } from 'lucide-react';
import type { NavSection } from '@/types';
import { Logo } from '@/components/Logo';
import { CurrentDate } from '@/components/CurrentDate';

interface MobileNavProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'trips', label: 'Trips', icon: Briefcase },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'groups', label: 'Groups', icon: Users },
];

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/85 backdrop-blur-xl border-b border-sand-200">
        <Logo size="sm" />
        <CurrentDate />
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-sand-200 px-2 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[3.5rem]"
            >
              {isActive && (
                <motion.div
                  layoutId="mnav-active"
                  className="absolute inset-0 rounded-lg bg-sky-50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} className={`relative z-10 ${isActive ? 'text-sky-600' : 'text-midnight-400'}`} strokeWidth={2.2} />
              <span className={`relative z-10 text-[10px] font-semibold ${isActive ? 'text-sky-700' : 'text-midnight-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
