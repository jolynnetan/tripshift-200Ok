import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Wallet, MapPin, ArrowRight, Navigation } from 'lucide-react';
import { Button } from '@/components/Button';
import type { Trip, TravelGroup } from '@/types';

interface MyTripsProps {
  trips: Trip[];
  groups: TravelGroup[];
  onOpenTrip: (id: string) => void;
  onNewTrip: () => void;
  onExplore: () => void;
}

export function MyTrips({ trips, groups, onOpenTrip, onNewTrip, onExplore }: MyTripsProps) {
  const current = trips.filter((t) => t.status === 'current');
  const upcoming = trips.filter((t) => t.status === 'upcoming');
  const past = trips.filter((t) => t.status === 'past');

  const renderTripRow = (trip: Trip, index: number) => {
    const group = groups.find((g) => g.id === trip.groupId);
    return (
      <motion.div
        key={trip.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.35 }}
        onClick={() => onOpenTrip(trip.id)}
        className="flex items-center gap-4 py-4 cursor-pointer hover:bg-sand-50/50 -mx-2 px-2 rounded-lg transition-colors group"
      >
        {/* Thumbnail */}
        <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-midnight-100">
          <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-midnight-900">{trip.destination}</h3>
            {trip.status === 'current' && (
              <span className="text-[10px] font-bold uppercase text-emerald-600">Active</span>
            )}
            {trip.status === 'upcoming' && (
              <span className="text-[10px] font-bold uppercase text-sky-600">Upcoming</span>
            )}
            {trip.status === 'past' && (
              <span className="text-[10px] font-bold uppercase text-midnight-400">Past</span>
            )}
          </div>
          <p className="text-xs text-midnight-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> {trip.country}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-midnight-500">
            <span className="flex items-center gap-1"><Calendar size={11} /> {trip.startDate}–{trip.endDate}</span>
            <span className="flex items-center gap-1"><Users size={11} /> {trip.travelType === 'solo' ? 'Solo' : `${group?.travellers.length ?? 0} travellers`}</span>
            <span className="flex items-center gap-1"><Wallet size={11} /> RM {trip.budget.toLocaleString()}</span>
          </div>
        </div>

        <ArrowRight size={18} className="text-midnight-300 group-hover:text-sky-500 shrink-0 transition-colors" strokeWidth={2.2} />
      </motion.div>
    );
  };

  const Section = ({ title, trips: sectionTrips }: { title: string; trips: Trip[] }) => {
    if (sectionTrips.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-2">{title}</h2>
        <div className="divide-y divide-sand-100">
          {sectionTrips.map((t, i) => renderTripRow(t, i))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-midnight-900">My Trips</h1>
          <p className="mt-1 text-sm text-midnight-400">Manage your current, upcoming and past trips.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onExplore}>
            <Navigation size={16} strokeWidth={2.3} />
            Explore
          </Button>
          <Button size="sm" onClick={onNewTrip}>
            <Plus size={16} strokeWidth={2.5} />
            New Trip
          </Button>
        </div>
      </motion.div>

      <Section title="Current" trips={current} />
      <Section title="Upcoming" trips={upcoming} />
      <Section title="Past" trips={past} />

      {trips.length === 0 && (
        <div className="text-center py-20">
          <p className="text-midnight-400 mb-4">No trips yet. Start planning your first adventure.</p>
          <Button onClick={onNewTrip}>
            <Plus size={16} strokeWidth={2.5} />
            Create your first trip
          </Button>
        </div>
      )}
    </div>
  );
}
