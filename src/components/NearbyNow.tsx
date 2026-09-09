import { useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Check, Clock3, Compass, MapPin, Navigation, Plus, SlidersHorizontal, Users, Wallet, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { NEARBY_RECOMMENDATIONS, NEARBY_TRAVELLERS } from '@/data/nearbyData';
import { nearbyMatchScore, nearbyRecommendationReason, nearbyTravellerMatch } from '@/lib/nearbyMatch';
import type { Interest, ItineraryActivity, NearbyRecommendation, NearbyTraveller, TravelGroup, Trip } from '@/types';

interface NearbyNowProps {
  trip: Trip;
  group: TravelGroup | null;
  onClose: () => void;
  onAddToTrip: (activity: ItineraryActivity) => void;
  sourceActivity?: ItineraryActivity | null;
}

const filters: Array<{ label: string; value: string }> = [
  { label: 'All nearby', value: 'All' },
  { label: 'Food', value: 'Food' },
  { label: 'Café', value: 'Café' },
  { label: 'Explore', value: 'Explore' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Events', value: 'Events' },
];

export function NearbyNow({ trip, group, onClose, onAddToTrip, sourceActivity }: NearbyNowProps) {
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; emoji: string } | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const travellers = group?.travellers ?? [];
  const allInterests: Interest[] = ['Food', 'Culture', 'Shopping', 'Adventure', 'Photography', 'Nature', 'Nightlife', 'Relaxed'];
  const budget = Math.max(0, trip.budget - trip.estimatedSpend);
  const interests = useMemo(() => {
    const values = travellers.flatMap((traveller) => traveller.interests);
    return [...new Set<Interest>(values)].slice(0, 5);
  }, [travellers]);

  const recommendations = useMemo(() => NEARBY_RECOMMENDATIONS
    .filter((recommendation) => filter === 'All' || recommendation.category === filter)
    .map((recommendation) => ({
      recommendation,
      score: nearbyMatchScore(recommendation, travellers, budget, 165, userInterests),
    }))
    .sort((a, b) => b.score - a.score), [budget, filter, travellers, userInterests]);

  const toggleInterest = (interest: string) => {
    setUserInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed || userInterests.includes(trimmed)) return;
    setUserInterests((prev) => [...prev, trimmed]);
    setCustomInput('');
  };

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  const removeInterest = (interest: string) => {
    setUserInterests((prev) => prev.filter((i) => i !== interest));
  };

  const currentLocation = sourceActivity?.location ?? sourceActivity?.title ?? trip.destination;

  const freeWindow = useMemo(() => {
    if (!sourceActivity) return { label: '2h 45m free', until: '20:15' };
    const day = trip.itinerary.find((d) => d.activities.some((a) => a.id === sourceActivity.id));
    if (!day) return { label: '2h 45m free', until: '20:15' };
    const idx = day.activities.findIndex((a) => a.id === sourceActivity.id);
    const next = day.activities[idx + 1];
    if (!next) return { label: 'Rest of the day free', until: 'End of day' };
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const startMin = toMin(sourceActivity.time);
    const endMin = toMin(next.time);
    const diff = endMin - startMin;
    if (diff <= 0) return { label: 'No free window', until: next.time };
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    const label = hours > 0 ? `${hours}h ${mins}m free` : `${mins}m free`;
    return { label, until: next.time };
  }, [sourceActivity, trip.itinerary]);

  const addToTrip = (id: string) => {
    const item = NEARBY_RECOMMENDATIONS.find((recommendation) => recommendation.id === id);
    if (!item) return;
    onAddToTrip({
      id: `nearby-${Date.now()}`,
      time: item.time,
      emoji: item.emoji,
      title: item.title,
      location: item.location,
      duration: item.duration,
      cost: item.cost,
      category: item.category,
      isOutdoor: item.category === 'Explore',
      isRequested: false,
      optimizationNote: 'Added because it fits your free time, interests, location and budget.',
    });
    setAddedId(id);
    setConfirmation({ title: item.title, emoji: item.emoji });
    setTimeout(() => setConfirmation(null), 3500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 overflow-y-auto bg-sand-50">
      <div className="mx-auto min-h-screen max-w-7xl">
        <header className="sticky top-0 z-20 border-b border-sand-200 bg-sand-50/95 px-5 py-4 backdrop-blur-md md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-sand-200 bg-white text-midnight-500 transition-colors hover:bg-sand-100"><ArrowLeft size={17} /></button>
              <div>
                <div className="flex items-center gap-2"><Compass size={16} className="text-coral-500" /><span className="text-xs font-bold uppercase tracking-wider text-coral-600">Nearby Now</span></div>
                <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-midnight-900">Turn free time into something worth doing.</h1>
              </div>
            </div>
            <button onClick={onClose} className="hidden h-9 w-9 items-center justify-center rounded-xl bg-white text-midnight-400 hover:bg-sand-100 sm:flex"><X size={17} /></button>
          </div>
        </header>

        <main className="grid gap-6 px-5 py-6 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4"><div className="flex items-center gap-2 text-sky-600"><Navigation size={15} /><span className="text-xs font-bold uppercase tracking-wider">Current location</span></div><p className="mt-2 text-base font-extrabold text-midnight-900">{currentLocation}</p><p className="mt-1 text-xs text-midnight-400">Near {trip.destination}</p></Card>
              <Card className="p-4"><div className="flex items-center gap-2 text-coral-600"><Clock3 size={15} /><span className="text-xs font-bold uppercase tracking-wider">Available window</span></div><p className="mt-2 text-base font-extrabold text-midnight-900">{freeWindow.label}</p><p className="mt-1 text-xs text-midnight-400">Until {freeWindow.until} · before your next plan</p></Card>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-midnight-400">Your trip context</p><p className="mt-1 text-sm font-bold text-midnight-900">{trip.destination} · {group?.name ?? 'Your preferences'}</p></div><Wallet size={18} className="text-emerald-500" /></div>
              <div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-midnight-400">Budget available</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">RM {budget.toLocaleString()}</span>{interests.map((interest) => <span key={interest} className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-semibold text-coral-700">{interest}</span>)}{interests.length === 0 && userInterests.length === 0 && <span className="text-xs text-midnight-400">No preferences added yet</span>}</div>
              <button onClick={() => setShowPreferences(!showPreferences)} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors"><SlidersHorizontal size={13} /> {showPreferences ? 'Hide preferences' : 'Set your preferences'}</button>
              <AnimatePresence>
                {showPreferences && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 pt-3 border-t border-sand-100">
                      <p className="text-xs font-semibold text-midnight-400 mb-2.5">What are you in the mood for? Tap to select.</p>
                      <div className="flex flex-wrap gap-2">
                        {allInterests.map((interest) => {
                          const active = userInterests.includes(interest);
                          return (
                            <button key={interest} onClick={() => toggleInterest(interest)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${active ? 'bg-sky-600 text-white shadow-sm' : 'border border-sand-200 bg-white text-midnight-500 hover:border-sky-300 hover:text-sky-600'}`}>
                              {active && <Check size={12} className="mr-1 inline" />}{interest}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3.5">
                        <p className="text-xs font-semibold text-midnight-400 mb-2">Add your own — type anything you like</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onKeyDown={handleCustomKeyDown}
                            placeholder="e.g. Vintage shopping, Street art, Ramen hunting…"
                            className="flex-1 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs text-midnight-700 placeholder:text-midnight-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                          />
                          <button onClick={addCustomInterest} disabled={!customInput.trim()} className="shrink-0 rounded-xl bg-midnight-900 px-3 py-2 text-xs font-bold text-white transition-opacity disabled:opacity-40 enabled:hover:bg-midnight-800">
                            <Plus size={14} className="inline" /> Add
                          </button>
                        </div>
                        {userInterests.filter((i) => !allInterests.includes(i as Interest)).length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {userInterests.filter((i) => !allInterests.includes(i as Interest)).map((interest) => (
                              <span key={interest} className="flex items-center gap-1 rounded-full bg-coral-50 px-3 py-1.5 text-xs font-bold text-coral-700">
                                {interest}
                                <button onClick={() => removeInterest(interest)} className="ml-0.5 text-coral-400 hover:text-coral-600"><X size={12} /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {userInterests.length > 0 && <button onClick={() => setUserInterests([])} className="mt-2.5 text-xs font-medium text-midnight-400 hover:text-midnight-600 transition-colors">Clear all</button>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-2xl border border-sky-200 bg-[#dcebe8] shadow-sm">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(28deg, transparent 47%, #ffffff 48%, #ffffff 51%, transparent 52%), linear-gradient(112deg, transparent 45%, #ffffff 46%, #ffffff 49%, transparent 50%), linear-gradient(#c8ded9 1px, transparent 1px), linear-gradient(90deg, #c8ded9 1px, transparent 1px)', backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px' }} />
              <div className="absolute left-[48%] top-[48%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"><div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-sky-600 text-white shadow-lg"><Navigation size={17} fill="currentColor" /></div><span className="mt-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-midnight-700 shadow-sm">You</span></div>
              {recommendations.slice(0, 4).map(({ recommendation, score }, index) => <button key={recommendation.id} onClick={() => setSelectedId(recommendation.id)} className={`absolute flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-lg shadow-md transition-transform hover:scale-110 ${selectedId === recommendation.id ? 'bg-coral-500' : 'bg-white'}`} style={{ left: `${16 + (index * 23) % 68}%`, top: `${20 + (index * 31) % 58}%` }} title={`${recommendation.title} · ${score}% match`}>{recommendation.emoji}</button>)}
              <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-midnight-600 shadow-sm"><MapPin size={12} className="mr-1 inline text-sky-600" />Nearby recommendations around {currentLocation}</div>
            </div>

            <div><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-midnight-900">Nearby activities</h2><p className="mt-1 text-sm text-midnight-400">Ranked for your time, preferences and current itinerary.</p></div><span className="text-xs font-bold text-sky-600">{recommendations.length} options</span></div><div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{filters.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${filter === item.value ? 'bg-midnight-900 text-white' : 'border border-sand-200 bg-white text-midnight-500 hover:bg-sand-100'}`}>{item.label}</button>)}</div></div>

            <div className="space-y-3">{recommendations.map(({ recommendation, score }) => <RecommendationCard key={recommendation.id} recommendation={recommendation} score={score} detailsOpen={showDetails === recommendation.id} added={addedId === recommendation.id} onToggleDetails={() => setShowDetails(showDetails === recommendation.id ? null : recommendation.id)} onAdd={() => addToTrip(recommendation.id)} />)}</div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div><div className="mb-3 flex items-center gap-2"><Users size={17} className="text-sky-600" /><div><h2 className="text-lg font-extrabold text-midnight-900">Travellers nearby</h2><p className="text-sm text-midnight-400">People in your group network open to joining.</p></div></div><div className="space-y-3">{NEARBY_TRAVELLERS.filter((traveller) => traveller.openToJoin).map((traveller) => { const score = nearbyTravellerMatch(traveller, travellers); return <Card key={traveller.id} className="p-4"><div className="flex items-start gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100 text-2xl">{traveller.avatar}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-midnight-900">{traveller.name}</p><p className="mt-0.5 text-xs text-emerald-600">Available nearby · {traveller.distance} km</p></div><span className="text-sm font-extrabold text-sky-600">{score}%</span></div><div className="mt-3 flex flex-wrap gap-1.5">{traveller.interests.map((interest) => <span key={interest} className="rounded-full bg-coral-50 px-2 py-1 text-[11px] font-semibold text-coral-700">{interest}</span>)}</div><Button size="sm" variant={joinedId === traveller.id ? 'success' : 'secondary'} className="mt-3" onClick={() => setJoinedId(traveller.id)}>{joinedId === traveller.id ? <><Check size={14} /> Joining activity</> : 'Join an activity'}</Button></div></div></Card>; })}</div></div>
            <div className="rounded-2xl bg-midnight-900 p-5 text-white"><div className="flex items-center gap-2 text-sky-300"><CalendarDays size={16} /><span className="text-xs font-bold uppercase tracking-wider">Your next plan</span></div><p className="mt-3 text-sm font-bold">{trip.itinerary.flatMap((day) => day.activities).find((activity) => activity.time >= freeWindow.until)?.title ?? 'Evening plans'}</p><p className="mt-1 text-xs leading-relaxed text-midnight-200">Nearby Now keeps your unexpected adventure close enough to return on time.</p></div>
          </aside>
        </main>
      </div>

      <AnimatePresence>
        {confirmation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl">{confirmation.emoji}</div>
              <div>
                <p className="text-sm font-bold text-midnight-900">{confirmation.title} added to your trip</p>
                <p className="text-xs text-emerald-600">Added because it fits your free time, interests, location and budget.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RecommendationCard({ recommendation, score, detailsOpen, added, onToggleDetails, onAdd }: { recommendation: NearbyRecommendation; score: number; detailsOpen: boolean; added: boolean; onToggleDetails: () => void; onAdd: () => void }) {
  return <Card className="overflow-hidden p-0"><div className="flex items-start gap-3 p-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-2xl">{recommendation.emoji}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-bold text-midnight-900">{recommendation.title}</h3>{recommendation.type === 'event' && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">Event</span>}</div><p className="mt-1 text-xs text-midnight-400">{recommendation.time} · {recommendation.distance} km · {recommendation.location}</p></div><div className="shrink-0 text-right"><p className="text-lg font-extrabold text-sky-600">{score}%</p><p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400">match</p></div></div><p className="mt-3 text-sm leading-relaxed text-midnight-600">{recommendation.description}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-midnight-400"><span><Clock3 size={12} className="mr-1 inline" />{recommendation.duration}</span><span><Wallet size={12} className="mr-1 inline" />RM {recommendation.cost}</span><span className="text-emerald-600">{nearbyRecommendationReason(recommendation, [], score)}</span></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={onAdd} variant={added ? 'success' : 'primary'}>{added ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add to My Trip</>}</Button><Button size="sm" variant="secondary" onClick={onToggleDetails}>View Details</Button></div></div></div><AnimatePresence>{detailsOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-sand-100 bg-sand-50 px-4 py-3 text-xs leading-relaxed text-midnight-500">{recommendation.title} is {recommendation.distance} km away and takes about {recommendation.duration}. It is scheduled at {recommendation.time}, so it fits inside the current 2h 45m window.</motion.div>}</AnimatePresence></Card>;
}
