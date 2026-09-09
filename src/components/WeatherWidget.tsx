import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudLightning, AlertTriangle } from 'lucide-react';
import type { WeatherForecast } from '@/types';

interface WeatherWidgetProps {
  forecast: WeatherForecast[];
}

const iconMap = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
};

const colorMap = {
  sunny: 'text-amber-500',
  cloudy: 'text-midnight-400',
  rain: 'text-sky-500',
  storm: 'text-coral-500',
};

export function WeatherWidget({ forecast }: WeatherWidgetProps) {
  const hasAlert = forecast.some((f) => f.alert);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400">
          Weather
        </h3>
        {hasAlert && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-coral-600">
            <AlertTriangle size={11} strokeWidth={2.4} />
            Alert
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {forecast.map((day, i) => {
          const Icon = iconMap[day.icon];
          const hasDayAlert = !!day.alert;
          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`shrink-0 w-[4.5rem] rounded-lg p-3 text-center ${
                hasDayAlert
                  ? 'bg-coral-50 border border-coral-200'
                  : 'bg-sand-50'
              }`}
            >
              <p className="text-[10px] font-bold text-midnight-500 mb-1.5">{day.day}</p>
              <Icon
                size={24}
                className={`mx-auto ${colorMap[day.condition]}`}
                strokeWidth={2}
              />
              <p className="text-xs font-bold text-midnight-900 mt-1.5 tabular-nums">
                {day.high}°
              </p>
              <p className="text-[10px] text-midnight-400 tabular-nums">{day.low}°</p>
            </motion.div>
          );
        })}
      </div>

      {hasAlert && (
        <div className="mt-3 flex items-start gap-2 text-xs text-coral-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" strokeWidth={2.4} />
          <p className="leading-relaxed">
            {forecast.find((day) => day.alert)?.day}: {forecast.find((day) => day.alert)?.alert}. Outdoor activities may be affected.
          </p>
        </div>
      )}
    </div>
  );
}
