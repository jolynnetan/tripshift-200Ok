import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MapPin, Calendar, Users, Wallet, Star, X, Check, User, Plus, Search, Plane, Hotel as HotelIcon, Sparkles, Train } from 'lucide-react';
import { Button } from '@/components/Button';
import { BudgetSlider } from '@/components/BudgetSlider';
import { FlightCard } from '@/components/FlightCard';
import { HotelCard } from '@/components/HotelCard';
import type { TravelGroup, Destination, TravelType, Trip, FlightOffer, Hotel } from '@/types';
import { BUDGET_MIN, BUDGET_MAX, ALL_INTERESTS, EXPLORE_ITEMS, FLIGHT_OFFERS, HOTELS, AI_RECOMMENDATION } from '@/data/comparisonData';
import { DESTINATIONS } from '@/data/tripsData';
import type { Interest, ExploreItem } from '@/types';

interface PlanningFlowProps {
  destination?: Destination;
  editingTrip?: Trip | null;
  groups: TravelGroup[];
  onCreateGroup: (name: string) => string;
  onBack: () => void;
  onComplete: (data: {
    destination: string;
    country: string;
    emoji: string;
    coverImage: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    travelType: TravelType;
    groupId: string | null;
    budget: number;
    requestedActivities: string[];
    selectedFlight: FlightOffer | null;
    selectedHotel: Hotel | null;
  }) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

function getActivityPool(destName: string): (ExploreItem & { emoji: string })[] {
  const dest = DESTINATIONS.find((d) => d.name === destName);
  const pool: (ExploreItem & { emoji: string })[] = EXPLORE_ITEMS.map((e) => ({ ...e, emoji: e.emoji }));
  if (dest) {
    dest.activities.forEach((actName, i) => {
      if (!pool.some((p) => p.name === actName)) {
        pool.unshift({
          id: `dest-act-${i}`,
          name: actName,
          emoji: dest.emoji,
          category: 'Attraction',
          area: dest.country,
          rating: 4.5 + (i % 3) * 0.1,
          cost: 'RM ' + (20 + i * 15),
          insight: '',
        });
      }
    });
  }
  return pool.slice(0, 8);
}

function displayToISODate(display: string): string {
  if (!display) return '';
  const parsed = new Date(`${display} ${new Date().getFullYear()}`);
  if (isNaN(parsed.getTime())) return '';
  if (parsed < new Date()) parsed.setFullYear(parsed.getFullYear() + 1);
  return parsed.toISOString().split('T')[0];
}

export function PlanningFlow({ destination, editingTrip, groups, onCreateGroup, onBack, onComplete }: PlanningFlowProps) {
  const hasPreselectedDest = !!destination;
  const isEditing = !!editingTrip;
  const [step, setStep] = useState<Step>(isEditing ? 5 : hasPreselectedDest ? 2 : 1);
  const [dest, setDest] = useState(editingTrip?.destination ?? destination?.name ?? '');
  const [country, setCountry] = useState(editingTrip?.country ?? destination?.country ?? '');
  const [emoji, setEmoji] = useState(editingTrip?.emoji ?? destination?.emoji ?? '📍');
  const [coverImage, setCoverImage] = useState(editingTrip?.coverImage ?? destination?.image ?? '');
  const [startDate, setStartDate] = useState(editingTrip ? displayToISODate(editingTrip.startDate) : '');
  const [endDate, setEndDate] = useState(editingTrip ? displayToISODate(editingTrip.endDate) : '');
  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(`${endDate}T12:00:00`).getTime() - new Date(`${startDate}T12:00:00`).getTime()) / 86400000) + 1)
    : editingTrip?.totalDays ?? 4;
  const [travelType, setTravelType] = useState<TravelType>(editingTrip?.travelType ?? 'group');
  const [groupId, setGroupId] = useState<string | null>(editingTrip?.groupId ?? groups[0]?.id ?? null);
  const [budget, setBudget] = useState(editingTrip?.budget ?? destination?.estimatedFrom ?? 2000);
  const [interests, setInterests] = useState<Interest[]>(editingTrip?.requestedActivities.length ? ['Food', 'Culture'] : destination?.interests ?? ['Food', 'Culture']);
  const [requestedActivities, setRequestedActivities] = useState<string[]>(editingTrip?.requestedActivities ?? destination?.activities ?? []);
  const [activityInput, setActivityInput] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(editingTrip?.selectedFlight ?? FLIGHT_OFFERS[0]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(editingTrip?.selectedHotel ?? HOTELS[0]);

  const activeGroup = groups.find((g) => g.id === groupId);
  const activityPool = getActivityPool(dest);

  const handleAddActivity = () => {
    if (!activityInput.trim()) return;
    setRequestedActivities((prev) => prev.includes(activityInput.trim()) ? prev : [...prev, activityInput.trim()]);
    setActivityInput('');
  };

  const togglePoolActivity = (name: string) => {
    setRequestedActivities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    );
  };

  const formatDate = (value: string) => {
    if (!value) return '';
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const selectDestination = (d: Destination) => {
    setDest(d.name);
    setCountry(d.country);
    setEmoji(d.emoji);
    setCoverImage(d.image);
    setInterests(d.interests);
    setRequestedActivities(d.activities);
    setBudget(d.estimatedFrom);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const id = onCreateGroup(newGroupName.trim());
    setGroupId(id);
    setNewGroupName('');
    setShowNewGroup(false);
  };

  const handleComplete = () => {
    onComplete({
      destination: dest,
      country,
      emoji,
      coverImage,
      startDate: formatDate(startDate) || '15 Oct',
      endDate: formatDate(endDate) || '18 Oct',
      totalDays,
      travelType,
      groupId: travelType === 'solo' ? null : groupId,
      budget,
      requestedActivities,
      selectedFlight,
      selectedHotel,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return dest.trim().length > 0;
      case 2: return startDate.length > 0 && endDate.length > 0 && endDate >= startDate;
      case 3: return travelType === 'solo' || (travelType === 'group' && groupId !== null);
      case 4: return true;
      case 5: return true;
      case 6: return selectedFlight !== null;
      case 7: return selectedHotel !== null;
      case 8: return true;
    }
  };

  const stepLabels = isEditing
    ? ['Destination', 'Dates', 'Group', 'Budget', 'Activities', 'Hotels', 'Build']
    : ['Destination', 'Dates', 'Group', 'Budget', 'Activities', 'Flights', 'Hotels', 'Build'];

  const nextStep = (s: Step): Step => {
    if (isEditing && s === 5) return 7 as Step;
    return (s + 1) as Step;
  };

  const prevStep = (s: Step): Step => {
    if (isEditing && s === 7) return 5 as Step;
    return (s - 1) as Step;
  };

  const filteredDestinations = destSearch.trim()
    ? DESTINATIONS.filter((d) =>
        d.name.toLowerCase().includes(destSearch.toLowerCase()) ||
        d.country.toLowerCase().includes(destSearch.toLowerCase()) ||
        d.travelStyle.toLowerCase().includes(destSearch.toLowerCase()))
    : DESTINATIONS;

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-midnight-400 hover:text-midnight-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Cancel
        </button>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-sky-500' : 'bg-sand-200'}`} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Destination */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <MapPin size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 1</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">Where are you going?</h1>
              <p className="text-sm text-midnight-400 mb-6">Search for your destination.</p>
              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-300" strokeWidth={2.2} />
                <input
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  placeholder="Search destinations..."
                  autoFocus
                  className="w-full rounded-xl bg-white border border-sand-200 shadow-soft pl-12 pr-4 py-4 text-base font-medium text-midnight-900 placeholder:text-midnight-300 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredDestinations.map((d, i) => {
                  const isSelected = dest === d.name;
                  return (
                    <motion.button
                      key={d.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => selectDestination(d)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${isSelected ? 'border-sky-400 ring-2 ring-sky-100' : 'border-transparent hover:border-sand-300'}`}
                    >
                      <div className="relative h-32 bg-midnight-200">
                        <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/70 to-transparent" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-sky-500 flex items-center justify-center">
                            <Check size={15} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-3 text-white">
                          <p className="text-lg font-extrabold">{d.name}</p>
                          <p className="text-xs text-white/70 flex items-center gap-1">
                            <MapPin size={10} /> {d.country}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-3">
                        <div className="flex items-center gap-3 text-xs text-midnight-500">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {d.duration}</span>
                          <span className="flex items-center gap-1"><Wallet size={11} /> from RM {d.estimatedFrom.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Dates */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <Calendar size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 2</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">When?</h1>
              <p className="text-sm text-midnight-400 mb-6">Select your travel dates.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-2">Start date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl bg-white border border-sand-200 px-4 py-3 text-base font-semibold text-midnight-900 focus:outline-none focus:border-sky-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-2">End date</label>
                  <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl bg-white border border-sand-200 px-4 py-3 text-base font-semibold text-midnight-900 focus:outline-none focus:border-sky-300" />
                </div>
              </div>
              {totalDays > 1 && startDate && endDate && (
                <p className="mt-4 text-sm font-semibold text-sky-600">{totalDays} days</p>
              )}
            </motion.div>
          )}

          {/* Step 3 — Solo or Group */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <Users size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 3</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">Who are you travelling with?</h1>
              <p className="text-sm text-midnight-400 mb-6">Choose solo or select a travel group.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => setTravelType('solo')}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition-all ${travelType === 'solo' ? 'border-sky-300 bg-sky-50/50' : 'border-sand-200 bg-white hover:border-sand-300'}`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${travelType === 'solo' ? 'bg-sky-500' : 'bg-sand-100'}`}>
                    <User size={22} className={travelType === 'solo' ? 'text-white' : 'text-midnight-400'} strokeWidth={2.2} />
                  </div>
                  <p className={`text-sm font-bold ${travelType === 'solo' ? 'text-sky-700' : 'text-midnight-600'}`}>Solo</p>
                  <p className="text-xs text-midnight-400 text-center">Travelling alone</p>
                </button>
                <button onClick={() => setTravelType('group')}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition-all ${travelType === 'group' ? 'border-sky-300 bg-sky-50/50' : 'border-sand-200 bg-white hover:border-sand-300'}`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${travelType === 'group' ? 'bg-sky-500' : 'bg-sand-100'}`}>
                    <Users size={22} className={travelType === 'group' ? 'text-white' : 'text-midnight-400'} strokeWidth={2.2} />
                  </div>
                  <p className={`text-sm font-bold ${travelType === 'group' ? 'text-sky-700' : 'text-midnight-600'}`}>With a Group</p>
                  <p className="text-xs text-midnight-400 text-center">Travelling together</p>
                </button>
              </div>

              {travelType === 'group' && (
                <div className="space-y-2">
                  {groups.map((g) => (
                    <button key={g.id} onClick={() => setGroupId(g.id)}
                      className={`w-full flex items-center gap-4 rounded-xl border p-4 transition-all text-left ${groupId === g.id ? 'border-sky-300 bg-sky-50/50' : 'border-sand-200 bg-white hover:border-sand-300'}`}>
                      <div className="h-10 w-10 rounded-xl bg-sand-100 flex items-center justify-center">
                        <Users size={18} className="text-midnight-500" strokeWidth={2.2} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-midnight-900">{g.name}</p>
                        <p className="text-xs text-midnight-400">{g.travellers.length} travellers</p>
                      </div>
                      {groupId === g.id && <Check size={18} className="text-sky-500" strokeWidth={2.5} />}
                    </button>
                  ))}

                  {!showNewGroup && (
                    <button
                      onClick={() => setShowNewGroup(true)}
                      className="w-full flex items-center gap-4 rounded-xl border-2 border-dashed border-sand-200 p-4 transition-all text-left hover:border-sky-300 hover:bg-sky-50/30"
                    >
                      <div className="h-10 w-10 rounded-xl bg-sand-50 flex items-center justify-center">
                        <Plus size={18} className="text-midnight-400" strokeWidth={2.2} />
                      </div>
                      <p className="text-sm font-bold text-midnight-500">Add new group</p>
                    </button>
                  )}
                  {showNewGroup && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 flex gap-2">
                      <input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Group name (e.g. Friends, Family)"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                        className="flex-1 rounded-xl border border-sand-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                      />
                      <Button size="md" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create</Button>
                      <Button size="md" variant="secondary" onClick={() => { setShowNewGroup(false); setNewGroupName(''); }}>Cancel</Button>
                    </div>
                  )}

                  {activeGroup && (
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-2">Travellers in {activeGroup.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {activeGroup.travellers.length === 0 ? (
                          <p className="text-xs text-midnight-400">No travellers yet. You can add them later from the Groups page.</p>
                        ) : activeGroup.travellers.map((t) => (
                          <span key={t.id} className="flex items-center gap-1.5 rounded-xl bg-sand-50 border border-sand-200 px-3 py-1.5 text-sm font-semibold text-midnight-700">
                            <span>{t.avatar}</span> {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {travelType === 'solo' && (
                <div className="rounded-xl bg-sky-50 border border-sky-100 p-5">
                  <div className="flex items-center gap-2 text-sky-700 mb-2">
                    <User size={16} strokeWidth={2.4} />
                    <span className="text-xs font-bold uppercase tracking-wider">Solo Trip</span>
                  </div>
                  <p className="text-sm text-midnight-600">
                    All planning features are available — budget, must-visit places, flight, hotel, and adaptive Plan B recovery.
                  </p>
                  <p className="text-xs text-sky-600 mt-2 font-semibold">
                    You can also connect with compatible travellers later.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4 — Budget */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <Wallet size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 4</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">What's your budget?</h1>
              <p className="text-sm text-midnight-400 mb-6">Adjust the slider. Recommendations will respect this budget.</p>
              <BudgetSlider budget={budget} min={BUDGET_MIN} max={BUDGET_MAX} onChange={setBudget} total={Math.round(budget * 0.85)} remaining={Math.round(budget * 0.15)} />
            </motion.div>
          )}

          {/* Step 5 — Activities */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <Star size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 5</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">What do you want to do?</h1>
              <p className="text-sm text-midnight-400 mb-6">{isEditing ? 'Update your must-visit places. Your itinerary will be regenerated.' : 'Tap to select high-rated places, or add your own.'}</p>

              {requestedActivities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {requestedActivities.map((a) => (
                    <motion.span key={a} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-coral-50 text-coral-700 px-3 py-1.5 text-sm font-semibold border border-coral-100">
                      <Star size={10} fill="currentColor" strokeWidth={0} /> {a}
                      <button onClick={() => setRequestedActivities((prev) => prev.filter((x) => x !== a))} className="hover:text-coral-900"><X size={13} strokeWidth={2.5} /></button>
                    </motion.span>
                  ))}
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">High-rated places in {dest}</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {activityPool.map((item) => {
                  const selected = requestedActivities.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      onClick={() => togglePoolActivity(item.name)}
                      className={`flex items-start gap-3 rounded-xl border p-4 transition-all text-left ${selected ? 'border-sky-300 bg-sky-50/50' : 'border-sand-200 bg-white hover:border-sand-300'}`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-sand-100 flex items-center justify-center text-xl shrink-0">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-midnight-900 truncate">{item.name}</p>
                          {selected && <Check size={15} className="text-sky-500 shrink-0" strokeWidth={3} />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-midnight-400">
                          <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" strokeWidth={0} className="text-amber-400" /> {item.rating.toFixed(1)}</span>
                          <span>·</span>
                          <span>{item.area}</span>
                          <span>·</span>
                          <span>{item.cost}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">Add your own</p>
              <div className="flex gap-2 mb-6">
                <input
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddActivity(); } }}
                  placeholder="e.g. try ramen, visit a cat cafe"
                  className="flex-1 rounded-xl border border-sand-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
                <Button size="md" variant="secondary" onClick={handleAddActivity} disabled={!activityInput.trim()}>Add</Button>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">Travel interests</p>
              <div className="flex flex-wrap gap-2">
                {ALL_INTERESTS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button key={interest} onClick={() => setInterests((prev) => selected ? prev.filter((i) => i !== interest) : [...prev, interest])}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${selected ? 'bg-midnight-900 text-white' : 'bg-white text-midnight-600 border border-sand-200'}`}>
                      {selected && <Check size={15} strokeWidth={3} />} {interest}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 6 — Flights */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <Plane size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 6</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">Choose your flight</h1>
              <p className="text-sm text-midnight-400 mb-6">We compared prices across all providers. Pick the one that suits you best.</p>

              {/* AI Recommendation */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 mb-6">
                <div className="flex items-center gap-2 text-sky-700 mb-3">
                  <Sparkles size={16} strokeWidth={2.4} />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Recommended</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-midnight-900 text-sm">{AI_RECOMMENDATION.flightOffer.airline} · {AI_RECOMMENDATION.flightOffer.provider.name}</p>
                    <p className="text-xs text-midnight-400 mt-0.5">{AI_RECOMMENDATION.flightOffer.departureTime} → {AI_RECOMMENDATION.flightOffer.arrivalTime} · {AI_RECOMMENDATION.flightOffer.duration} · Direct</p>
                    <p className="text-xs text-sky-600 mt-1.5 font-medium">{AI_RECOMMENDATION.reason}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-2xl font-extrabold text-midnight-900 tabular-nums">RM{AI_RECOMMENDATION.flightOffer.totalPrice.toLocaleString()}</p>
                    {selectedFlight?.id === AI_RECOMMENDATION.flightOffer.id ? (
                      <span className="text-xs font-bold text-sky-600">Selected</span>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => setSelectedFlight(AI_RECOMMENDATION.flightOffer)} className="mt-1">
                        Select <Check size={13} strokeWidth={3} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">All flight options</p>
              <div className="grid sm:grid-cols-2 gap-4">
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

          {/* Step 7 — Hotels */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 text-sky-600 mb-2">
                <HotelIcon size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold uppercase tracking-wider">Step 7</span>
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">Choose your hotel</h1>
              <p className="text-sm text-midnight-400 mb-6">We compared prices across all booking sites. Pick where you'd like to stay.</p>

              {/* AI Recommendation */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 mb-6">
                <div className="flex items-center gap-2 text-sky-700 mb-3">
                  <Sparkles size={16} strokeWidth={2.4} />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Recommended</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <img src={AI_RECOMMENDATION.hotel.image} alt={AI_RECOMMENDATION.hotel.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="font-bold text-midnight-900 text-sm">{AI_RECOMMENDATION.hotel.name}</p>
                      <p className="text-xs text-midnight-400 mt-0.5">{AI_RECOMMENDATION.hotel.area} · {AI_RECOMMENDATION.hotel.distanceFromCenter}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} fill="currentColor" strokeWidth={0} className="text-amber-500" />
                        <span className="text-xs font-bold text-midnight-700">{AI_RECOMMENDATION.hotel.rating}</span>
                        <span className="text-xs text-midnight-400">· {AI_RECOMMENDATION.hotel.reviews.toLocaleString()} reviews</span>
                      </div>
                      <p className="text-xs text-sky-600 mt-1.5 font-medium">Best value — closest to your Day 1 activities, within budget.</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-extrabold text-midnight-900 tabular-nums">RM{AI_RECOMMENDATION.hotelPrice}</p>
                    <p className="text-xs text-midnight-400">via {AI_RECOMMENDATION.hotel.bestPriceProvider}</p>
                    {selectedHotel?.id === AI_RECOMMENDATION.hotel.id ? (
                      <span className="text-xs font-bold text-sky-600">Selected</span>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => setSelectedHotel(AI_RECOMMENDATION.hotel)} className="mt-1">
                        Select <Check size={13} strokeWidth={3} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">All hotel options</p>
              <div className="grid sm:grid-cols-2 gap-4">
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

          {/* Step 8 — Build */}
          {step === 8 && (
            <motion.div key="s8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-10">
              <div className="h-16 w-16 rounded-lg bg-sky-500 flex items-center justify-center mx-auto mb-6">
                <Check size={30} className="text-white" strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-extrabold text-midnight-900 mb-2">{isEditing ? 'Confirm changes!' : 'Ready to build!'}</h1>
              <p className="text-sm text-midnight-400 mb-6 max-w-sm mx-auto">
                {isEditing ? 'Review your updated trip details and save the changes.' : `TRIPSHIFT will generate your optimized itinerary with ${requestedActivities.length} must-visit places, respecting your ${travelType === 'solo' ? 'solo' : 'group'} preferences and RM ${budget.toLocaleString()} budget.`}
              </p>
              <div className="rounded-xl bg-white border border-sand-200 p-5 text-left max-w-sm mx-auto mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-midnight-400">Destination</span><span className="font-bold text-midnight-900">{dest}</span></div>
                  <div className="flex justify-between"><span className="text-midnight-400">Dates</span><span className="font-bold text-midnight-900">{formatDate(startDate) || '15 Oct'}–{formatDate(endDate) || '18 Oct'}</span></div>
                  <div className="flex justify-between"><span className="text-midnight-400">Type</span><span className="font-bold text-midnight-900">{travelType === 'solo' ? 'Solo' : `Group · ${activeGroup?.name ?? '—'}`}</span></div>
                  <div className="flex justify-between"><span className="text-midnight-400">Budget</span><span className="font-bold text-midnight-900">RM {budget.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-midnight-400">Must-visit</span><span className="font-bold text-midnight-900">{requestedActivities.length} places</span></div>
                  <div className="flex justify-between"><span className="text-midnight-400">Flight</span><span className="font-bold text-midnight-900">{selectedFlight?.airline ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-midnight-400">Hotel</span><span className="font-bold text-midnight-900">{selectedHotel?.name ?? '—'}</span></div>
                </div>
              </div>
              <Button size="lg" onClick={handleComplete}>
                {isEditing ? 'Save Changes' : 'Build My Trip'} <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 8 && (
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button size="md" variant="secondary" onClick={() => setStep((s) => prevStep(s))}>
                <ArrowLeft size={16} /> Back
              </Button>
            ) : <div />}
            <Button size="md" onClick={() => setStep((s) => nextStep(s))} disabled={!canProceed()}>
              Next <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
