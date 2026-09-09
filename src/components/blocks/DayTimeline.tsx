import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import type { ItineraryActivity, ItineraryDay } from '@/types';
import { TripBlock } from './TripBlock';

interface DayTimelineProps {
  day: ItineraryDay;
  isToday: boolean;
  currentTime: string;
  currentActivityId?: string;
  onBlockClick: (activity: ItineraryActivity) => void;
  onPlanB?: (activity: ItineraryActivity) => void;
  onReorder: (dayNumber: number, fromId: string, toId: string) => void;
  onGroupToggle?: (groupBlockId: string) => void;
}

export function DayTimeline({
  day,
  isToday,
  currentTime,
  currentActivityId,
  onBlockClick,
  onPlanB,
  onReorder,
}: DayTimelineProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  // Grouping is disabled — every activity always renders as its own stacked card,
  // regardless of any groupBlocks defined on the day.
  const items = [...day.activities].sort((a, b) => a.time.localeCompare(b.time));

  const handleDragEnd = () => {
    if (draggingId && dropTargetId && draggingId !== dropTargetId) {
      onReorder(day.day, draggingId, dropTargetId);
    }
    setDraggingId(null);
    setDropTargetId(null);
    dragOverId.current = null;
  };

  const handleDragOver = (id: string, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (id !== dragOverId.current) {
      dragOverId.current = id;
      setDropTargetId(id);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-[1.3rem] top-3 bottom-3 w-px bg-sand-200" />
      <div className="space-y-0">
        {items.map((activity) => (
          <TripBlock
            key={activity.id}
            activity={activity}
            isPast={isToday && activity.time < currentTime}
            isCurrent={isToday && currentActivityId === activity.id}
            onClick={() => onBlockClick(activity)}
            onPlanB={onPlanB ? () => onPlanB(activity) : undefined}
            onDragStart={() => setDraggingId(activity.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => handleDragOver(activity.id, event)}
            isDragging={draggingId === activity.id}
            isDropTarget={dropTargetId === activity.id}
          />
        ))}
      </div>
    </div>
  );
}
