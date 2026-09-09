import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, Pin, X } from 'lucide-react';
import type { Trip, TravelGroup, ItineraryActivity } from '@/types';
import { Button } from '@/components/Button';

interface TripInfoProps {
  trip: Trip;
  group: TravelGroup | null;
  pinnedBlocks: ItineraryActivity[];
  onUnpin?: (activityId: string) => void;
}

export function TripInfo({ trip, group, pinnedBlocks, onUnpin }: TripInfoProps) {
  const travellers = group?.travellers ?? [];
  const interests = [...new Set(travellers.flatMap((t) => t.interests))].slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Core info */}
      <div className="rounded-xl border border-sand-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-midnight-400">Trip Info</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <InfoRow icon={<MapPin size={13} />} label="Destination" value={`${trip.emoji} ${trip.destination}`} />
          <InfoRow icon={<Calendar size={13} />} label="Dates" value={`${trip.startDate}–${trip.endDate}`} />
          <InfoRow
            icon={<Users size={13} />}
            label="Travelers"
            value={trip.travelType === 'solo' ? 'Solo trip' : `${travellers.length} travelers`}
          />
          <InfoRow icon={<Wallet size={13} />} label="Budget" value={`RM ${trip.budget.toLocaleString()}`} />
        </div>

        {/* Shared preferences */}
        {interests.length > 0 && (
          <div className="mt-4 pt-3 border-t border-sand-100">
            <p className="text-xs font-semibold text-midnight-400 mb-2">Shared preferences</p>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => (
                <span key={interest} className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-semibold text-coral-700">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pinned blocks */}
      <PinnedBlocks pinnedBlocks={pinnedBlocks} onUnpin={onUnpin} />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-midnight-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-midnight-900">{value}</p>
    </div>
  );
}

function PinnedBlocks({ pinnedBlocks, onUnpin }: { pinnedBlocks: ItineraryActivity[]; onUnpin?: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-sand-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pin size={14} className="text-coral-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-midnight-400">Pinned Blocks</span>
      </div>

      {pinnedBlocks.length === 0 ? (
        <p className="text-sm text-midnight-400 py-2">
          No pinned blocks yet. Tap any block and pin it to keep important info visible here.
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {pinnedBlocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 rounded-lg border border-sand-100 bg-sand-50/50 px-3 py-2"
              >
                <span className="text-lg">{block.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-midnight-900 truncate">{block.title}</p>
                  <p className="text-xs text-midnight-400">
                    {block.time}
                    {block.location && ` · ${block.location}`}
                  </p>
                </div>
                {onUnpin && (
                  <button
                    onClick={() => onUnpin(block.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-midnight-300 hover:bg-sand-100 hover:text-midnight-500"
                  >
                    <X size={13} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
