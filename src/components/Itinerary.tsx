import { motion } from 'framer-motion';
import { Train, Footprints, Bus, Car, Clock, Wallet, MapPin, Star } from 'lucide-react';
import type { ItineraryDay, TransportMode } from '@/types';

interface ItineraryProps {
  days: ItineraryDay[];
  activeDay: number;
  onSelectDay: (day: number) => void;
}

const transportIcon: Record<TransportMode, typeof Train> = {
  train: Train,
  walking: Footprints,
  bus: Bus,
  taxi: Car,
};

const transportLabel: Record<TransportMode, string> = {
  train: 'Train',
  walking: 'Walk',
  bus: 'Bus',
  taxi: 'Taxi',
};

export function Itinerary({ days, activeDay, onSelectDay }: ItineraryProps) {
  const day = days.find((d) => d.day === activeDay) ?? days[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400">
          Itinerary
        </h3>
        <span className="text-xs font-medium text-midnight-400">{day.label}</span>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {days.map((d) => {
          const isActive = d.day === activeDay;
          return (
            <button
              key={d.day}
              onClick={() => onSelectDay(d.day)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-midnight-900 text-white'
                  : 'bg-sand-50 text-midnight-500 hover:bg-sand-100'
              }`}
            >
              Day {d.day}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[1.4rem] top-3 bottom-3 w-px bg-sand-200" />
        <div className="space-y-1">
          {day.activities.map((act, i) => {
            const TransportIcon = act.transport ? transportIcon[act.transport.mode] : null;
            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="relative flex items-start gap-4 px-1 py-2.5 hover:bg-sand-50/50 transition-colors group"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`h-11 w-11 rounded-lg border flex items-center justify-center text-xl ${
                    act.planTag ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-sand-200'
                  }`}>
                    {act.emoji}
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-midnight-900 tabular-nums">{act.time}</span>
                    {act.planTag && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                        Plan {act.planTag}
                      </span>
                    )}
                    {act.isOutdoor && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">
                        Outdoor
                      </span>
                    )}
                    {act.isRequested && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-coral-50 text-coral-600 flex items-center gap-0.5">
                        <Star size={8} fill="currentColor" strokeWidth={0} />
                        Must-visit
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-midnight-900 mt-0.5">{act.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {act.location && (
                      <span className="flex items-center gap-1 text-xs text-midnight-400">
                        <MapPin size={11} strokeWidth={2.2} />
                        {act.location}
                      </span>
                    )}
                    {act.duration && act.duration !== '—' && (
                      <span className="flex items-center gap-1 text-xs text-midnight-400">
                        <Clock size={11} strokeWidth={2.2} />
                        {act.duration}
                      </span>
                    )}
                    {act.cost !== undefined && act.cost > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-midnight-500">
                        <Wallet size={11} strokeWidth={2.2} />
                        RM {act.cost}
                      </span>
                    )}
                  </div>
                  {act.transport && TransportIcon && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-midnight-400">
                      <TransportIcon size={12} className="text-sky-500" strokeWidth={2.2} />
                      <span>
                        {transportLabel[act.transport.mode]} · {act.transport.from} → {act.transport.to} · {act.transport.duration}
                        {act.transport.cost > 0 && ` · RM ${act.transport.cost}`}
                      </span>
                    </div>
                  )}
                  {act.optimizationNote && (
                    <p className="mt-1.5 text-xs text-sky-600 italic">{act.optimizationNote}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
