import { ArrowRight, Check, Plane, Hotel as HotelIcon } from 'lucide-react';
import type { FlightOffer, Hotel } from '@/types';

interface BookingSummaryProps {
  flight: FlightOffer | null;
  hotel: Hotel | null;
  onExplore: () => void;
}

export function BookingSummary({ flight, hotel, onExplore }: BookingSummaryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400">
          Bookings
        </h3>
        <button
          onClick={onExplore}
          className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
        >
          Compare
          <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </div>

      <div className="space-y-0 divide-y divide-sand-100">
        {/* Flight */}
        <div className="flex items-center gap-3 py-3">
          <div className="h-9 w-9 rounded-lg bg-midnight-900 flex items-center justify-center shrink-0">
            <Plane size={15} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-midnight-400 font-medium">Flight</p>
            {flight ? (
              <p className="text-sm font-bold text-midnight-900 truncate">
                {flight.airline} · {flight.departureTime}–{flight.arrivalTime}
              </p>
            ) : (
              <p className="text-sm text-midnight-400">Not selected</p>
            )}
          </div>
          {flight && (
            <div className="text-right">
              <p className="text-sm font-bold text-midnight-900 tabular-nums">
                RM{flight.totalPrice.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Hotel */}
        <div className="flex items-center gap-3 py-3">
          <div className="h-9 w-9 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
            <HotelIcon size={15} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-midnight-400 font-medium">Hotel</p>
            {hotel ? (
              <p className="text-sm font-bold text-midnight-900 truncate">
                {hotel.name}
              </p>
            ) : (
              <p className="text-sm text-midnight-400">Not selected</p>
            )}
          </div>
          {hotel && (
            <div className="text-right">
              <p className="text-sm font-bold text-midnight-900 tabular-nums">
                RM{hotel.bestPrice}
              </p>
            </div>
          )}
        </div>
      </div>

      {flight && hotel && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Check size={13} strokeWidth={2.4} />
          Flight and hotel confirmed
        </div>
      )}
    </div>
  );
}
