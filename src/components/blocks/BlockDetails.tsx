import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Clock, Wallet, Pin, Pencil, Trash2, AlertTriangle,
  Navigation, Compass, Train, Footprints, Bus, Car, Shuffle, ChevronRight,
} from 'lucide-react';
import type { ItineraryActivity, TravelGroup, TransportMode } from '@/types';
import { inferBlockType, blockTypeMeta, formatTimeRange } from '@/lib/blockHelpers';
import { Button } from '@/components/Button';

interface BlockDetailsProps {
  activity: ItineraryActivity | null;
  group: TravelGroup | null;
  onClose: () => void;
  onPin?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onReplace?: () => void;
  onFindNearby?: () => void;
}

export function BlockDetails({ activity, group, onClose, onPin, onEdit, onRemove, onReplace, onFindNearby }: BlockDetailsProps) {
  return (
    <AnimatePresence>
      {activity && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-midnight-900/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-sand-50 shadow-2xl"
          >
            <DetailsContent
              activity={activity}
              group={group}
              onClose={onClose}
              onPin={onPin}
              onEdit={onEdit}
              onRemove={onRemove}
              onReplace={onReplace}
              onFindNearby={onFindNearby}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailsContent({ activity, group, onClose, onPin, onEdit, onRemove, onReplace, onFindNearby }: {
  activity: ItineraryActivity;
  group: TravelGroup | null;
  onClose: () => void;
  onPin?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onReplace?: () => void;
  onFindNearby?: () => void;
}) {
  const blockType = inferBlockType(activity);
  const meta = blockTypeMeta(blockType);
  const timeRange = formatTimeRange(activity.time, activity.duration);
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand-200 bg-sand-50/95 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-sand-200 text-2xl">
            {activity.emoji}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
            <h2 className="text-lg font-extrabold text-midnight-900">{activity.title}</h2>
          </div>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-midnight-400 hover:bg-sand-100">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Time + location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={15} className="text-midnight-400" />
            <span className="font-bold text-midnight-900">{timeRange}</span>
            {activity.duration && activity.duration !== '—' && (
              <span className="text-midnight-400">· {activity.duration}</span>
            )}
          </div>
          {activity.location && (
            <div className="flex items-center gap-2 text-sm text-midnight-500">
              <MapPin size={15} className="text-midnight-400" />
              {activity.location}
            </div>
          )}
          {activity.cost !== undefined && activity.cost > 0 && (
            <div className="flex items-center gap-2 text-sm text-midnight-500">
              <Wallet size={15} className="text-midnight-400" />
              RM {activity.cost}
            </div>
          )}
        </div>

        {/* Transport */}
        {activity.transport && (() => {
          const modeIcon: Record<TransportMode, typeof Train> = { train: Train, walking: Footprints, bus: Bus, taxi: Car };
          const modeLabel: Record<TransportMode, string> = { train: 'Train (MRT)', walking: 'Walk', bus: 'Bus', taxi: 'Taxi' };
          const ModeIcon = modeIcon[activity.transport.mode];
          return (
            <div className="rounded-lg border border-sand-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-midnight-400 mb-2">
                <Navigation size={12} /> Transport
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-midnight-700">
                <ModeIcon size={14} className="text-sky-500" />
                {modeLabel[activity.transport.mode]}
              </div>
              <p className="text-sm text-midnight-700 mt-1">
                {activity.transport.from} → {activity.transport.to}
              </p>
              <p className="text-xs text-midnight-400 mt-0.5">
                {activity.transport.duration}
                {activity.transport.cost > 0 && ` · RM ${activity.transport.cost}`}
              </p>
            </div>
          );
        })()}

        {/* Note */}
        {activity.optimizationNote && (
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-4 py-3">
            <p className="text-sm text-sky-700 italic">{activity.optimizationNote}</p>
          </div>
        )}

        {/* Have free time? / Find Plan B — featured actions */}
        {(onFindNearby || onReplace) && (
          <div className="space-y-2">
            {onFindNearby && (
              <button
                onClick={onFindNearby}
                className="flex w-full items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3.5 text-left transition-colors hover:bg-sky-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-sky-200 text-sky-600">
                  <Compass size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-midnight-900">Have free time?</p>
                  <p className="text-xs text-midnight-500">Find something nearby that fits the gap</p>
                </div>
                <ChevronRight size={16} className="text-sky-400 shrink-0" />
              </button>
            )}
            {onReplace && (
              <button
                onClick={onReplace}
                className="flex w-full items-center gap-3 rounded-lg border border-coral-200 bg-coral-50 px-4 py-3.5 text-left transition-colors hover:bg-coral-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-coral-200 text-coral-500">
                  <Shuffle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-midnight-900">Not feeling this block?</p>
                  <p className="text-xs text-midnight-500">Find a Plan B alternative</p>
                </div>
                <ChevronRight size={16} className="text-coral-400 shrink-0" />
              </button>
            )}
          </div>
        )}

        {/* Status badge */}
        {activity.status === 'affected' && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">This block may be affected by a disruption</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 border-t border-sand-200 bg-sand-50/95 px-5 py-4 backdrop-blur-md">
        <div className="flex flex-wrap gap-2">
          {onPin && (
            <Button size="sm" variant="secondary" onClick={onPin}>
              <Pin size={14} /> {activity.pinned ? 'Unpin' : 'Pin to Info'}
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Pencil size={14} /> Edit
            </Button>
          )}
          {onRemove && (
            <Button size="sm" variant="ghost" onClick={onRemove}>
              <Trash2 size={14} /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
