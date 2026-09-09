import { motion } from 'framer-motion';
import { Plane, Hotel, Train, ArrowRight } from 'lucide-react';
import type { AIRecommendation } from '@/types';
import { Button } from '@/components/Button';

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onViewFlights: () => void;
}

export function AIRecommendationCard({ recommendation, onViewFlights }: AIRecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl overflow-hidden border border-sand-200 bg-white"
    >
      <div className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-4">
          Recommended for your trip
        </h3>

        <div className="grid sm:grid-cols-3 gap-0 sm:gap-6 mb-5">
          <div className="border-b sm:border-b-0 sm:border-r border-sand-100 pb-4 sm:pb-0 sm:pr-6">
            <div className="flex items-center gap-1.5 text-midnight-400 mb-2">
              <Plane size={14} strokeWidth={2.2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Flight</span>
            </div>
            <p className="text-sm font-bold text-midnight-900">{recommendation.flightOffer.airline}</p>
            <p className="text-xs text-midnight-400">{recommendation.flightOffer.provider.name}</p>
            <p className="text-lg font-extrabold text-midnight-900 mt-1.5 tabular-nums">
              RM{recommendation.flightOffer.totalPrice.toLocaleString()}
            </p>
          </div>

          <div className="border-b sm:border-b-0 sm:border-r border-sand-100 pb-4 sm:pb-0 sm:pr-6 pt-4 sm:pt-0">
            <div className="flex items-center gap-1.5 text-midnight-400 mb-2">
              <Hotel size={14} strokeWidth={2.2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Hotel</span>
            </div>
            <p className="text-sm font-bold text-midnight-900">{recommendation.hotel.name}</p>
            <p className="text-xs text-midnight-400">{recommendation.hotel.bestPriceProvider}</p>
            <p className="text-lg font-extrabold text-midnight-900 mt-1.5 tabular-nums">
              RM{recommendation.hotelPrice}
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <div className="flex items-center gap-1.5 text-midnight-400 mb-2">
              <Train size={14} strokeWidth={2.2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Transport</span>
            </div>
            <p className="text-sm font-bold text-midnight-900">{recommendation.transport}</p>
            <p className="text-xs text-midnight-400">Airport to city</p>
            <p className="text-lg font-extrabold text-midnight-900 mt-1.5 tabular-nums">
              RM{recommendation.transportCost}
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t border-sand-100">
          <div>
            <p className="text-xs font-medium text-midnight-400 uppercase tracking-wider">Estimated total</p>
            <p className="text-2xl font-extrabold text-midnight-900 tabular-nums">
              RM{recommendation.estimatedTotal.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-emerald-600">Under budget</p>
            <p className="text-base font-bold text-emerald-600 tabular-nums">
              RM{(2500 - recommendation.estimatedTotal).toLocaleString()} remaining
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-midnight-500 leading-relaxed">
          {recommendation.reason}
        </p>
      </div>

      <div className="px-5 py-3 border-t border-sand-100 flex items-center justify-between bg-sand-50/50">
        <p className="text-xs text-midnight-400">
          Prices update in real time across providers.
        </p>
        <Button size="sm" variant="ghost" onClick={onViewFlights}>
          Compare all options
          <ArrowRight size={15} strokeWidth={2.5} />
        </Button>
      </div>
    </motion.div>
  );
}
