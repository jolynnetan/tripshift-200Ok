import { useState } from 'react';
import type { DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, MapPin, Clock, Pin, GripVertical } from 'lucide-react';
import type { ItineraryActivity, GroupBlock as GroupBlockType } from '@/types';
import { TripBlock } from './TripBlock';
import { formatTimeRange, computeEndTime } from '@/lib/blockHelpers';

interface GroupBlockProps {
  group: GroupBlockType;
  activities: ItineraryActivity[];
  isDragging?: boolean;
  isDropTarget?: boolean;
  onClick?: () => void;
  onChildClick?: (activity: ItineraryActivity) => void;
  onPlanB?: (activity: ItineraryActivity) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
  onToggleCollapse?: () => void;
}

export function GroupBlock({
  group,
  activities,
  isDragging = false,
  isDropTarget = false,
  onClick,
  onChildClick,
  onPlanB,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onToggleCollapse,
}: GroupBlockProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(group.collapsed ?? false);
  const collapsed = group.collapsed ?? internalCollapsed;
  const timeRange = formatTimeRange(group.startTime, undefined);
  const lastActivity = activities[activities.length - 1];
  const endTime = lastActivity
    ? computeEndTime(lastActivity.time, lastActivity.duration)
    : group.endTime;

  return (
    <motion.div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: isDragging ? 0.4 : 1 }}
      className={`relative rounded-lg border border-sky-200 bg-sky-50/30 transition-all ${
        isDropTarget ? 'ring-2 ring-sky-300' : ''
      } ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      {/* Group header */}
      <div
        className="flex items-center gap-3 px-3 py-3 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); setInternalCollapsed(!collapsed); }}
      >
        {onDragStart && (
          <GripVertical size={12} className="text-midnight-300 opacity-0 group-hover:opacity-100" />
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-white text-lg">
          {group.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-midnight-900">{group.title}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Group</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-midnight-400">
              <Clock size={10} /> {timeRange}–{endTime}
            </span>
            {group.location && (
              <span className="flex items-center gap-1 text-xs text-midnight-400">
                <MapPin size={10} /> {group.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-midnight-400">
              <Users size={10} /> {activities.length} activities
            </span>
          </div>
        </div>
        <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-midnight-400" />
        </motion.div>
      </div>

      {/* Child blocks */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-0">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-sky-200" />
              {activities.map((act) => (
                <TripBlock
                  key={act.id}
                  activity={act}
                  compact
                  onClick={() => onChildClick?.(act)}
                  onPlanB={onPlanB ? () => onPlanB(act) : undefined}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin indicator */}
      {activities.some((a) => a.pinned) && (
        <div className="absolute -top-1 -right-1">
          <Pin size={12} className="text-coral-500 fill-coral-200" />
        </div>
      )}
    </motion.div>
  );
}
