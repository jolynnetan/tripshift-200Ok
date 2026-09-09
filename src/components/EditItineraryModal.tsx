import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, MapPin, Clock, Wallet, ArrowLeft, ArrowRight, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/Button';
import type { Trip, ItineraryActivity } from '@/types';

interface EditItineraryModalProps {
  trip: Trip;
  onClose: () => void;
  onReplaceActivity: (dayNumber: number, activityId: string, newActivity: ItineraryActivity) => void;
}

const EMOJI_POOL = ['🏛️', '🍜', '🗼', '⛩️', '🛍️', '🍣', '🎢', '🌸', '🍵', '🎨', '🚆', '🚶', '🏨', '✈️', '🍱', '🌃', '💆', '🎭'];

const SUGGESTED_ACTIVITIES: { title: string; emoji: string; category: string; cost: number; duration: string; isOutdoor: boolean }[] = [
  { title: 'Tokyo National Museum', emoji: '🏛️', category: 'Culture', cost: 10, duration: '2 hr', isOutdoor: false },
  { title: 'Senso-ji Temple', emoji: '⛩️', category: 'Culture', cost: 0, duration: '1 hr', isOutdoor: true },
  { title: 'Shibuya Crossing', emoji: '🌃', category: 'Attraction', cost: 0, duration: '30 min', isOutdoor: true },
  { title: 'Tsukiji Outer Market', emoji: '🍣', category: 'Food', cost: 30, duration: '1.5 hr', isOutdoor: true },
  { title: 'Meiji Shrine', emoji: '⛩️', category: 'Culture', cost: 0, duration: '1 hr', isOutdoor: true },
  { title: 'Akihabara Electric Town', emoji: '🛍️', category: 'Shopping', cost: 20, duration: '2 hr', isOutdoor: false },
  { title: 'Shinjuku Gyoen Garden', emoji: '🌸', category: 'Attraction', cost: 5, duration: '1.5 hr', isOutdoor: true },
  { title: 'Robot Restaurant Show', emoji: '🎭', category: 'Entertainment', cost: 50, duration: '1.5 hr', isOutdoor: false },
  { title: 'Ramen Tasting Tour', emoji: '🍜', category: 'Food', cost: 25, duration: '1.5 hr', isOutdoor: false },
  { title: 'Tokyo Skytree', emoji: '🗼', category: 'Attraction', cost: 20, duration: '1.5 hr', isOutdoor: false },
  { title: 'Tea Ceremony Experience', emoji: '🍵', category: 'Culture', cost: 35, duration: '1 hr', isOutdoor: false },
  { title: 'Onsen Hot Spring', emoji: '💆', category: 'Wellness', cost: 40, duration: '2 hr', isOutdoor: false },
  { title: 'Imperial Palace Walk', emoji: '🏯', category: 'Culture', cost: 0, duration: '1.5 hr', isOutdoor: true },
  { title: 'Ginza Shopping Street', emoji: '💎', category: 'Shopping', cost: 30, duration: '2 hr', isOutdoor: false },
  { title: 'Ueno Park', emoji: '🌳', category: 'Nature', cost: 0, duration: '1 hr', isOutdoor: true },
  { title: 'Cat Café MoCHA', emoji: '🐱', category: 'Activity', cost: 15, duration: '1 hr', isOutdoor: false },
  { title: 'Golden Gai Bar Hopping', emoji: '🍺', category: 'Nightlife', cost: 40, duration: '2 hr', isOutdoor: false },
  { title: 'teamLab Borderless', emoji: '🎨', category: 'Attraction', cost: 30, duration: '2 hr', isOutdoor: false },
  { title: 'Ameyoko Market', emoji: '🛒', category: 'Shopping', cost: 0, duration: '1.5 hr', isOutdoor: true },
  { title: 'Yanaka Old Town Walk', emoji: '🏘️', category: 'Culture', cost: 0, duration: '1.5 hr', isOutdoor: true },
  { title: 'Sumo Morning Practice', emoji: '🤼', category: 'Culture', cost: 50, duration: '1 hr', isOutdoor: false },
  { title: 'Odaiba Seaside Park', emoji: '🏖️', category: 'Nature', cost: 0, duration: '1.5 hr', isOutdoor: true },
  { title: 'Pokemon Center Shibuya', emoji: '🎮', category: 'Shopping', cost: 10, duration: '45 min', isOutdoor: false },
  { title: 'Sushi Making Class', emoji: '🍙', category: 'Food', cost: 60, duration: '2 hr', isOutdoor: false },
];

