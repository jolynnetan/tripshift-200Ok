import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Train, Check, ArrowRight, Tag } from 'lucide-react';
import type { Hotel } from '@/types';
import { Button } from '@/components/Button';

interface HotelCardProps {
  hotel: Hotel;
  isSelected: boolean;
  onSelect: () => void;
}

export function HotelCard({ hotel, isSelected, onSelect }: HotelCardProps) {
  const highestPrice = Math.max(...hotel.offers.map((o) => o.price));
  const savings = highestPrice - (hotel.bestPrice ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl border bg-white overflow-hidden transition-all ${
        isSelected
          ? 'border-sky-400 ring-1 ring-sky-200'
          : 'border-sand-200 hover:border-sand-300'
      }`}
    >
      {isSelected && (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
          Selected
        </span>
      )}

      {/* Image */}
      <div className="relative h-40 bg-sand-100 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
          <Star size={12} className="text-amber-500" fill="currentColor" strokeWidth={0} />
          <span className="text-xs font-bold text-midnight-900">{hotel.rating}</span>
          <span className="text-xs text-midnight-400">({hotel.reviews.toLocaleString()})</span>
        </div>
      </div>

      <div className="p-5">
        {/* Name + area */}
        <div className="mb-3">
          <h3 className="font-bold text-midnight-900 text-base">{hotel.name}</h3>
          <p className="flex items-center gap-1 text-xs text-midnight-400 mt-0.5">
            <MapPin size={12} strokeWidth={2.2} />
            {hotel.area} · {hotel.distanceFromCenter}
          </p>
        </div>

        {/* Location suitability — simple text, not mini-cards */}
        <div className="flex items-center gap-4 mb-4 text-xs text-midnight-500">
          <span className="flex items-center gap-1.5">
            <Clock size={12} strokeWidth={2.2} />
            {hotel.travelTimeToActivities}
          </span>
          <span className="flex items-center gap-1.5">
            <Train size={12} strokeWidth={2.2} />
            {hotel.nearbyTransport}
          </span>
        </div>

        {/* Provider offers */}
        <div className="space-y-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400">
            Price comparison
          </p>
          {hotel.offers.map((offer) => {
            const isBest = offer.price === hotel.bestPrice;
            return (
              <div
                key={offer.provider.id}
                className={`flex items-center justify-between py-2 ${
                  isBest ? 'border-l-2 border-emerald-400 pl-3' : 'pl-3'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-midnight-700">{offer.provider.name}</span>
                  {isBest && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase text-emerald-600">
                      <Tag size={10} strokeWidth={2.4} />
                      Best price
                    </span>
                  )}
                  {offer.refundable && (
                    <span className="text-[10px] text-emerald-600">Refundable</span>
                  )}
                </div>
                <span className={`text-sm font-bold tabular-nums ${isBest ? 'text-emerald-700' : 'text-midnight-900'}`}>
                  RM{offer.price}
                </span>
              </div>
            );
          })}
        </div>

        {/* Savings + CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-sand-100">
          <div>
            <p className="text-2xl font-extrabold text-midnight-900 tabular-nums">
              RM{hotel.bestPrice}
            </p>
            {savings > 0 && (
              <p className="text-xs font-medium text-emerald-600">
                Save RM{savings} vs highest offer
              </p>
            )}
          </div>
          <Button size="sm" variant={isSelected ? 'secondary' : 'primary'} onClick={onSelect}>
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
      </div>
    </motion.div>
  );
}
