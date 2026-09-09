import { useMemo, useState } from 'react';
import { Check, ChevronRight, Heart, Plus, Settings, Users } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InviteModal } from '@/components/InviteModal';
import { TravellerModal } from '@/components/TravellerModal';
import type { Interest, ItineraryActivity, TravelGroup, Traveller, Trip } from '@/types';
import { computeGroupMatch, groupMatchExplanation } from '@/lib/groupMatch';

interface TravellersSectionProps {
  trip: Trip;
  group: TravelGroup | null;
  onAddTraveller?: (traveller: Omit<Traveller, 'id'>) => void;
  onUpdateTraveller?: (id: string, traveller: Omit<Traveller, 'id'>) => void;
}

const INTERESTS: Interest[] = ['Food', 'Shopping', 'Photography', 'Culture', 'Nightlife', 'Nature', 'Adventure', 'Relaxed'];

export function TravellersSection({ trip, group, onAddTraveller, onUpdateTraveller }: TravellersSectionProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<Traveller | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const inviteLink = `${window.location.origin}/?join=${encodeURIComponent(group?.id ?? '')}`;
  const activities = useMemo(() => trip.itinerary.flatMap((day) => day.activities).filter((activity) => activity.category !== 'Travel' && activity.characteristics), [trip.itinerary]);
  const featuredActivities = activities.slice(0, 3);

  const preferenceCounts = useMemo(() => {
    const counts = new Map<Interest, number>();
    group?.travellers.forEach((traveller) => traveller.interests.forEach((interest) => counts.set(interest, (counts.get(interest) ?? 0) + 1)));
    return INTERESTS.map((interest) => ({ interest, count: counts.get(interest) ?? 0 })).filter(({ count }) => count > 0).sort((a, b) => b.count - a.count);
  }, [group]);

  if (!group) return null;

  const handleSaveTraveller = (traveller: Omit<Traveller, 'id'>) => {
    if (editing) onUpdateTraveller?.(editing.id, traveller);
    else onAddTraveller?.(traveller);
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <section className="border-y border-sand-100 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-midnight-400">
            <Users size={15} strokeWidth={2.2} />
            <span className="text-xs font-bold uppercase tracking-wider">Travellers</span>
          </div>
          <h2 className="mt-1 text-lg font-extrabold text-midnight-900">{group.name}</h2>
          <p className="mt-1 text-sm text-midnight-400">Everyone’s preferences help shape the itinerary.</p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}><Plus size={15} strokeWidth={2.5} /> Invite traveller</Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {group.travellers.map((traveller) => (
          <Card key={traveller.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-2xl">{traveller.avatar}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-midnight-900">{traveller.name}</p>
                    <p className="text-xs text-midnight-400">{traveller.budgetPreference} budget</p>
                  </div>
                  {onUpdateTraveller && <button onClick={() => { setEditing(traveller); setModalOpen(true); }} className="text-xs font-bold text-sky-600 hover:text-sky-800">Edit</button>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {traveller.interests.map((interest) => <span key={interest} className="rounded-full bg-coral-50 px-2 py-1 text-[11px] font-semibold text-coral-700">{interest}</span>)}
                  {traveller.behaviours.slice(0, 3).map((behaviour) => <span key={behaviour} className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">{behaviour.replace('Prefers ', '').replace('Likes ', '')}</span>)}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {group.travellers.length === 0 && <div className="rounded-xl border border-dashed border-sand-200 p-5 text-sm text-midnight-400 sm:col-span-2">Invite your first traveller to start building a shared preference profile.</div>}
      </div>

      {preferenceCounts.length > 0 && (
        <div className="mt-6 rounded-xl border border-sand-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-coral-500" fill="currentColor" strokeWidth={0} />
            <h3 className="text-sm font-extrabold text-midnight-900">Group preferences</h3>
            <span className="text-xs text-midnight-400">{group.travellers.length} travellers combined</span>
          </div>
          <div className="mt-4 space-y-3">
            {preferenceCounts.slice(0, 6).map(({ interest, count }) => (
              <div key={interest} className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-midnight-600">{interest}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand-100"><div className="h-full rounded-full bg-coral-400 transition-all" style={{ width: `${(count / group.travellers.length) * 100}%` }} /></div>
                <span className="w-8 text-right text-xs font-bold text-midnight-500">{count}/{group.travellers.length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {featuredActivities.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><Settings size={15} className="text-sky-500" /><h3 className="text-sm font-extrabold text-midnight-900">Why these activities fit</h3></div>
            <span className="text-xs text-midnight-400">Group-aware recommendations</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {featuredActivities.map((activity) => {
              const match = computeGroupMatch(activity, group.travellers);
              return <ActivityFit key={activity.id} activity={activity} match={match} travellers={group.travellers} />;
            })}
          </div>
        </div>
      )}

      <InviteModal open={inviteOpen} trip={trip} group={group} inviteLink={inviteLink} onClose={() => setInviteOpen(false)} />
      <TravellerModal open={modalOpen} editingTraveller={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSaveTraveller} />
    </section>
  );
}

function ActivityFit({ activity, match, travellers }: { activity: ItineraryActivity; match: number; travellers: Traveller[] }) {
  const explanation = groupMatchExplanation(activity, travellers, match);
  const matched = Math.max(0, Math.round((match / 100) * travellers.length));
  return (
    <div className="rounded-xl border border-sand-200 bg-white p-4">
      <div className="flex items-start gap-2"><span className="text-xl">{activity.emoji}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-midnight-900">{activity.title}</p><p className="text-xs text-midnight-400">{activity.category}</p></div></div>
      <p className="mt-3 text-xs font-bold text-emerald-700"><Check size={12} className="mr-1 inline" strokeWidth={3} />Matches {matched}/{travellers.length} travellers</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-midnight-500">{explanation}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-bold text-sky-600">{match}% fit <ChevronRight size={13} /></div>
    </div>
  );
}
