import { motion } from 'framer-motion';
import type { DragEvent } from 'react';
import { Clock, MapPin, Wallet, GripVertical, Pin, AlertTriangle, Check, Shuffle } from 'lucide-react';
import type { ItineraryActivity } from '@/types';
import { inferBlockType, blockTypeMeta, formatTimeRange } from '@/lib/blockHelpers';

interface TripBlockProps {
  activity: ItineraryActivity;
  isPast?: boolean;
  isCurrent?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
  onPlanB?: () => void;
  compact?: boolean;
}

export function TripBlock({
  activity,
  isPast = false,
  isCurrent = false,
  isDragging = false,
  isDropTarget = false,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onPlanB,
  compact = false,
}: TripBlockProps) {
  const blockType = inferBlockType(activity);
  const meta = blockTypeMeta(blockType);
  const timeRange = formatTimeRange(activity.time, activity.duration);

  return (
    <motion.div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`relative flex items-start gap-3 px-1 py-2.5 transition-colors group ${
        isCurrent ? 'bg-sky-50/50 rounded-lg -mx-1 px-2' : 'hover:bg-sand-50/50 rounded-lg -mx-1 px-2'
      } ${isDropTarget ? 'ring-2 ring-sky-300 rounded-lg' : ''} ${isDragging ? 'cursor-grabbing' : ''} cursor-pointer`}
    >
      {/* Drag handle */}
      {onDragStart && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={12} className="text-midnight-300" />
        </div>
      )}

      {/* Timeline dot */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${
            isPast
              ? 'bg-sand-50 border-sand-200 opacity-50'
              : activity.planTag
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-sand-200'
          }`}
        >
          {activity.emoji}
        </div>
        {isPast && <Check size={10} className="text-emerald-500 mt-0.5" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-midnight-900 tabular-nums">{timeRange}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
          {isCurrent && <span className="text-[10px] font-bold uppercase text-sky-600">Upcoming</span>}
          {isPast && <span className="text-[10px] font-bold uppercase text-emerald-600">Done</span>}
          {activity.planTag && <span className="text-[10px] font-bold uppercase text-emerald-600">Plan {activity.planTag}</span>}
          {activity.pinned && <Pin size={10} className="text-coral-500 fill-coral-200" />}
          {activity.status === 'affected' && <AlertTriangle size={11} className="text-amber-500" />}
        </div>
        <p className={`text-sm font-semibold mt-0.5 ${isPast ? 'text-midnight-400 line-through' : 'text-midnight-900'}`}>
          {activity.title}
        </p>
        {!compact && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {activity.location && (
              <span className="flex items-center gap-1 text-xs text-midnight-400">
                <MapPin size={10} /> {activity.location}
              </span>
            )}
            {activity.duration && activity.duration !== '—' && (
              <span className="flex items-center gap-1 text-xs text-midnight-400">
                <Clock size={10} /> {activity.duration}
              </span>
            )}
            {activity.cost !== undefined && activity.cost > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-midnight-500">
                <Wallet size={10} /> RM {activity.cost}
              </span>
            )}
          </div>
        )}
        {activity.optimizationNote && !compact && (
          <p className="mt-1.5 text-xs text-sky-600 italic">{activity.optimizationNote}</p>
        )}
        {onPlanB && !isPast && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlanB(); }}
            className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-coral-500 hover:text-coral-700 transition-colors"
          >
            <Shuffle size={10} strokeWidth={2.4} /> Find Plan B
          </button>
        )}
      </div>
    </motion.div>
  );
}
