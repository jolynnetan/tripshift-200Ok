import type { ItineraryActivity, BlockType, GroupBlock } from '@/types';

export function inferBlockType(activity: ItineraryActivity): BlockType {
  if (activity.blockType) return activity.blockType;
  const cat = activity.category?.toLowerCase() ?? '';
  if (cat === 'food') return 'food';
  if (cat === 'travel' || cat === 'transport') return 'transport';
  if (cat === 'stay' || cat === 'hotel') return 'stay';
  return 'activity';
}

export function blockTypeMeta(type: BlockType): { label: string; color: string; dot: string } {
  switch (type) {
    case 'food': return { label: 'Food', color: 'text-amber-600', dot: 'bg-amber-400' };
    case 'transport': return { label: 'Transport', color: 'text-sky-600', dot: 'bg-sky-400' };
    case 'stay': return { label: 'Stay', color: 'text-violet-600', dot: 'bg-violet-400' };
    default: return { label: 'Activity', color: 'text-emerald-600', dot: 'bg-emerald-400' };
  }
}

export function computeEndTime(time: string, duration?: string): string {
  if (!duration || duration === '—' || duration === 'Flexible') return time;
  const match = duration.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h|min|m)/i);
  if (!match) return time;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const [h, m] = time.split(':').map(Number);
  let totalMin = h * 60 + m;
  if (unit.startsWith('h')) totalMin += value * 60;
  else totalMin += value;
  totalMin = totalMin % (24 * 60);
  const eh = Math.floor(totalMin / 60);
  const em = Math.floor(totalMin % 60);
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

export function formatTimeRange(time: string, duration?: string): string {
  const end = computeEndTime(time, duration);
  if (end === time) return time;
  return `${time}–${end}`;
}

export function getPinnedActivities(allDays: { activities: ItineraryActivity[] }[]): ItineraryActivity[] {
  return allDays.flatMap((d) => d.activities).filter((a) => a.pinned);
}

export function getGroupBlocksForDay(day: { groupBlocks?: GroupBlock[] }): GroupBlock[] {
  return day.groupBlocks ?? [];
}

export function isActivityInGroup(activity: ItineraryActivity): boolean {
  return !!activity.groupBlockId;
}
