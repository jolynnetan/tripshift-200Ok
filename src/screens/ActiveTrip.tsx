import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Users, Wallet, Clock, AlertTriangle,
  CloudRain, Bus, Lock, Plane, Check, X, RotateCcw,
  Train, Footprints, Navigation, MoreVertical, Star, Pencil, Hotel as HotelIcon, Search, Compass,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { BudgetSlider } from '@/components/BudgetSlider';
import { WeatherWidget } from '@/components/WeatherWidget';
import { CurrentDate } from '@/components/CurrentDate';
import type { Trip, TravelGroup, DisruptionScenario, ItineraryActivity, PlanAlternative, ReasoningFactor, TransportMode } from '@/types';
import { ALL_DISRUPTION_SCENARIOS } from '@/data/itineraryData';
import { BUDGET_MIN, BUDGET_MAX } from '@/data/comparisonData';
import { scoreAlternative } from '@/lib/groupMatch';
import { computeTripSpend } from '@/state/useAppState';
import { SoloConnect } from '@/components/SoloConnect';
import { MapModal } from '@/components/MapModal';
import { SOSButton } from '@/components/SOSButton';
import { EditItineraryModal } from '@/components/EditItineraryModal';
import { TravellersSection } from '@/components/TravellersSection';
import { NearbyNow } from '@/components/NearbyNow';
import { DayTimeline } from '@/components/blocks/DayTimeline';
import { BlockDetails } from '@/components/blocks/BlockDetails';
import { TripInfo } from '@/components/blocks/TripInfo';
import { AdaptiveBlockRecommendation } from '@/components/blocks/AdaptiveBlockRecommendation';
import { getPinnedActivities } from '@/lib/blockHelpers';

interface ActiveTripProps {
  trip: Trip;
  group: TravelGroup | null;
  onBack: () => void;
  onSetBudget: (amount: number) => void;
  onApplyPlan: (scenarioId: string, alternativeId: string, targetActivityId?: string) => void;
  onRestorePlanA: () => void;
  onReplaceActivity?: (dayNumber: number, activityId: string, newActivity: ItineraryActivity) => void;
  onAddTraveller?: (traveller: Omit<import('@/types').Traveller, 'id'>) => void;
  onUpdateTraveller?: (id: string, traveller: Omit<import('@/types').Traveller, 'id'>) => void;
  onAddNearbyActivity?: (dayNumber: number, activity: ItineraryActivity) => void;
  onReorderBlocks?: (dayNumber: number, fromId: string, toId: string) => void;
  onTogglePin?: (activityId: string) => void;
  onToggleGroupCollapse?: (dayNumber: number, groupBlockId: string) => void;
  onReplaceBlock?: (dayNumber: number, activityId: string, newActivity: ItineraryActivity) => void;
  onUndoReplace?: () => void;
  initialView?: View;
}

const transportIcon: Record<TransportMode, typeof Train> = {
  train: Train, walking: Footprints, bus: Bus, taxi: Navigation,
};

const disruptionIcon: Record<string, typeof CloudRain> = {
  rain: CloudRain, 'missed-bus': Bus, 'train-delay': Clock, 'attraction-closed': Lock, 'flight-delay': Plane,
};

