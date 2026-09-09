import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface BudgetSliderProps {
  budget: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  total: number;
  remaining: number;
}

export function BudgetSlider({ budget, min, max, onChange, total, remaining }: BudgetSliderProps) {
  const pct = Math.min(100, (total / budget) * 100);
  const over = total > budget;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={16} className="text-sky-500" strokeWidth={2.4} />
        <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400">
          Trip Budget
        </h3>
      </div>

      {/* Current budget */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-midnight-400 font-medium">Budget</p>
          <p className="text-2xl font-extrabold text-midnight-900 tabular-nums">
            RM {budget.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-midnight-400 font-medium">Remaining</p>
          <p className={`text-xl font-bold tabular-nums ${remaining >= 0 ? 'text-emerald-600' : 'text-coral-500'}`}>
            RM {remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={budget}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-sand-100 budget-slider"
          style={{
            background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((budget - min) / (max - min)) * 100}%, #f5f5f0 ${((budget - min) / (max - min)) * 100}%, #f5f5f0 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-medium text-midnight-300">RM {min.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-midnight-300">RM {max.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-sand-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400">Estimated</p>
          <p className="text-sm font-bold text-midnight-900 tabular-nums">RM {total.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400">Remaining</p>
          <p className={`text-sm font-bold tabular-nums ${remaining >= 0 ? 'text-emerald-600' : 'text-coral-500'}`}>
            RM {remaining.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400">% Used</p>
          <p className={`text-sm font-bold tabular-nums ${over ? 'text-coral-500' : 'text-midnight-900'}`}>
            {Math.round(pct)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-sand-100 overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          className={`h-full rounded-full ${over ? 'bg-coral-500' : 'bg-sky-500'}`}
        />
      </div>
    </div>
  );
}
