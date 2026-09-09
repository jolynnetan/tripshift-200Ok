import { useMemo } from 'react';
import { Calendar } from 'lucide-react';

export function CurrentDate() {
  const dateStr = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-midnight-400">
      <Calendar size={13} strokeWidth={2.2} />
      <span>Today · {dateStr}</span>
    </div>
  );
}
