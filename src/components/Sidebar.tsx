import { motion } from 'framer-motion';
import { LayoutGrid, Briefcase, Compass, Users } from 'lucide-react';
import type { NavSection } from '@/types';
import { Logo } from '@/components/Logo';
import { CurrentDate } from '@/components/CurrentDate';

interface SidebarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  travellerCount: number;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'trips', label: 'My Trips', icon: Briefcase },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'groups', label: 'Groups', icon: Users },
];

export function Sidebar({ active, onNavigate, travellerCount }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-sand-200 bg-white/80 backdrop-blur-xl">
      <div className="px-6 py-6">
        <Logo size="md" />
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-midnight-900'
                  : 'text-midnight-400 hover:text-midnight-700 hover:bg-sand-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-sky-50 border border-sky-200"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className={`relative z-10 ${isActive ? 'text-sky-600' : ''}`} strokeWidth={2.2} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-5 border-t border-sand-100 space-y-2">
        <p className="text-xs font-semibold tracking-wide text-midnight-400">TRIPSHIFT</p>
        <p className="text-xs text-midnight-300">Plan · Travel · Adapt</p>
        <div className="pt-2">
          <CurrentDate />
        </div>
      </div>
    </aside>
  );
}
