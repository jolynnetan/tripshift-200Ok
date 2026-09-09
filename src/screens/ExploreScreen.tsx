import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Compass, ArrowRight } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import type { Destination } from '@/types';
import { DESTINATIONS } from '@/data/tripsData';

interface ExploreScreenProps {
  onSelectDestination: (dest: Destination) => void;
  onPlanTrip: (dest: Destination) => void;
}

export function ExploreScreen({ onSelectDestination, onPlanTrip }: ExploreScreenProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return DESTINATIONS;
    const q = query.toLowerCase();
    return DESTINATIONS.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.travelStyle.toLowerCase().includes(q) ||
      d.activities.some((a) => a.toLowerCase().includes(q)) ||
      d.interests.some((i) => i.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-midnight-900">
          Explore destinations
        </h1>
        <p className="mt-1 text-sm text-midnight-400">
          Search for a place or describe the trip you want.
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-300" strokeWidth={2.2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'Tokyo' or 'beach trip in November' or 'food and culture'"
          className="w-full rounded-xl bg-white border border-sand-200 pl-12 pr-4 py-3.5 text-base font-medium text-midnight-900 placeholder:text-midnight-300 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
        />
      </motion.div>

      {/* Results — destination cards are appropriate here */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dest, i) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card hover className="overflow-hidden cursor-pointer h-full" >
              <div onClick={() => onSelectDestination(dest)}>
                {/* Image */}
                <div className="relative h-40 bg-midnight-200">
                  <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-lg font-extrabold">{dest.name}</p>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <MapPin size={10} /> {dest.country}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-midnight-400 mb-2 line-clamp-2">{dest.description}</p>
                  <div className="flex items-center gap-3 text-xs text-midnight-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {dest.duration}</span>
                    <span className="flex items-center gap-1"><Compass size={11} /> {dest.travelStyle.split(' + ')[0]}</span>
                  </div>

                  {/* Price — simple text, not nested card */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-midnight-500">
                      <span>Flight</span><span className="font-medium">from RM {dest.flightFrom}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-midnight-500">
                      <span>Hotel</span><span className="font-medium">from RM {dest.hotelFrom}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-midnight-500">
                      <span>Activities</span><span className="font-medium">from RM {dest.activitiesFrom}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-midnight-500">
                      <span>Transport & Food</span><span className="font-medium">from RM {dest.transportFoodFrom}</span>
                    </div>
                    <div className="pt-2 border-t border-sand-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-midnight-700">Estimated total</span>
                      <span className="text-sm font-extrabold text-midnight-900">from RM {dest.estimatedFrom.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button size="sm" fullWidth variant="secondary" onClick={(e) => { e.stopPropagation(); onPlanTrip(dest); }}>
                    Plan This Trip
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-midnight-400">No destinations found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
