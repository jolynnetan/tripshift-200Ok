import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, ArrowRight, Sun, CloudRain, Cloud, AlertTriangle, Clock, Navigation, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/Button';
import type { Trip, TravelGroup } from '@/types';
import { computeTripSpend } from '@/state/useAppState';

interface OverviewProps {
  trips: Trip[];
  groups: TravelGroup[];
  onOpenTrip: (id: string, initialView?: 'itinerary' | 'disruption-select') => void;
  onExplore: () => void;
  onNewTrip: () => void;
}

function useCurrentTime() {
  const [now] = useState(new Date());
  return now;
}

const weatherIcon = { sun: Sun, cloud: Cloud, rain: CloudRain, storm: CloudRain };

export function Overview({ trips, groups, onOpenTrip, onExplore, onNewTrip }: OverviewProps) {
  const now = useCurrentTime();

  const currentTrip = trips.find((t) => t.status === 'current');
  const upcomingTrip = trips.find((t) => t.status === 'upcoming');
  const currentGroup = currentTrip ? groups.find((g) => g.id === currentTrip.groupId) : null;

  const timeStr = useMemo(() => now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), [now]);
  const dateStr = useMemo(() => {
    const day = now.toLocaleString('en-US', { weekday: 'long' });
    const d = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day} · ${d} ${month} ${year}`;
  }, [now]);

  const currentSpend = currentTrip ? computeTripSpend(currentTrip) : 0;
  const remaining = currentTrip ? currentTrip.budget - currentSpend : 0;

  const { currentActivity, nextActivity } = useMemo(() => {
    if (!currentTrip) return { currentActivity: null, nextActivity: null };
    const day = currentTrip.itinerary.find((d) => d.day === currentTrip.currentDay);
    if (!day) return { currentActivity: null, nextActivity: null };
    const upcoming = day.activities.filter((a) => a.time >= timeStr);
    return {
      currentActivity: upcoming[0] ?? null,
      nextActivity: upcoming[1] ?? null,
    };
  }, [currentTrip, timeStr]);

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-midnight-900">Your travels</h1>
          <p className="mt-1 text-sm text-midnight-400">{dateStr} · {timeStr}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button size="sm" variant="secondary" onClick={onExplore}>
            <Navigation size={16} strokeWidth={2.3} />
            Explore destinations
          </Button>
          <Button size="sm" onClick={onNewTrip}>
            <Plus size={16} strokeWidth={2.5} />
            Plan a new trip
          </Button>
        </div>
      </motion.div>

      {/* Current Trip */}
      {currentTrip && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-2 text-emerald-600 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
            <span className="text-xs font-bold uppercase tracking-wider">Current Trip</span>
          </div>

          {/* Cover image */}
          <div className="relative h-44 rounded-xl overflow-hidden mb-5 bg-midnight-900">
            <img src={currentTrip.coverImage} alt={currentTrip.destination} className="absolute inset-0 w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/80 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
              <div>
                <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1"><MapPin size={12} strokeWidth={2.2} />{currentTrip.country}</div>
                <h2 className="text-2xl font-extrabold">{currentTrip.destination}</h2>
                <p className="text-sm text-white/60 mt-0.5">{currentTrip.startDate}–{currentTrip.endDate}</p>
              </div>
              <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold">DAY {currentTrip.currentDay} OF {currentTrip.totalDays}</span>
            </div>
          </div>

          {/* Trip metadata as text, not cards */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-midnight-500 mb-5">
            <span className="flex items-center gap-1.5"><Users size={14} strokeWidth={2.2} />{currentTrip.travelType === 'solo' ? 'Solo trip' : currentGroup ? `${currentGroup.travellers.length} travellers` : 'No group'}</span>
            {currentTrip.weather[0] && <span className="flex items-center gap-1.5">{(() => { const WIcon = weatherIcon[currentTrip.weather[0].icon]; return <WIcon size={14} strokeWidth={2.2} />; })()}{currentTrip.weather[0].high}° / {currentTrip.weather[0].low}°</span>}
            <span className="flex items-center gap-1.5"><Wallet size={14} strokeWidth={2.2} />RM {remaining.toLocaleString()} remaining of RM {currentTrip.budget.toLocaleString()}</span>
          </div>

          {/* Now + Up next activities */}
          {(currentActivity || nextActivity) && (
            <div className="py-4 border-t border-sand-100 mb-4">
              <div className="flex items-center gap-2 text-midnight-400 mb-3">
                <Clock size={14} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Today's plan</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {currentActivity && (
                  <div className="rounded-lg bg-sky-50/60 border border-sky-100 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-1">Now</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-sky-600 tabular-nums">{currentActivity.time}</span>
                      <span className="text-sm font-semibold text-midnight-900">{currentActivity.title}</span>
                    </div>
                    {currentActivity.duration && currentActivity.duration !== '—' && (
                      <p className="text-xs text-midnight-400 mt-0.5">{currentActivity.duration}</p>
                    )}
                  </div>
                )}
                {nextActivity && (
                  <div className="rounded-lg bg-white border border-sand-200 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400 mb-1">Up next</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-midnight-500 tabular-nums">{nextActivity.time}</span>
                      <span className="text-sm font-semibold text-midnight-900">{nextActivity.title}</span>
                    </div>
                    {nextActivity.duration && nextActivity.duration !== '—' && (
                      <p className="text-xs text-midnight-400 mt-0.5">{nextActivity.duration}</p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => onOpenTrip(currentTrip.id, 'disruption-select')}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-coral-600 hover:text-coral-700 transition-colors"
              >
                <RefreshCw size={14} strokeWidth={2.5} /> Change plan
              </button>
            </div>
          )}

          {currentTrip.weather.find((w) => w.alert) && (
            <div className="flex items-start gap-2 py-3 border-t border-sand-100 mb-4">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.4} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">{currentTrip.weather.find((w) => w.alert)?.alert}</p>
                <p className="text-xs text-amber-700 mt-0.5">1 outdoor activity may be affected</p>
              </div>
            </div>
          )}

          <button onClick={() => onOpenTrip(currentTrip.id)} className="inline-flex items-center gap-2 text-sm font-bold text-midnight-900 hover:text-sky-600 transition-colors">
            Open active trip <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}

      {/* Upcoming Trip */}
      {upcomingTrip && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-8">
          <div className="flex items-center gap-2 text-sky-600 mb-3">
            <Calendar size={14} strokeWidth={2.4} />
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming</span>
          </div>
          <button onClick={() => onOpenTrip(upcomingTrip.id)} className="w-full flex items-center gap-4 py-3 border-t border-sand-100 hover:bg-sand-50/50 transition-colors text-left -mx-2 px-2 rounded-lg">
            <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-midnight-100">
              <img src={upcomingTrip.coverImage} alt={upcomingTrip.destination} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-midnight-900">{upcomingTrip.destination}</h3>
              <p className="text-xs text-midnight-400">{upcomingTrip.startDate}–{upcomingTrip.endDate} · {upcomingTrip.totalDays} days</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-midnight-500">
                <span className="flex items-center gap-1"><Users size={11} /> {upcomingTrip.travelType === 'solo' ? 'Solo trip' : `${groups.find((g) => g.id === upcomingTrip.groupId)?.travellers.length ?? 0} travellers`}</span>
                <span className="flex items-center gap-1"><Wallet size={11} /> RM {upcomingTrip.budget.toLocaleString()}</span>
              </div>
            </div>
            <ArrowRight size={18} className="text-midnight-300 shrink-0" strokeWidth={2.2} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