export function EditItineraryModal({ trip, onClose, onReplaceActivity }: EditItineraryModalProps) {
  const [selectedDay, setSelectedDay] = useState(trip.itinerary[0]?.day ?? 1);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customEmoji, setCustomEmoji] = useState('📍');
  const [customCost, setCustomCost] = useState('0');
  const [customDuration, setCustomDuration] = useState('1 hr');
  const [customOutdoor, setCustomOutdoor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const day = trip.itinerary.find((d) => d.day === selectedDay) ?? trip.itinerary[0];
  const editingActivity = day?.activities.find((a) => a.id === editingActivityId) ?? null;

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return SUGGESTED_ACTIVITIES;
    const q = searchQuery.toLowerCase();
    return SUGGESTED_ACTIVITIES.filter(
      (s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleSelectSuggested = (suggested: typeof SUGGESTED_ACTIVITIES[0]) => {
    if (!editingActivity) return;
    const newActivity: ItineraryActivity = {
      ...editingActivity,
      title: suggested.title,
      emoji: suggested.emoji,
      category: suggested.category,
      cost: suggested.cost,
      duration: suggested.duration,
      isOutdoor: suggested.isOutdoor,
      location: undefined,
      transport: undefined,
      optimizationNote: undefined,
      planTag: 'B',
    };
    onReplaceActivity(selectedDay, editingActivity.id, newActivity);
    setEditingActivityId(null);
    setCustomTitle('');
    setCustomEmoji('📍');
    setCustomCost('0');
    setCustomDuration('1 hr');
    setCustomOutdoor(false);
  };

  const handleCustomAdd = () => {
    if (!editingActivity || !customTitle.trim()) return;
    const newActivity: ItineraryActivity = {
      ...editingActivity,
      title: customTitle.trim(),
      emoji: customEmoji,
      cost: parseInt(customCost) || 0,
      duration: customDuration,
      isOutdoor: customOutdoor,
      category: 'Custom',
      location: undefined,
      transport: undefined,
      optimizationNote: undefined,
      planTag: 'B',
    };
    onReplaceActivity(selectedDay, editingActivity.id, newActivity);
    setEditingActivityId(null);
    setCustomTitle('');
    setCustomEmoji('📍');
    setCustomCost('0');
    setCustomDuration('1 hr');
    setCustomOutdoor(false);
  };

  const handleRemoveActivity = () => {
    if (!editingActivity) return;
    const removedActivity: ItineraryActivity = {
      ...editingActivity,
      title: 'Free time',
      emoji: '☕',
      cost: 0,
      duration: '—',
      category: 'Free',
      isOutdoor: false,
      location: undefined,
      transport: undefined,
      optimizationNote: undefined,
      planTag: 'B',
    };
    onReplaceActivity(selectedDay, editingActivity.id, removedActivity);
    setEditingActivityId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-midnight-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-sand-50 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-sand-50 z-10 px-5 pt-5 pb-3 border-b border-sand-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-extrabold text-midnight-900">Edit itinerary</h2>
              <p className="text-xs text-midnight-400 mt-0.5">{trip.destination} · Tap an activity to replace it</p>
            </div>
            <button onClick={onClose} className="h-9 w-9 rounded-lg bg-white border border-sand-200 flex items-center justify-center hover:bg-sand-100 transition-colors">
              <X size={18} className="text-midnight-500" strokeWidth={2.4} />
            </button>
          </div>

          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {trip.itinerary.map((d) => (
              <button
                key={d.day}
                onClick={() => { setSelectedDay(d.day); setEditingActivityId(null); }}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${selectedDay === d.day ? 'bg-midnight-900 text-white' : 'bg-white text-midnight-500 border border-sand-200 hover:bg-sand-50'}`}
              >
                Day {d.day}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            {/* Activity list view */}
            {!editingActivityId && (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative">
                  <div className="absolute left-[1.4rem] top-3 bottom-3 w-px bg-sand-200" />
                  <div className="space-y-1">
                    {day?.activities.map((act, i) => (
                      <motion.button
                        key={act.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setEditingActivityId(act.id)}
                        className="relative flex items-start gap-4 w-full text-left px-1 py-2.5 hover:bg-white rounded-lg -mx-1 px-2 transition-colors group"
                      >
                        <div className="relative z-10 h-11 w-11 rounded-lg border bg-white border-sand-200 flex items-center justify-center text-xl shrink-0">
                          {act.emoji}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-midnight-900 tabular-nums">{act.time}</span>
                            {act.planTag && <span className="text-[10px] font-bold uppercase text-emerald-600">Plan {act.planTag}</span>}
                            {act.isRequested && <span className="text-[10px] font-bold uppercase text-coral-600">Must-visit</span>}
                          </div>
                          <p className="text-sm font-semibold mt-0.5 text-midnight-900">{act.title}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {act.duration && act.duration !== '—' && <span className="flex items-center gap-1 text-xs text-midnight-400"><Clock size={10} /> {act.duration}</span>}
                            {act.cost !== undefined && act.cost > 0 && <span className="flex items-center gap-1 text-xs text-midnight-500"><Wallet size={10} /> RM {act.cost}</span>}
                          </div>
                        </div>
                        <div className="pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold text-sky-600">Replace</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Replace activity view */}
            {editingActivityId && editingActivity && (
              <motion.div key="replace" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <button
                  onClick={() => setEditingActivityId(null)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-midnight-400 hover:text-midnight-700 mb-4 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Day {selectedDay}
                </button>

                {/* Current activity */}
                <div className="rounded-xl bg-white border border-sand-200 p-4 mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-midnight-400 block mb-2">Replacing</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{editingActivity.emoji}</span>
                    <div>
                      <p className="font-bold text-midnight-900">{editingActivity.title}</p>
                      <p className="text-xs text-midnight-400">{editingActivity.time}{editingActivity.duration && editingActivity.duration !== '—' && ` · ${editingActivity.duration}`}{editingActivity.cost !== undefined && editingActivity.cost > 0 && ` · RM ${editingActivity.cost}`}</p>
                    </div>
                  </div>
                </div>

                {/* AI suggestion hint */}
                <div className="flex items-center gap-2 text-sky-600 mb-3">
                  <Sparkles size={14} strokeWidth={2.4} />
                  <span className="text-xs font-bold uppercase tracking-wider">Suggested replacements</span>
                </div>

                {/* Search bar */}
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-300" strokeWidth={2.2} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search places to visit..."
                    className="w-full rounded-lg border border-sand-200 bg-white pl-9 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => handleSelectSuggested(s)}
                      className="flex items-start gap-3 rounded-xl border border-sand-200 bg-white p-3.5 hover:border-sky-300 hover:bg-sky-50/30 transition-all text-left group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-sand-100 flex items-center justify-center text-xl shrink-0">{s.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-midnight-900 truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-midnight-400">
                          <span>{s.category}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Clock size={10} /> {s.duration}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Wallet size={10} /> RM {s.cost}</span>
                        </div>
                      </div>
                      <Check size={15} className="text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" strokeWidth={3} />
                    </button>
                  ))}
                  {filteredSuggestions.length === 0 && (
                    <p className="col-span-full text-center text-sm text-midnight-400 py-4">No places found. Try a different search or add your own below.</p>
                  )}
                </div>

                {/* Custom activity */}
                <div className="flex items-center gap-2 text-midnight-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Or add your own</span>
                </div>
                <div className="rounded-xl bg-white border border-sand-200 p-4 space-y-3 mb-4">
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1.5">Icon</label>
                      <div className="flex flex-wrap gap-1 max-w-[8rem]">
                        {EMOJI_POOL.slice(0, 8).map((e) => (
                          <button
                            key={e}
                            onClick={() => setCustomEmoji(e)}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-lg transition-all ${customEmoji === e ? 'bg-sky-100 ring-1 ring-sky-300' : 'bg-sand-50 hover:bg-sand-100'}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1.5">Activity name</label>
                      <input
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. visit a cat cafe"
                        className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1.5">Cost (RM)</label>
                      <input type="number" value={customCost} onChange={(e) => setCustomCost(e.target.value)} className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1.5">Duration</label>
                      <input value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-1.5">Outdoor</label>
                      <button
                        onClick={() => setCustomOutdoor(!customOutdoor)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${customOutdoor ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-sand-200 bg-white text-midnight-400'}`}
                      >
                        {customOutdoor ? 'Yes' : 'No'}
                      </button>
                    </div>
                  </div>
                  <Button size="md" fullWidth onClick={handleCustomAdd} disabled={!customTitle.trim()}>
                    <Check size={16} strokeWidth={2.5} /> Replace with custom activity
                  </Button>
                </div>

                {/* Remove activity */}
                <button
                  onClick={handleRemoveActivity}
                  className="w-full text-center text-sm font-semibold text-coral-500 hover:text-coral-700 transition-colors py-2"
                >
                  Replace with free time instead
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-sand-50 border-t border-sand-100 px-5 py-3">
          <Button size="md" fullWidth onClick={onClose}>
            <Check size={16} strokeWidth={2.5} /> Done editing
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
