import { useState, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Check, Settings } from 'lucide-react';
import { Button } from '@/components/Button';
import type { Traveller, Interest, Behaviour, TravelStyle } from '@/types';
import { ALL_INTERESTS, ALL_BEHAVIOURS } from '@/data/comparisonData';

interface TravellerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (traveller: Omit<Traveller, 'id'>) => void;
  editingTraveller?: Traveller | null;
}

const AVATAR_OPTIONS = ['🧑', '👩', '🧔', '👨', '👱', '🧔‍♀️', '👨‍🦰', '👩‍🦰', '🧑‍🦱', '👩‍🦱'];
const TRAVEL_STYLES: TravelStyle[] = ['Budget', 'Mid-range', 'Premium'];

export function TravellerModal({ open, onClose, onSave, editingTraveller }: TravellerModalProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧑');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [behaviours, setBehaviours] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [customBehaviour, setCustomBehaviour] = useState('');
  const [budgetPreference, setBudgetPreference] = useState<TravelStyle>('Mid-range');

  useEffect(() => {
    if (editingTraveller) {
      setName(editingTraveller.name);
      setAvatar(editingTraveller.avatar);
      setInterests(editingTraveller.interests);
      setBehaviours(editingTraveller.behaviours);
      setBudgetPreference(editingTraveller.budgetPreference);
    } else {
      setName('');
      setAvatar('🧑');
      setInterests([]);
      setBehaviours([]);
      setBudgetPreference('Mid-range');
    }
  }, [editingTraveller, open]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => prev.includes(interest as Interest) ? prev.filter((i) => i !== interest) : [...prev, interest as Interest]);
  };

  const toggleBehaviour = (behaviour: string) => {
    setBehaviours((prev) => prev.includes(behaviour) ? prev.filter((b) => b !== behaviour) : [...prev, behaviour]);
  };

  const addCustom = (value: string, setter: (value: string) => void, current: string[], update: (values: string[]) => void) => {
    const trimmed = value.trim();
    if (!trimmed || current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    update([...current, trimmed]);
    setter('');
  };

  const handleCustomKeyDown = (event: KeyboardEvent<HTMLInputElement>, value: string, setter: (value: string) => void, current: string[], update: (values: string[]) => void) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCustom(value, setter, current, update);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), avatar, interests, behaviours: behaviours as Behaviour[], budgetPreference });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-midnight-950/50 backdrop-blur-sm p-0 sm:p-6"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-sand-100 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-midnight-900">
                  {editingTraveller ? 'Edit traveller' : 'Add traveller'}
                </h2>
                <p className="text-xs text-midnight-400 mt-0.5">
                  Preferences power the group match engine
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-xl flex items-center justify-center bg-sand-50 hover:bg-sand-100 transition-colors"
              >
                <X size={18} className="text-midnight-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Name + Avatar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Traveller name"
                  className="w-full rounded-xl border border-sand-200 px-4 py-3 text-base font-semibold text-midnight-900 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
                />
                <div className="flex gap-2 mt-3">
                  {AVATAR_OPTIONS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        avatar === a
                          ? 'bg-sky-50 border-2 border-sky-300'
                          : 'bg-sand-50 border border-sand-200 hover:bg-sand-100'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">
                  Travel style
                </label>
                <div className="flex gap-2">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setBudgetPreference(style)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        budgetPreference === style
                          ? 'bg-midnight-900 text-white'
                          : 'bg-white text-midnight-600 border border-sand-200 hover:border-sand-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">
                  <Heart size={12} fill="currentColor" strokeWidth={0} className="text-coral-500" />
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_INTERESTS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                          selected
                            ? 'bg-coral-50 text-coral-700 border border-coral-200'
                            : 'bg-white text-midnight-600 border border-sand-200 hover:border-sand-300'
                        }`}
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} onKeyDown={(e) => handleCustomKeyDown(e, customInterest, setCustomInterest, interests, (values) => setInterests(values as Interest[]))} placeholder="Add another interest…" className="min-w-0 flex-1 rounded-xl border border-sand-200 px-3 py-2 text-sm text-midnight-700 placeholder:text-midnight-300 focus:border-coral-300 focus:outline-none focus:ring-2 focus:ring-coral-100" />
                  <button onClick={() => addCustom(customInterest, setCustomInterest, interests, (values) => setInterests(values as Interest[]))} disabled={!customInterest.trim()} className="rounded-xl bg-coral-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Add</button>
                </div>
                {interests.filter((interest) => !ALL_INTERESTS.includes(interest)).length > 0 && <div className="mt-2 flex flex-wrap gap-2">{interests.filter((interest) => !ALL_INTERESTS.includes(interest)).map((interest) => <span key={interest} className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-semibold text-coral-700">{interest}</span>)}</div>}
              </div>

              {/* Behaviours */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">
                  <Settings size={12} strokeWidth={2.4} className="text-sky-500" />
                  Behaviours & preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_BEHAVIOURS.map((behaviour) => {
                    const selected = behaviours.includes(behaviour);
                    return (
                      <button
                        key={behaviour}
                        onClick={() => toggleBehaviour(behaviour)}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                          selected
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-white text-midnight-600 border border-sand-200 hover:border-sand-300'
                        }`}
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                        {behaviour}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={customBehaviour} onChange={(e) => setCustomBehaviour(e.target.value)} onKeyDown={(e) => handleCustomKeyDown(e, customBehaviour, setCustomBehaviour, behaviours, setBehaviours)} placeholder="Add another behaviour or preference…" className="min-w-0 flex-1 rounded-xl border border-sand-200 px-3 py-2 text-sm text-midnight-700 placeholder:text-midnight-300 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100" />
                  <button onClick={() => addCustom(customBehaviour, setCustomBehaviour, behaviours, setBehaviours)} disabled={!customBehaviour.trim()} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Add</button>
                </div>
                {behaviours.filter((behaviour) => !ALL_BEHAVIOURS.includes(behaviour as Behaviour)).length > 0 && <div className="mt-2 flex flex-wrap gap-2">{behaviours.filter((behaviour) => !ALL_BEHAVIOURS.includes(behaviour as Behaviour)).map((behaviour) => <span key={behaviour} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{behaviour}</span>)}</div>}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-sand-100 px-6 py-4 flex gap-3">
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleSave} disabled={!name.trim()}>
                {editingTraveller ? 'Save changes' : 'Add traveller'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
