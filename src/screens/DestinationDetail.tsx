import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Compass, Wallet, Star, Plane, Hotel as HotelIcon, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/Button';
import { FlightCard } from '@/components/FlightCard';
import { HotelCard } from '@/components/HotelCard';
import { MapModal } from '@/components/MapModal';
import type { Destination, FlightOffer, Hotel } from '@/types';
import { FLIGHT_OFFERS, HOTELS } from '@/data/comparisonData';

interface DestinationDetailProps {
  destination: Destination;
  onBack: () => void;
  onContinuePlanning: (dest: Destination, flight: FlightOffer | null, hotel: Hotel | null) => void;
}

export function DestinationDetail({ destination, onBack, onContinuePlanning }: DestinationDetailProps) {
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(FLIGHT_OFFERS[0]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(HOTELS[0]);
  const [tab, setTab] = useState<'overview' | 'flights' | 'hotels'>('overview');
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-midnight-400 hover:text-midnight-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Explore
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6"
      >
        <img src={destination.image} alt={destination.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/80 via-midnight-950/30 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <button onClick={() => setMapOpen(true)} className="flex items-center gap-1.5 text-white/70 text-xs mb-1 hover:text-white transition-colors">
            <MapPin size={12} /> {destination.country}
          </button>
          <button onClick={() => setMapOpen(true)} className="block text-left hover:text-sky-200 transition-colors">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{destination.name}</h1>
          </button>
          <p className="text-sm text-white/70 mt-1">{destination.duration} · {destination.travelStyle}</p>
        </div>
      </motion.div>

      {/* Price estimate — simple text row, not 4 cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-midnight-500 mb-6 pb-6 border-b border-sand-100"
      >
        <span>Flight from <span className="font-bold text-midnight-900">RM {destination.flightFrom}</span></span>
        <span>Hotel from <span className="font-bold text-midnight-900">RM {destination.hotelFrom}</span></span>
        <span>Activities from <span className="font-bold text-midnight-900">RM {destination.activitiesFrom}</span></span>
        <span className="text-sky-600 font-bold">Estimated total from RM {destination.estimatedFrom.toLocaleString()}</span>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5">
        {[
          { id: 'overview' as const, label: 'Overview', icon: Compass },
          { id: 'flights' as const, label: 'Flights', icon: Plane },
          { id: 'hotels' as const, label: 'Hotels', icon: HotelIcon },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === t.id ? 'bg-midnight-900 text-white' : 'bg-white text-midnight-500 border border-sand-200 hover:bg-sand-50'
              }`}
            >
              <Icon size={16} strokeWidth={2.2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-3">About {destination.name}</h3>
            <p className="text-sm text-midnight-600 leading-relaxed">{destination.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1">Best time to visit</p>
                <p className="text-sm font-semibold text-midnight-700">{destination.bestTime}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1">Recommended duration</p>
                <p className="text-sm font-semibold text-midnight-700">{destination.duration}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sand-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-3">Key activities</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {destination.activities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 text-sm font-medium text-midnight-700">
                  <Star size={12} fill="currentColor" strokeWidth={0} className="text-coral-500" />
                  {a}
                </span>
              ))}
            </div>
          </div>

          <Button size="lg" fullWidth onClick={() => onContinuePlanning(destination, selectedFlight, selectedHotel)}>
            Start Planning
            <ArrowRight size={18} strokeWidth={2.5} />
          </Button>
        </motion.div>
      )}

      {tab === 'flights' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid md:grid-cols-2 gap-4">
            {FLIGHT_OFFERS.map((offer) => (
              <FlightCard
                key={offer.id}
                offer={offer}
                isSelected={selectedFlight?.id === offer.id}
                onSelect={() => setSelectedFlight(offer)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'hotels' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid md:grid-cols-2 gap-4">
            {HOTELS.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isSelected={selectedHotel?.id === hotel.id}
                onSelect={() => setSelectedHotel(hotel)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Continue bar — simple, not a card */}
      {tab !== 'overview' && (
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-sand-100">
          <div className="flex items-center gap-4">
            {selectedFlight && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check size={13} strokeWidth={2.5} /> Flight selected
              </span>
            )}
            {selectedHotel && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check size={13} strokeWidth={2.5} /> Hotel selected
              </span>
            )}
          </div>
          <Button size="md" onClick={() => onContinuePlanning(destination, selectedFlight, selectedHotel)}>
            Continue Planning
            <ArrowRight size={16} strokeWidth={2.5} />
          </Button>
        </div>
      )}

      <MapModal open={mapOpen} onClose={() => setMapOpen(false)} query={destination.name} subtitle={destination.country} />
    </div>
  );
}
