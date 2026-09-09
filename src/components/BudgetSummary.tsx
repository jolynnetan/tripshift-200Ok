import { motion } from 'framer-motion';
import { Wallet, Plane, Hotel, Bus, UtensilsCrossed, Ticket } from 'lucide-react';
import { Card } from '@/components/Card';
import type { BudgetItem } from '@/types';

interface BudgetSummaryProps {
  items: BudgetItem[];
  total: number;
  budget: number;
}

const iconMap = {
  plane: Plane,
  hotel: Hotel,
  transport: Bus,
  food: UtensilsCrossed,
  activities: Ticket,
};

export function BudgetSummary({ items, total, budget }: BudgetSummaryProps) {
  const remaining = budget - total;
  const pct = Math.min(100, (total / budget) * 100);
  const over = total > budget;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Wallet size={18} className="text-sky-500" strokeWidth={2.4} />
        <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400">
          Estimated Trip Cost
        </h3>
      </div>

      <div className="space-y-2.5 mb-5">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon];
          return (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2.5 text-midnight-600">
                <Icon size={15} className="text-midnight-400" strokeWidth={2.2} />
                {item.category}
              </span>
              <span className="font-semibold text-midnight-900 tabular-nums">
                RM{item.amount.toLocaleString()}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full bg-sand-100 overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${over ? 'bg-coral-500' : 'bg-sky-500'}`}
        />
      </div>

      <div className="flex items-end justify-between pt-3 border-t border-sand-100">
        <div>
          <p className="text-xs text-midnight-400 font-semibold">Total</p>
          <p className="text-xl font-extrabold text-midnight-900 tabular-nums">
            RM{total.toLocaleString()}
            <span className="text-sm font-semibold text-midnight-400"> / RM{budget.toLocaleString()}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-midnight-400 font-semibold">Remaining</p>
          <p className={`text-xl font-extrabold tabular-nums flex items-center gap-1.5 justify-end ${remaining < 0 ? 'text-coral-500' : 'text-emerald-600'}`}>
            {remaining >= 0 && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
            RM{remaining.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