const ACTIVITY_ALTERNATIVES = [
  { emoji: '☕', title: 'Koffee Mameya', location: 'Shibuya', category: 'Food', cost: 15, duration: '1.5 hours', isOutdoor: false },
  { emoji: '⛩️', title: 'Meiji Shrine', location: 'Harajuku', category: 'Culture', cost: 0, duration: '1 hour', isOutdoor: true },
  { emoji: '🌃', title: 'Shibuya Sky', location: 'Shibuya', category: 'Attraction', cost: 25, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🍣', title: 'Tsukiji Outer Market', location: 'Tsukiji', category: 'Food', cost: 30, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🎨', title: 'teamLab Borderless', location: 'Azabudai Hills', category: 'Culture', cost: 30, duration: '2 hours', isOutdoor: false },
  { emoji: '🌳', title: 'Shinjuku Gyoen', location: 'Shinjuku', category: 'Nature', cost: 5, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🛍️', title: 'Ameyoko Market', location: 'Ueno', category: 'Shopping', cost: 0, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🏯', title: 'Senso-ji Temple', location: 'Asakusa', category: 'Culture', cost: 0, duration: '1 hour', isOutdoor: true },
  { emoji: '🗼', title: 'Tokyo Skytree', location: 'Sumida', category: 'Attraction', cost: 20, duration: '1.5 hours', isOutdoor: false },
  { emoji: '🍜', title: 'Ramen Street', location: 'Tokyo Station', category: 'Food', cost: 20, duration: '1 hour', isOutdoor: false },
  { emoji: '🌊', title: 'Odaiba Seaside Park', location: 'Odaiba', category: 'Nature', cost: 0, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🎭', title: 'Kabuki-za Theatre', location: 'Ginza', category: 'Entertainment', cost: 45, duration: '2 hours', isOutdoor: false },
  { emoji: '☕', title: 'Local Café', category: 'Food', cost: 15, duration: '1.5 hours', isOutdoor: false },
  { emoji: '🏛️', title: 'Local Museum', category: 'Culture', cost: 20, duration: '2 hours', isOutdoor: false },
  { emoji: '🛍️', title: 'Shopping District', category: 'Shopping', cost: 0, duration: '2 hours', isOutdoor: true },
  { emoji: '🌳', title: 'City Park / Garden', category: 'Nature', cost: 0, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🗼', title: 'Viewpoint / Landmark', category: 'Attraction', cost: 25, duration: '1 hour', isOutdoor: true },
  { emoji: '🍜', title: 'Food Street Tour', category: 'Food', cost: 30, duration: '2 hours', isOutdoor: true },
  { emoji: '♨️', title: 'Spa / Wellness', category: 'Activity', cost: 40, duration: '2 hours', isOutdoor: false },
  { emoji: '🌆', title: 'Sunset Spot', category: 'Attraction', cost: 0, duration: '1 hour', isOutdoor: true },
  { emoji: '🎨', title: 'Art Gallery', category: 'Culture', cost: 15, duration: '1.5 hours', isOutdoor: false },
  { emoji: '🍺', title: 'Bar Hopping', category: 'Nightlife', cost: 35, duration: '2 hours', isOutdoor: false },
  { emoji: '🐱', title: 'Cat Café', category: 'Activity', cost: 15, duration: '1 hour', isOutdoor: false },
  { emoji: '🛒', title: 'Street Market', category: 'Shopping', cost: 0, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🏯', title: 'Historical Site', category: 'Culture', cost: 10, duration: '1.5 hours', isOutdoor: true },
  { emoji: '🎢', title: 'Theme Park', category: 'Attraction', cost: 50, duration: '4 hours', isOutdoor: true },
  { emoji: '🍵', title: 'Tea Ceremony', category: 'Culture', cost: 35, duration: '1 hour', isOutdoor: false },
  { emoji: '🏖️', title: 'Beach / Waterfront', category: 'Nature', cost: 0, duration: '2 hours', isOutdoor: true },
  { emoji: '🎭', title: 'Live Theatre Show', category: 'Entertainment', cost: 45, duration: '2 hours', isOutdoor: false },
  { emoji: '🚲', title: 'City Cycling Tour', category: 'Activity', cost: 30, duration: '2 hours', isOutdoor: true },
  { emoji: '🍱', title: 'Japanese Cooking Class', category: 'Food', cost: 55, duration: '2.5 hours', isOutdoor: false },
  { emoji: '🌊', title: 'Harbour Cruise', category: 'Attraction', cost: 40, duration: '1.5 hours', isOutdoor: true },
  { emoji: '📸', title: 'Photography Walk', category: 'Activity', cost: 0, duration: '2 hours', isOutdoor: true },
  { emoji: '🧘', title: 'Yoga Session', category: 'Wellness', cost: 20, duration: '1 hour', isOutdoor: false },
  { emoji: '🍰', title: 'Dessert Café', category: 'Food', cost: 15, duration: '1 hour', isOutdoor: false },
  { emoji: '🎮', title: 'Arcade Experience', category: 'Entertainment', cost: 25, duration: '2 hours', isOutdoor: false },
];

type View = 'itinerary' | 'disruption-select' | 'disruption-detail' | 'applied' | 'change-activity';

export function ActiveTrip({ trip, group, onBack, onSetBudget, onApplyPlan, onRestorePlanA, onReplaceActivity, onAddTraveller, onUpdateTraveller, onAddNearbyActivity, onReorderBlocks, onTogglePin, onToggleGroupCollapse, onReplaceBlock, onUndoReplace, initialView }: ActiveTripProps) {
  const [activeDay, setActiveDay] = useState(trip.currentDay);
  const [view, setView] = useState<View>(initialView ?? 'itinerary');
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionScenario | null>(null);
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);
  const [showRestored, setShowRestored] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mapQuery, setMapQuery] = useState<{ query: string; subtitle?: string } | null>(null);
  const [showEditItinerary, setShowEditItinerary] = useState(false);
  const [changeActivityTarget, setChangeActivityTarget] = useState<ItineraryActivity | null>(null);
  const [showReplaced, setShowReplaced] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [customPlace, setCustomPlace] = useState('');
  const [showNearbyNow, setShowNearbyNow] = useState(false);
  const [nearbySource, setNearbySource] = useState<ItineraryActivity | null>(null);
  const [blockDetailsActivity, setBlockDetailsActivity] = useState<ItineraryActivity | null>(null);
  const [adaptiveBlock, setAdaptiveBlock] = useState<ItineraryActivity | null>(null);
  const [adaptiveAltId, setAdaptiveAltId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = useMemo(() => now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), [now]);

  const spend = useMemo(() => computeTripSpend(trip), [trip]);
  const remaining = trip.budget - spend;

  const day = trip.itinerary.find((d) => d.day === activeDay) ?? trip.itinerary[0];
  const isToday = activeDay === trip.currentDay && trip.status === 'current';
  const pinnedBlocks = useMemo(() => getPinnedActivities(trip.itinerary), [trip.itinerary]);

  const { currentActivity, nextActivity, completedCount } = useMemo(() => {
    if (!day) return { currentActivity: null, nextActivity: null, completedCount: 0 };
    const upcoming = day.activities.filter((a) => a.time >= currentTime);
    const past = day.activities.filter((a) => a.time < currentTime);
    return {
      currentActivity: upcoming[0] ?? null,
      nextActivity: upcoming[1] ?? null,
      completedCount: past.length,
    };
  }, [day, currentTime]);

  const findAffectedActivity = (scenario: DisruptionScenario): ItineraryActivity | null => {
    const allActivities = trip.itinerary.flatMap((d) => d.activities);
    const exact = allActivities.find((a) => a.id === scenario.originalActivity.id);
    if (exact) return exact;
    for (const d of trip.itinerary) {
      if (d.day < trip.currentDay) continue;
      const found = d.activities.find((act) => {
        if (d.day === trip.currentDay && isToday && act.time < currentTime) return false;
        switch (scenario.type) {
          case 'weather': return act.isOutdoor;
          case 'transport': return !!act.transport;
          case 'delay': return !!act.transport && act.transport.mode === 'train';
          case 'flight': return act.category === 'Attraction' || act.isOutdoor;
          case 'attraction': return act.category === 'Attraction' || act.isOutdoor;
          default: return false;
        }
      });
      if (found) return found;
    }
    return allActivities[0] ?? null;
  };

  const [affectedActivity, setAffectedActivity] = useState<ItineraryActivity | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ItineraryActivity | null>(null);

  const openDisruptionForActivity = (act: ItineraryActivity) => {
    setSelectedActivity(act);
    setView('disruption-select');
  };

  const openDisruptionGeneral = () => {
    setSelectedActivity(null);
    setView('disruption-select');
  };

  const openWeatherAlternatives = () => {
    const weatherScenario = ALL_DISRUPTION_SCENARIOS.find((scenario) => scenario.type === 'weather');
    if (!weatherScenario) return;
    const target = findAffectedActivity(weatherScenario);
    setSelectedActivity(null);
    setAffectedActivity(target);
    setSelectedDisruption({ ...weatherScenario, originalActivity: target ?? weatherScenario.originalActivity });
    setSelectedAltId((weatherScenario.alternatives.find((alternative) => alternative.recommended) ?? weatherScenario.alternatives[0])?.id ?? null);
    setView('disruption-detail');
  };

  const openChangeActivity = () => {
    setChangeActivityTarget(null);
    setActivitySearch('');
    setView('change-activity');
  };

  const browseAlternativePlaces = () => {
    const availableActivity = day?.activities.find((activity) => !isToday || activity.time >= currentTime);
    if (!availableActivity) return;
    setChangeActivityTarget(availableActivity);
    setActivitySearch('');
  };

  const handleReplaceActivity = (alt: typeof ACTIVITY_ALTERNATIVES[number]) => {
    if (!changeActivityTarget || !onReplaceActivity) return;
    const newActivity: ItineraryActivity = {
      id: `swap-${Date.now()}`,
      time: changeActivityTarget.time,
      emoji: alt.emoji,
      title: alt.title,
      cost: alt.cost,
      location: alt.location ?? trip.destination,
      duration: alt.duration,
      category: alt.category,
      isOutdoor: alt.isOutdoor,
      planTag: 'B',
    };
    onReplaceActivity(activeDay, changeActivityTarget.id, newActivity);
    setShowReplaced(true);
    setTimeout(() => setShowReplaced(false), 3500);
    setView('itinerary');
    setChangeActivityTarget(null);
    setCustomPlace('');
  };

  const handleAddCustomPlace = () => {
    const title = customPlace.trim();
    if (!changeActivityTarget || !onReplaceActivity || !title) return;
    onReplaceActivity(activeDay, changeActivityTarget.id, {
      ...changeActivityTarget,
      id: `swap-${Date.now()}`,
      title,
      emoji: '📍',
      location: title,
      category: 'Personal choice',
      cost: 0,
      duration: 'Flexible',
      isOutdoor: false,
      transport: undefined,
      optimizationNote: undefined,
      planTag: 'B',
    });
    setShowReplaced(true);
    setTimeout(() => setShowReplaced(false), 3500);
    setView('itinerary');
    setChangeActivityTarget(null);
    setCustomPlace('');
  };

  const relevantScenarios = useMemo(() => {
    if (!selectedActivity) return ALL_DISRUPTION_SCENARIOS;

    const matchingScenarios = ALL_DISRUPTION_SCENARIOS.filter((s) => {
      switch (s.type) {
        case 'weather': return selectedActivity.isOutdoor;
        case 'transport': return selectedActivity.transport?.mode === 'bus';
        case 'delay': return selectedActivity.transport?.mode === 'train';
        case 'flight': return selectedActivity.category === 'Travel' && /flight|arrive|depart/i.test(selectedActivity.title);
        case 'attraction': return selectedActivity.category === 'Attraction' || selectedActivity.isOutdoor;
        default: return false;
      }
    }).map((scenario): DisruptionScenario => {
      if (scenario.id !== 'train-delay') return scenario;
      const destination = selectedActivity.location ?? selectedActivity.title;
      const selectedTransport = selectedActivity.transport;
      return {
        ...scenario,
        originalActivity: selectedActivity,
        title: `Train delay to ${destination}`,
        subtitle: `Your train to ${destination} may be delayed`,
        description: `The train needed to reach ${selectedActivity.title} is delayed. Choose another route or change this activity instead.`,
        explanation: `This alternative keeps you moving toward ${selectedActivity.title} with less waiting and protects the rest of your schedule.`,
        appliedNote: `Your route to ${selectedActivity.title} has been updated.`,
        alternatives: scenario.alternatives.map((alternative) => ({
          ...alternative,
          detail: alternative.detail?.replace('Tsukiji to Asakusa', `${selectedActivity.location ?? 'your start point'} to ${destination}`),
          transport: selectedTransport ? {
            mode: selectedTransport.mode,
            from: selectedTransport.from,
            to: selectedTransport.to,
            duration: alternative.transport?.duration ?? selectedTransport.duration,
            cost: alternative.transport?.cost ?? selectedTransport.cost,
          } : alternative.transport,
        })),
      };
    });

    return matchingScenarios;
  }, [selectedActivity]);

  const handleSelectDisruption = (s: DisruptionScenario) => {
    setSelectedDisruption(s);
    const target = selectedActivity ?? findAffectedActivity(s);
    setAffectedActivity(target);
    const recommended = s.alternatives.find((a) => a.recommended) ?? s.alternatives[0];
    setSelectedAltId(recommended.id);
    setView('disruption-detail');
  };

  const handleApply = () => {
    if (selectedDisruption && selectedAltId) {
      if (affectedActivity) {
        const affectedDay = trip.itinerary.find((itineraryDay) =>
          itineraryDay.activities.some((activity) => activity.id === affectedActivity.id),
        );
        if (affectedDay) setActiveDay(affectedDay.day);
      }
      onApplyPlan(selectedDisruption.id, selectedAltId, affectedActivity?.id);
    }
    setView('applied');
    setTimeout(() => {
      setView('itinerary');
      setSelectedDisruption(null);
      setSelectedAltId(null);
      setAffectedActivity(null);
      setSelectedActivity(null);
    }, 2000);
  };

  const handleRestore = () => {
    onRestorePlanA();
    setShowRestored(true);
    setTimeout(() => setShowRestored(false), 3500);
  };

  const scoredAlternatives = useMemo(() => {
    if (!selectedDisruption) return [];
    return selectedDisruption.alternatives.map((alt) => {
      const score = scoreAlternative(alt, {
        travellers: group?.travellers ?? [],
        budget: trip.budget,
        currentSpend: spend,
        disruptionType: selectedDisruption.type,
      });
      return { alt, score };
    });
  }, [selectedDisruption, group, trip.budget, spend]);

  const selectedAlt = scoredAlternatives.find((s) => s.alt.id === selectedAltId) ?? null;
  const upcomingWeather = trip.weather[trip.currentDay - 1];
  const hasUpcomingHeavyRain = !!upcomingWeather?.alert && (upcomingWeather.condition === 'rain' || upcomingWeather.condition === 'storm');

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-midnight-400 hover:text-midnight-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Trip header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <div className="flex items-center gap-2 text-sky-600 mb-1.5">
          <MapPin size={16} strokeWidth={2.4} />
          <span className="text-xs font-bold uppercase tracking-wider">{trip.country}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-midnight-900">
              <button onClick={() => setMapQuery({ query: trip.destination, subtitle: trip.country })} className="hover:text-sky-600 transition-colors text-left">
                {trip.destination}
              </button>
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-midnight-400">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {trip.startDate}–{trip.endDate}</span>
              {group && <span className="flex items-center gap-1.5"><Users size={14} /> {group.travellers.length} travellers</span>}
              <CurrentDate />
            </div>
          </div>
          {trip.status === 'current' && (
            <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">DAY {trip.currentDay} OF {trip.totalDays}</span>
          )}
        </div>
      </motion.div>

      {/* ── UPCOMING TRIP VIEW ── */}
      {trip.status === 'upcoming' && (
        <UpcomingTripView trip={trip} group={group} spend={spend} remaining={remaining} onSetBudget={onSetBudget} onReplaceActivity={onReplaceActivity} onAddTraveller={onAddTraveller} onUpdateTraveller={onUpdateTraveller} onOpenMap={(q, s) => setMapQuery({ query: q, subtitle: s })} />
      )}

      {/* ── CURRENT TRIP VIEW ── */}
      {trip.status === 'current' && (
        <>
      {/* Replaced confirmation */}
      <AnimatePresence>
        {showReplaced && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 py-3 border-t border-sky-200 bg-sky-50/50 -mx-2 px-2 rounded-lg">
            <Check size={16} className="text-sky-600" strokeWidth={2.5} />
            <div>
              <p className="text-sm font-semibold text-sky-700">Activity replaced</p>
              <p className="text-xs text-sky-600">Your itinerary has been updated with the new place.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restored confirmation */}
      <AnimatePresence>
        {showRestored && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 py-3 border-t border-emerald-200 bg-emerald-50/50 -mx-2 px-2 rounded-lg">
            <Check size={16} className="text-emerald-600" strokeWidth={2.5} />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Plan A restored</p>
              <p className="text-xs text-emerald-600">The original itinerary has been restored.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather alert — only for current or future days */}
      {trip.status === 'current' && hasUpcomingHeavyRain && trip.appliedPlans.length === 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 border-l-4 border-amber-400 bg-amber-50/50 py-4 pl-4 pr-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2.4} />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">Weather affecting your itinerary</p>
              <p className="text-sm text-amber-800 mt-1">{upcomingWeather.day}: {upcomingWeather.alert}</p>
              <p className="text-xs text-amber-700 mt-1">Your upcoming outdoor activities may be affected.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={openWeatherAlternatives}>
              View alternatives
            </Button>
          </div>
        </motion.div>
      )}

      {/* Applied plan banner + restore */}
      {trip.appliedPlans.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 py-3 border-t border-emerald-200 bg-emerald-50/50 -mx-2 px-2 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-emerald-700 flex-1">Plan {trip.appliedPlans[trip.appliedPlans.length - 1].replacementActivity.planTag ?? 'B'} active · itinerary adapted</span>
          <button onClick={openDisruptionGeneral} className="flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors">
            Change plan
          </button>
          <button onClick={openChangeActivity} className="flex items-center gap-1.5 text-xs font-bold text-coral-600 hover:text-coral-800 transition-colors">
            Change where I'm going
          </button>
          <button onClick={handleRestore} className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
            <RotateCcw size={13} strokeWidth={2.5} /> Restore Plan A
          </button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {view === 'itinerary' && (
          <motion.div key="itinerary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Live status — simple text, not a dark card */}
            {isToday && currentActivity && (
              <div className="mb-6 pb-4 border-b border-sand-100">
                <div className="flex items-center gap-2 text-midnight-400 mb-2">
                  <Clock size={14} strokeWidth={2.4} />
                  <span className="text-xs font-bold uppercase tracking-wider">Live · {currentTime}</span>
                </div>
                <div className="flex items-baseline gap-6">
                  <div>
                    <p className="text-xs text-midnight-400 mb-0.5">{currentActivity ? 'Next up' : 'Now'}</p>
                    <p className="text-sm font-bold text-sky-600 tabular-nums">{currentActivity.time}</p>
                    <p className="text-sm font-semibold text-midnight-900">{currentActivity.title}</p>
                    {currentActivity.duration && currentActivity.duration !== '—' && (
                      <p className="text-xs text-midnight-400 mt-0.5">{currentActivity.duration}</p>
                    )}
                  </div>
                  {nextActivity && (
                    <div>
                      <p className="text-xs text-midnight-400 mb-0.5">Then</p>
                      <p className="text-sm font-bold text-midnight-500 tabular-nums">{nextActivity.time}</p>
                      <p className="text-sm font-semibold text-midnight-700">{nextActivity.title}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Day selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
              {trip.itinerary.map((d) => (
                <button key={d.day} onClick={() => setActiveDay(d.day)}
                  className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${activeDay === d.day ? 'bg-midnight-900 text-white' : 'bg-white text-midnight-500 border border-sand-200 hover:bg-sand-50'}`}>
                  Day {d.day}
                </button>
              ))}
            </div>

            {/* Trip Info + Timeline — two-column on desktop */}
            <div className="mb-6 grid lg:grid-cols-[260px_1fr] gap-6">
              {/* Trip Info sidebar */}
              <div className="hidden lg:block">
                <TripInfo trip={trip} group={group} pinnedBlocks={pinnedBlocks} onUnpin={(id) => onTogglePin?.(id)} />
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400">{day.label}</h3>
                  {isToday && <span className="text-xs font-medium text-emerald-600">{completedCount} completed</span>}
                </div>

                <DayTimeline
                  day={day}
                  isToday={isToday}
                  currentTime={currentTime}
                  currentActivityId={currentActivity?.id}
                  onBlockClick={(act) => setBlockDetailsActivity(act)}
                  onPlanB={(act) => openDisruptionForActivity(act)}
                  onReorder={(dayNum, fromId, toId) => onReorderBlocks?.(dayNum, fromId, toId)}
                  onGroupToggle={(groupBlockId) => onToggleGroupCollapse?.(activeDay, groupBlockId)}
                />

                {/* Undo last replacement */}
                {trip.lastReplacedBlock && (
                  <button onClick={() => { onUndoReplace?.(); setShowRestored(true); setTimeout(() => setShowRestored(false), 3500); }}
                    className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors">
                    <RotateCcw size={14} strokeWidth={2.2} /> Undo last change
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Trip Info */}
            <div className="lg:hidden mb-6">
              <TripInfo trip={trip} group={group} pinnedBlocks={pinnedBlocks} onUnpin={(id) => onTogglePin?.(id)} />
            </div>

            {/* Budget + Weather — side by side, no card wrappers */}
            <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-sand-100">
              <BudgetSlider budget={trip.budget} min={BUDGET_MIN} max={BUDGET_MAX} onChange={onSetBudget} total={spend} remaining={remaining} />
              <WeatherWidget forecast={trip.weather} />
            </div>

            {/* Travellers section — below itinerary */}
            {trip.travelType !== 'solo' && (
              <TravellersSection trip={trip} group={group} onAddTraveller={onAddTraveller} onUpdateTraveller={onUpdateTraveller} />
            )}
          </motion.div>
        )}

        {view === 'disruption-select' && (
          <motion.div key="disrupt-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="border-l-4 border-amber-400 bg-amber-50/50 py-4 pl-4 pr-3 mb-6">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <AlertTriangle size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Something changed?</span>
              </div>
              <h2 className="text-xl font-extrabold text-midnight-900 mb-1">What happened?</h2>
              <p className="text-sm text-midnight-500">Select a disruption and we'll find the best way to recover.</p>
            </div>

            {selectedActivity && (
              <div className="py-3 border-t border-b border-sand-100 mb-6 bg-sky-50/30 -mx-2 px-2 rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider text-midnight-400 block mb-2">Affected activity</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedActivity.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-midnight-900">{selectedActivity.title}</p>
                    <p className="text-xs text-midnight-400">{selectedActivity.time}{selectedActivity.location && ` · ${selectedActivity.location}`}</p>
                  </div>
                </div>
              </div>
            )}

            {relevantScenarios.length === 0 && (
              <div className="py-8 text-center text-sm text-midnight-400">
                No disruptions apply to this activity. Try selecting a different activity or use the general alternatives.
              </div>
            )}

            <button
              onClick={openChangeActivity}
              className="w-full flex items-center gap-4 py-4 mb-2 text-left group rounded-lg border border-coral-200 bg-coral-50/40 px-3 hover:bg-coral-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-coral-100 flex items-center justify-center shrink-0">
                <Pencil size={20} className="text-coral-600" strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-midnight-900">Change where I’m going</p>
                <p className="text-xs text-midnight-500 mt-0.5">Swap any planned place — museum, café, park and more</p>
              </div>
              <ArrowLeft size={16} className="rotate-180 text-coral-500" strokeWidth={2.2} />
            </button>

            <div className="space-y-0 divide-y divide-sand-100">
              {relevantScenarios.map((s, i) => {
                const Icon = disruptionIcon[s.id] ?? CloudRain;
                return (
                  <motion.button key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectDisruption(s)}
                    className="w-full flex items-center gap-4 py-4 text-left group hover:bg-sand-50/50 -mx-2 px-2 rounded-lg transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-sand-50 flex items-center justify-center text-xl shrink-0">{s.emoji}</div>
                    <div className="flex-1">
                      <p className="font-bold text-midnight-900">{s.label}</p>
                      <p className="text-xs text-midnight-400 mt-0.5">{s.subtitle}</p>
                    </div>
                    <Icon size={16} className="text-midnight-300 group-hover:text-sky-500 transition-colors shrink-0" strokeWidth={2.2} />
                  </motion.button>
                );
              })}
            </div>

            <Button size="md" variant="ghost" fullWidth onClick={() => { setView('itinerary'); setSelectedActivity(null); }} className="mt-4">
              <X size={16} /> Cancel
            </Button>
          </motion.div>
        )}

        {view === 'disruption-detail' && selectedDisruption && (
          <motion.div key="disrupt-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Problem alert */}
            <div className="border-l-4 border-amber-400 bg-amber-50/50 py-4 pl-4 pr-3 mb-6">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertTriangle size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">{selectedDisruption.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedDisruption.emoji}</span>
                <div>
                  <h1 className="text-xl font-extrabold text-midnight-900">{selectedDisruption.title}</h1>
                  <p className="text-sm text-midnight-500">{selectedDisruption.subtitle}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-midnight-600">{selectedDisruption.description}</p>
            </div>

            {/* Affected activity — simple text, not a card */}
            <div className="py-3 border-t border-sand-100 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-midnight-400">Affected activity</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{affectedActivity?.emoji ?? selectedDisruption.originalActivity.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-midnight-900">{affectedActivity?.title ?? selectedDisruption.originalActivity.title}</p>
                  <p className="text-xs text-midnight-400">{affectedActivity?.time ?? selectedDisruption.originalActivity.time}{(affectedActivity?.location ?? selectedDisruption.originalActivity.location) && ` · ${affectedActivity?.location ?? selectedDisruption.originalActivity.location}`}</p>
                </div>
              </div>
            </div>

            {/* Alternatives heading */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-4">Recommended alternatives</h3>
            <div className="space-y-3 mb-6">
              {scoredAlternatives.map(({ alt, score }, i) => (
                <AlternativeCard
                  key={alt.id}
                  alt={alt}
                  score={score}
                  delay={i * 0.08}
                  showSchedule={selectedDisruption.type === 'transport' || selectedDisruption.type === 'delay' || selectedDisruption.type === 'flight'}
                  selected={selectedAltId === alt.id}
                  onSelect={() => setSelectedAltId(alt.id)}
                />
              ))}
            </div>

            {/* Why this recommendation — simple text, not dark card */}
            {selectedAlt && (
              <div className="mb-6 py-4 border-t border-sand-100">
                <p className="text-sm font-bold text-midnight-900 mb-2">Why this recommendation?</p>
                <p className="text-sm text-midnight-500 leading-relaxed mb-4">{selectedDisruption.explanation}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {selectedAlt.score.reasoning.map((factor) => {
                    const Icon = reasoningIconMap[factor.icon];
                    return (
                      <div key={factor.label} className="flex items-center gap-2">
                        <Icon size={14} className={`shrink-0 ${factor.positive ? 'text-emerald-500' : 'text-amber-500'}`} strokeWidth={2.2} />
                        <div className="flex-1">
                          <span className="text-xs text-midnight-400">{factor.label}: </span>
                          <span className="text-sm font-medium text-midnight-700">{factor.value}</span>
                        </div>
                        {factor.positive ? <Check size={13} className="text-emerald-500" strokeWidth={2.5} /> : <AlertTriangle size={13} className="text-amber-500" strokeWidth={2.5} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="success" fullWidth onClick={handleApply} disabled={!selectedAltId}>
                <Check size={18} strokeWidth={2.5} /> Apply {selectedAlt ? selectedAlt.alt.label : 'Plan'}
              </Button>
              <Button size="lg" variant="secondary" fullWidth onClick={() => { setView('itinerary'); setSelectedActivity(null); }}>
                <X size={18} strokeWidth={2.5} /> Keep Plan A
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'applied' && (
          <motion.div key="applied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check size={32} className="text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-midnight-900">Plan applied</h2>
            <p className="mt-2 text-midnight-500 text-sm max-w-sm">{selectedDisruption?.appliedNote}</p>
          </motion.div>
        )}

        {view === 'change-activity' && (
          <motion.div key="change-act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="border-l-4 border-coral-400 bg-coral-50/50 py-4 pl-4 pr-3 mb-6">
              <div className="flex items-center gap-2 text-coral-700 mb-1">
                <Pencil size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Change where I'm going</span>
              </div>
              <h2 className="text-xl font-extrabold text-midnight-900 mb-1">
                {changeActivityTarget ? 'What would you prefer instead?' : 'Which activity would you like to change?'}
              </h2>
              <p className="text-sm text-midnight-500">
                {changeActivityTarget
                  ? `Replace ${changeActivityTarget.title} with a different place to visit.`
                  : 'Select an activity from your itinerary to swap it for something else.'}
              </p>
            </div>

            {!changeActivityTarget ? (
              <>
              <button
                type="button"
                onClick={browseAlternativePlaces}
                className="w-full flex items-center gap-3 rounded-xl border border-coral-200 bg-coral-50/60 px-4 py-3 mb-4 text-left hover:bg-coral-50 hover:border-coral-300 transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-coral-100 flex items-center justify-center shrink-0">
                  <Search size={17} className="text-coral-600" strokeWidth={2.4} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-midnight-900">Browse other places</p>
                  <p className="text-xs text-midnight-500 mt-0.5">Search 25+ cafés, museums, markets, parks and more</p>
                </div>
                <ArrowLeft size={16} className="rotate-180 text-coral-500" strokeWidth={2.2} />
              </button>
              <div className="space-y-2 mb-6">
                {day.activities.map((act, i) => {
                  const isPast = isToday && act.time < currentTime;
                  return (
                    <motion.button
                      key={act.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isPast}
                      onClick={() => setChangeActivityTarget(act)}
                      className={`w-full flex items-center gap-4 py-3 px-3 text-left rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        isPast
                          ? 'border-sand-200 bg-sand-50'
                          : 'border-sand-200 bg-white hover:border-coral-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-lg bg-sand-50 border border-sand-200 flex items-center justify-center text-xl shrink-0">
                        {act.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-midnight-900 tabular-nums">{act.time}</span>
                          {isPast && <span className="text-[10px] font-bold uppercase text-emerald-600">Done</span>}
                        </div>
                        <p className="text-sm font-semibold text-midnight-900">{act.title}</p>
                        {act.location && <p className="text-xs text-midnight-400">{act.location}</p>}
                      </div>
                      {!isPast && <ArrowLeft size={16} className="rotate-180 text-midnight-300" strokeWidth={2.2} />}
                    </motion.button>
                  );
                })}
              </div>
              </>
            ) : (
              <>
                {/* Search bar */}
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-300" strokeWidth={2.2} />
                  <input
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder={`Search nearby places in ${trip.destination}...`}
                    className="w-full rounded-lg border border-sand-200 bg-white pl-9 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-coral-300 focus:ring-2 focus:ring-coral-100"
                  />
                </div>
                <p className="text-xs text-midnight-400 mb-3">Suggested places are outside your current itinerary. Search by place, neighbourhood, or category.</p>
                <div className="space-y-3 mb-6">
                {ACTIVITY_ALTERNATIVES.filter((a) => {
                  if (a.title === changeActivityTarget.title) return false;
                  if (!activitySearch.trim()) return true;
                  const q = activitySearch.toLowerCase();
                  return a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q);
                }).map((alt, i) => (
                  <motion.button
                    key={alt.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReplaceActivity(alt)}
                    className="w-full flex items-center gap-4 py-3 px-3 text-left rounded-lg border border-sand-200 bg-white hover:border-coral-300 hover:shadow-sm transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg bg-coral-50 border border-coral-200 flex items-center justify-center text-xl shrink-0">
                      {alt.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-midnight-900">{alt.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-midnight-400">
                        {alt.location && <span className="flex items-center gap-1"><MapPin size={10} /> {alt.location}</span>}
                        <span>{alt.category}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {alt.duration}</span>
                        {alt.cost > 0 && <span className="flex items-center gap-1"><Wallet size={10} /> RM {alt.cost}</span>}
                        {alt.isOutdoor && <span className="text-sky-600">Outdoor</span>}
                      </div>
                    </div>
                    <Check size={16} className="text-coral-500" strokeWidth={2.5} />
                  </motion.button>
                ))}
                {ACTIVITY_ALTERNATIVES.filter((a) => {
                  if (a.title === changeActivityTarget.title) return false;
                  if (!activitySearch.trim()) return true;
                  const q = activitySearch.toLowerCase();
                  return a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q);
                }).length === 0 && (
                  <p className="text-center text-sm text-midnight-400 py-4">No places found. Try a different search.</p>
                )}
              </div>
              <div className="rounded-xl border border-dashed border-coral-200 bg-coral-50/30 p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-coral-700 mb-2">Have somewhere else in mind?</p>
                <div className="flex gap-2">
                  <input
                    value={customPlace}
                    onChange={(e) => setCustomPlace(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomPlace(); }}
                    placeholder="Add your preferred place"
                    className="min-w-0 flex-1 rounded-lg border border-sand-200 bg-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-coral-300 focus:ring-2 focus:ring-coral-100"
                  />
                  <Button size="sm" variant="secondary" onClick={handleAddCustomPlace} disabled={!customPlace.trim()}>Add</Button>
                </div>
              </div>
              </>
            )}

            <div className="flex gap-3">
              {changeActivityTarget ? (
                <Button size="md" variant="ghost" onClick={() => setChangeActivityTarget(null)}>
                  <ArrowLeft size={16} /> Back to activities
                </Button>
              ) : null}
              <Button size="md" variant="ghost" fullWidth onClick={() => { setView('itinerary'); setChangeActivityTarget(null); }}>
                <X size={16} /> Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      {/* ── PAST TRIP VIEW ── */}
      {trip.status === 'past' && (
        <PastTripView trip={trip} group={group} spend={spend} />
      )}

      <AnimatePresence>
        {showNearbyNow && (
          <NearbyNow trip={trip} group={group} sourceActivity={nearbySource} onClose={() => setShowNearbyNow(false)} onAddToTrip={(activity) => onAddNearbyActivity?.(activeDay, activity)} />
        )}
      </AnimatePresence>

      {/* Map popup */}
      <MapModal
        open={!!mapQuery}
        onClose={() => setMapQuery(null)}
        query={mapQuery?.query ?? ''}
        subtitle={mapQuery?.subtitle}
      />

      {/* SOS emergency button */}
      <SOSButton destination={trip.destination} />

      {/* Block details drawer */}
      <BlockDetails
        activity={blockDetailsActivity}
        group={group}
        onClose={() => setBlockDetailsActivity(null)}
        onPin={() => {
          if (blockDetailsActivity) onTogglePin?.(blockDetailsActivity.id);
          setBlockDetailsActivity(null);
        }}
        onEdit={() => {
          if (blockDetailsActivity) {
            setChangeActivityTarget(blockDetailsActivity);
            setView('change-activity');
          }
          setBlockDetailsActivity(null);
        }}
        onRemove={() => setBlockDetailsActivity(null)}
        onFindNearby={() => {
          if (blockDetailsActivity) setNearbySource(blockDetailsActivity);
          setBlockDetailsActivity(null);
          setShowNearbyNow(true);
        }}
        onReplace={() => {
          if (blockDetailsActivity) {
            setAdaptiveBlock(blockDetailsActivity);
            setAdaptiveAltId(null);
          }
          setBlockDetailsActivity(null);
        }}
      />

      {/* Adaptive block recommendation */}
      <AnimatePresence>
        {adaptiveBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-midnight-900/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => { setAdaptiveBlock(null); setAdaptiveAltId(null); }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <AdaptiveBlockRecommendation
                affectedBlock={adaptiveBlock}
                alternatives={ALL_DISRUPTION_SCENARIOS.flatMap((s) => s.alternatives).slice(0, 3)}
                group={group}
                selectedAltId={adaptiveAltId}
                onSelectAltId={setAdaptiveAltId}
                onSelectAlternative={(alt) => {
                  if (adaptiveBlock) {
                    const newAct: ItineraryActivity = {
                      id: `replace-${Date.now()}`,
                      time: adaptiveBlock.time,
                      emoji: alt.emoji,
                      title: alt.title,
                      cost: alt.budgetImpact,
                      location: alt.transport?.to,
                      duration: alt.duration,
                      category: alt.category,
                      isOutdoor: alt.isOutdoor,
                      planTag: 'B',
                      transport: alt.transport,
                      characteristics: alt.characteristics,
                    };
                    onReplaceBlock?.(activeDay, adaptiveBlock.id, newAct);
                  }
                  setAdaptiveBlock(null);
                  setAdaptiveAltId(null);
                  setShowReplaced(true);
                  setTimeout(() => setShowReplaced(false), 3500);
                }}
                onKeepCurrent={() => { setAdaptiveBlock(null); setAdaptiveAltId(null); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit itinerary modal */}
      {showEditItinerary && onReplaceActivity && (
        <EditItineraryModal
          trip={trip}
          onClose={() => setShowEditItinerary(false)}
          onReplaceActivity={onReplaceActivity}
        />
      )}
    </div>
  );
}

const reasoningIconMap: Record<ReasoningFactor['icon'], typeof CloudRain> = {
  weather: CloudRain, group: Users, budget: Wallet, travel: Train, schedule: Calendar,
};

interface ScoredCardProps {
  alt: PlanAlternative;
  score: {
    groupMatch: number;
    scheduleCompatibility: number;
    budgetFit: boolean;
    totalScore: number;
    reasoning: ReasoningFactor[];
  };
  delay: number;
  showSchedule: boolean;
  selected: boolean;
  onSelect: () => void;
}

function AlternativeCard({ alt, score, delay, showSchedule, selected, onSelect }: ScoredCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onSelect}
      className={`relative w-full text-left rounded-lg border p-4 transition-all ${selected ? 'border-sky-400 bg-sky-50/30 ring-1 ring-sky-200' : alt.recommended ? 'border-emerald-200 bg-emerald-50/20' : 'border-sand-200 bg-white hover:border-sand-300'}`}
    >
      {alt.recommended && !selected && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2 block">Recommended</span>
      )}
      {selected && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-2 block">Selected</span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{alt.emoji}</span>
        <div className="flex-1">
          <p className="font-bold text-midnight-900">{alt.title}</p>
          {alt.detail && <p className="text-xs text-midnight-500 mt-0.5">{alt.detail}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-midnight-500">
        <span className="flex items-center gap-1"><Users size={12} strokeWidth={2.2} /> {score.groupMatch}% group match</span>
        <span className="flex items-center gap-1"><Wallet size={12} strokeWidth={2.2} /> {alt.budgetImpact > 0 ? `+RM ${alt.budgetImpact}` : 'No extra cost'}</span>
        {alt.duration && <span className="flex items-center gap-1"><Clock size={12} strokeWidth={2.2} /> {alt.duration}</span>}
        {showSchedule && alt.scheduleCompatibility !== undefined && (
          <span className={`flex items-center gap-1 ${alt.scheduleCompatibility >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
            <Calendar size={12} strokeWidth={2.2} /> {alt.scheduleCompatibility}% schedule fit
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ── Upcoming Trip View ──

function UpcomingTripView({ trip, group, spend, remaining, onSetBudget, onReplaceActivity, onAddTraveller, onUpdateTraveller, onOpenMap }: {
  trip: Trip;
  group: TravelGroup | null;
  spend: number;
  remaining: number;
  onSetBudget: (amount: number) => void;
  onReplaceActivity?: (dayNumber: number, activityId: string, newActivity: ItineraryActivity) => void;
  onAddTraveller?: (traveller: Omit<import('@/types').Traveller, 'id'>) => void;
  onUpdateTraveller?: (id: string, traveller: Omit<import('@/types').Traveller, 'id'>) => void;
  onOpenMap?: (query: string, subtitle?: string) => void;
}) {
  const [activeDay, setActiveDay] = useState(1);
  const [showEditItinerary, setShowEditItinerary] = useState(false);
  const day = trip.itinerary.find((d) => d.day === activeDay) ?? trip.itinerary[0];

  const daysUntil = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const dateStr = trip.startMonth || trip.startDate;
    const parsed = new Date(`${dateStr} ${year}`);
    if (parsed < now) parsed.setFullYear(year + 1);
    const diff = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [trip.startMonth, trip.startDate]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Upcoming badge */}
      <div className="flex items-center gap-2 text-sky-600 mb-4">
        <Calendar size={16} strokeWidth={2.4} />
        <span className="text-xs font-bold uppercase tracking-wider">Upcoming Trip</span>
      </div>

      {/* Countdown — simple text, not dark card */}
      <div className="mb-6 pb-6 border-b border-sand-100">
        <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-2">Countdown</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-extrabold text-midnight-900 tabular-nums">{daysUntil}</span>
          <span className="text-lg font-medium text-midnight-400 mb-1.5">days until departure</span>
        </div>
        <p className="mt-2 text-sm text-midnight-500">{trip.startDate}–{trip.endDate} · {trip.totalDays} days · {trip.travelType === 'solo' ? 'Solo trip' : group?.name ?? 'No group'}</p>
      </div>

      {/* Flight + Hotel — simple sections with dividers, not cards */}
      {trip.selectedFlight && (
        <div className="py-4 border-b border-sand-100">
          <div className="flex items-center gap-2 text-midnight-400 mb-2">
            <Plane size={15} strokeWidth={2.2} />
            <span className="text-xs font-bold uppercase tracking-wider">Flight</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-midnight-900">{trip.selectedFlight.airline}</p>
              <p className="text-xs text-midnight-400 mt-0.5">{trip.selectedFlight.departureTime} → {trip.selectedFlight.arrivalTime} · {trip.selectedFlight.duration} · {trip.selectedFlight.stops === 0 ? 'Direct' : `${trip.selectedFlight.stops} stop`}</p>
            </div>
            <p className="text-sm font-bold text-midnight-900">RM {trip.selectedFlight.totalPrice.toLocaleString()}</p>
          </div>
        </div>
      )}

      {trip.selectedHotel && (
        <div className="py-4 border-b border-sand-100">
          <div className="flex items-center gap-2 text-midnight-400 mb-2">
            <HotelIcon size={15} strokeWidth={2.2} />
            <span className="text-xs font-bold uppercase tracking-wider">Hotel</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-midnight-900">{trip.selectedHotel.name}</p>
              <p className="text-xs text-midnight-400 mt-0.5">{trip.selectedHotel.area} · {trip.selectedHotel.roomType} · {trip.selectedHotel.distanceFromCenter}</p>
            </div>
            <p className="text-sm font-bold text-midnight-900">RM {trip.selectedHotel.bestPrice?.toLocaleString() ?? '—'} / night</p>
          </div>
        </div>
      )}

      {/* Budget */}
      <div className="py-6 border-b border-sand-100">
        <BudgetSlider budget={trip.budget} min={BUDGET_MIN} max={BUDGET_MAX} onChange={onSetBudget} total={spend} remaining={remaining} />
      </div>

      {trip.travelType !== 'solo' && (
        <TravellersSection trip={trip} group={group} onAddTraveller={onAddTraveller} onUpdateTraveller={onUpdateTraveller} />
      )}

      {/* Must-visit places — simple text list */}
      {trip.requestedActivities.length > 0 && (
        <div className="py-6 border-b border-sand-100">
          <div className="flex items-center gap-2 text-coral-500 mb-3">
            <Star size={15} strokeWidth={2.2} fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-wider">Must-visit places</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {trip.requestedActivities.map((a) => (
              <span key={a} className="text-sm font-medium text-midnight-700">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary preview — timeline, no card */}
      {trip.itinerary.length > 0 && (
        <div className="py-6 border-b border-sand-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-4">Planned itinerary</h3>
          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
            {trip.itinerary.map((d) => (
              <button key={d.day} onClick={() => setActiveDay(d.day)}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${activeDay === d.day ? 'bg-midnight-900 text-white' : 'bg-white text-midnight-500 border border-sand-200 hover:bg-sand-50'}`}>
                Day {d.day}
              </button>
            ))}
          </div>
          {day && (
            <div className="relative">
              <div className="absolute left-[1.4rem] top-3 bottom-3 w-px bg-sand-200" />
              <div className="space-y-1">
                {day.activities.map((act, i) => {
                  const TransportIcon = act.transport ? transportIcon[act.transport.mode] : null;
                  return (
                    <motion.div key={act.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="relative flex items-start gap-4 px-1 py-2.5 hover:bg-sand-50/50 rounded-lg -mx-1 px-2 transition-colors">
                      <div className="relative z-10 h-11 w-11 rounded-lg border bg-white border-sand-200 flex items-center justify-center text-xl">{act.emoji}</div>
                      <div className="flex-1 pt-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-midnight-900 tabular-nums">{act.time}</span>
                          {act.isOutdoor && <span className="text-[10px] font-bold uppercase text-sky-600">Outdoor</span>}
                          {act.isRequested && <span className="text-[10px] font-bold uppercase text-coral-600">Must-visit</span>}
                        </div>
                        <p className="text-sm font-semibold mt-0.5 text-midnight-900">{act.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {act.location && <button onClick={() => onOpenMap?.(act.location!, act.title)} className="flex items-center gap-1 text-xs text-midnight-400 hover:text-sky-600 transition-colors"><MapPin size={10} /> {act.location}</button>}
                          {act.duration && act.duration !== '—' && <span className="flex items-center gap-1 text-xs text-midnight-400"><Clock size={10} /> {act.duration}</span>}
                          {act.cost !== undefined && act.cost > 0 && <span className="flex items-center gap-1 text-xs font-medium text-midnight-500"><Wallet size={10} /> RM {act.cost}</span>}
                        </div>
                        {act.transport && TransportIcon && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-midnight-400">
                            <TransportIcon size={11} className="text-sky-500" strokeWidth={2.2} />
                            <span>{act.transport.from} → {act.transport.to} · {act.transport.duration}{act.transport.cost > 0 && ` · RM ${act.transport.cost}`}</span>
                          </div>
                        )}
                        {act.optimizationNote && (
                          <p className="mt-1.5 text-xs text-sky-600 italic">{act.optimizationNote}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weather preview */}
      {trip.weather.length > 0 && (
        <div className="py-6 border-b border-sand-100">
          <WeatherWidget forecast={trip.weather} />
        </div>
      )}

      {/* Solo → Connect */}
      {trip.travelType === 'solo' && (
        <div className="py-6 border-b border-sand-100">
          <SoloConnect
            destination={trip.destination}
            dates={`${trip.startDate}–${trip.endDate}`}
            budget={trip.budget}
            interests={trip.requestedActivities}
          />
        </div>
      )}

      {/* Edit actions */}
      <div className="flex flex-wrap gap-2 pt-4">
        <Button size="md" variant="secondary" onClick={() => setShowEditItinerary(true)}>
          <Pencil size={15} strokeWidth={2.5} /> Edit Trip
        </Button>
        <Button size="md" variant="secondary" onClick={() => onSetBudget(trip.budget)}>
          <Wallet size={15} strokeWidth={2.5} /> Edit Budget
        </Button>
      </div>

      {/* Edit itinerary modal */}
      {showEditItinerary && onReplaceActivity && (
        <EditItineraryModal
          trip={trip}
          onClose={() => setShowEditItinerary(false)}
          onReplaceActivity={onReplaceActivity}
        />
      )}
    </motion.div>
  );
}

// ── Past Trip View ──

function PastTripView({ trip, group, spend }: { trip: Trip; group: TravelGroup | null; spend: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-2 text-midnight-400 mb-4">
        <Check size={16} strokeWidth={2.4} />
        <span className="text-xs font-bold uppercase tracking-wider">Completed Trip</span>
      </div>

      {/* Trip summary — simple grid with dividers, no card */}
      <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-6 pb-6 border-b border-sand-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1">Destination</p>
          <p className="text-lg font-extrabold text-midnight-900">{trip.destination}</p>
          <p className="text-xs text-midnight-400">{trip.startDate}–{trip.endDate}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1">Group</p>
          <p className="text-sm font-semibold text-midnight-700">{group?.name ?? '—'}</p>
          <p className="text-xs text-midnight-400">{group?.travellers.length ?? 0} travellers</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1">Budget</p>
          <p className="text-sm font-bold text-midnight-900">RM {trip.budget.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1">Total spend</p>
          <p className="text-sm font-bold text-midnight-900">RM {spend.toLocaleString()}</p>
        </div>
      </div>

      {trip.itinerary.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-midnight-400 mb-3">Trip summary</h3>
          <p className="text-sm text-midnight-600">{trip.itinerary.length} days · {trip.itinerary.flatMap((d) => d.activities).length} activities</p>
          {trip.requestedActivities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {trip.requestedActivities.map((a) => (
                <span key={a} className="text-sm font-medium text-midnight-600 flex items-center gap-1">
                  <Star size={10} fill="currentColor" strokeWidth={0} className="text-coral-400" /> {a}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
