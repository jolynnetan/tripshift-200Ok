import { motion } from 'framer-motion';
import { Plane, Clock, Briefcase, Check, X, Star, ArrowRight } from 'lucide-react';
import type { FlightOffer } from '@/types';
import { Button } from '@/components/Button';

interface FlightCardProps {
  offer: FlightOffer;
  isSelected: boolean;
  onSelect: () => void;
}

export function FlightCard({ offer, isSelected, onSelect }: FlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl border bg-white p-5 transition-all ${
        isSelected
          ? 'border-sky-400 ring-1 ring-sky-200'
          : offer.bestValue
            ? 'border-emerald-200'
            : 'border-sand-200 hover:border-sand-300'
      }`}
    >
      {offer.bestValue && !isSelected && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-3 block">
          Best Value
        </span>
      )}
      {isSelected && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-3 block">
          Selected
        </span>
      )}

      {/* Airline + provider */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-midnight-900 flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-midnight-900 text-sm">{offer.airline}</p>
            <p className="text-xs text-midnight-400">via {offer.provider.name}</p>
          </div>
        </div>
        <span className="text-xs text-midnight-400">
          {offer.provider.type === 'airline' ? 'Airline Direct' : 'Travel Agency'}
        </span>
      </div>

      {/* Times */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="text-xl font-extrabold text-midnight-900 tabular-nums">{offer.departureTime}</p>
          <p className="text-[10px] text-midnight-400 font-medium">KUL</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-[11px] text-midnight-400 font-medium">{offer.duration}</p>
          <div className="relative w-full mt-1">
            <div className="h-px bg-sand-300 w-full" />
            <Plane size={13} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-500 bg-white px-0.5" />
          </div>
          <p className="text-[10px] text-midnight-400 mt-0.5">
            {offer.stops === 0 ? 'Direct' : `${offer.stops} stop`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-midnight-900 tabular-nums">{offer.arrivalTime}</p>
          <p className="text-[10px] text-midnight-400 font-medium">BKK</p>
        </div>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pb-4 border-b border-sand-100 text-xs text-midnight-500">
        <span className="flex items-center gap-1.5">
          <Briefcase size={12} className="text-midnight-400" strokeWidth={2.2} />
          {offer.baggage}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="text-midnight-400" strokeWidth={2.2} />
          {offer.duration}
        </span>
        <span className={`flex items-center gap-1 ${offer.refundable ? 'text-emerald-600' : 'text-midnight-400'}`}>
          {offer.refundable ? <Check size={12} strokeWidth={2.4} /> : <X size={12} strokeWidth={2.4} />}
          {offer.refundable ? 'Refundable' : 'Non-refundable'}
        </span>
      </div>

      {/* Price + CTA */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-extrabold text-midnight-900 tabular-nums">
            RM{offer.totalPrice.toLocaleString()}
          </p>
          <p className="text-xs text-midnight-400">
            RM{offer.pricePerTraveller} per traveller
          </p>
        </div>
        <Button
          size="sm"
          variant={isSelected ? 'secondary' : 'primary'}
          onClick={onSelect}
        >
          {isSelected ? (
            <>Selected</>
          ) : (
            <>
              View Deal
              <ArrowRight size={15} strokeWidth={2.5} />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
