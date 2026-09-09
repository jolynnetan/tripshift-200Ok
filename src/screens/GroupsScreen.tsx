import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Heart, Check, Pencil, Trash2, Link } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TravellerModal } from '@/components/TravellerModal';
import { InviteModal } from '@/components/InviteModal';
import type { TravelGroup, Traveller, Interest } from '@/types';

interface GroupsScreenProps {
  groups: TravelGroup[];
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
  onAddTraveller: (groupId: string, t: Omit<Traveller, 'id'>) => void;
  onUpdateTraveller: (groupId: string, id: string, t: Omit<Traveller, 'id'>) => void;
  onDeleteTraveller: (groupId: string, id: string) => void;
}

export function GroupsScreen({
  groups,
  onCreateGroup,
  onDeleteGroup,
  onAddTraveller,
  onUpdateTraveller,
  onDeleteTraveller,
}: GroupsScreenProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Traveller | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id ?? '');
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<string | null>(null);
  const [confirmDeleteTraveller, setConfirmDeleteTraveller] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? groups[0];

  const inviteLink = `${window.location.origin}/?join=${encodeURIComponent(activeGroup?.id ?? '')}`;

  const preferenceCounts = useMemo(() => {
    const INTERESTS: Interest[] = ['Food', 'Shopping', 'Photography', 'Culture', 'Nightlife', 'Nature', 'Adventure', 'Relaxed'];
    const counts = new Map<Interest, number>();
    activeGroup?.travellers.forEach((t) => t.interests.forEach((i) => counts.set(i, (counts.get(i) ?? 0) + 1)));
    return INTERESTS.map((interest) => ({ interest, count: counts.get(interest) ?? 0 })).filter(({ count }) => count > 0).sort((a, b) => b.count - a.count);
  }, [activeGroup]);

  const handleAddTraveller = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEditTraveller = (t: Traveller) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleSave = (t: Omit<Traveller, 'id'>) => {
    if (!activeGroup) return;
    if (editing) {
      onUpdateTraveller(activeGroup.id, editing.id, t);
    } else {
      onAddTraveller(activeGroup.id, t);
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    onCreateGroup(newGroupName.trim());
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <div className="flex items-center gap-2 text-sky-600 mb-1.5">
            <Users size={16} strokeWidth={2.4} />
            <span className="text-xs font-bold uppercase tracking-wider">Groups</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-midnight-900">Travel groups</h1>
          <p className="mt-1 text-sm text-midnight-400">Reuse traveller profiles across trips.</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateGroup(true)}>
          <Plus size={16} strokeWidth={2.5} />
          Create Group
        </Button>
      </motion.div>

      {/* Create group inline */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 flex gap-2"
          >
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name (e.g. Friends A, Family)"
              className="flex-1 rounded-lg border border-sand-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              autoFocus
            />
            <Button size="md" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create</Button>
            <Button size="md" variant="secondary" onClick={() => setShowCreateGroup(false)}>Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group tabs */}
      {groups.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeGroupId === g.id
                  ? 'bg-midnight-900 text-white'
                  : 'bg-white text-midnight-500 border border-sand-200 hover:bg-sand-50'
              }`}
            >
              {g.name}
              <span className="ml-1.5 text-xs opacity-60">({g.travellers.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Active group content */}
      {activeGroup && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-midnight-900">{activeGroup.name}</h2>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={() => setInviteOpen(true)}>
                <Link size={14} strokeWidth={2.2} /> Invite link
              </Button>
              <button
                onClick={() => setConfirmDeleteGroup(activeGroup.id)}
                className="text-xs font-semibold text-midnight-400 hover:text-coral-500 transition-colors"
              >
                Delete group
              </button>
            </div>
          </div>

          {/* Group preferences summary */}
          {preferenceCounts.length > 0 && (
            <div className="mb-5 rounded-xl border border-sand-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={15} className="text-coral-500" fill="currentColor" strokeWidth={0} />
                <h3 className="text-sm font-extrabold text-midnight-900">Group preferences</h3>
                <span className="text-xs text-midnight-400">{activeGroup.travellers.length} travellers combined</span>
              </div>
              <div className="space-y-3">
                {preferenceCounts.slice(0, 8).map(({ interest, count }) => (
                  <div key={interest} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-semibold text-midnight-600">{interest}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand-100">
                      <div className="h-full rounded-full bg-coral-400 transition-all" style={{ width: `${(count / activeGroup.travellers.length) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-midnight-500">{count}/{activeGroup.travellers.length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travellers */}
          <div className="grid sm:grid-cols-2 gap-4">
            {activeGroup.travellers.map((t, i) => (
              <Card key={t.id} delay={i * 0.05} className="p-5 relative group">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditTraveller(t)} className="h-8 w-8 rounded-lg bg-sand-50 hover:bg-sand-100 flex items-center justify-center transition-colors">
                    <Pencil size={13} className="text-midnight-400" strokeWidth={2.2} />
                  </button>
                  <button onClick={() => setConfirmDeleteTraveller(t.id)} className="h-8 w-8 rounded-lg bg-sand-50 hover:bg-coral-50 flex items-center justify-center transition-colors">
                    <Trash2 size={13} className="text-midnight-400 hover:text-coral-500" strokeWidth={2.2} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-lg bg-sand-100 flex items-center justify-center text-2xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-midnight-900">{t.name}</p>
                    <p className="text-xs text-midnight-400">{t.budgetPreference} budget</p>
                  </div>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400 mb-2 flex items-center gap-1">
                  <Heart size={11} fill="currentColor" strokeWidth={0} className="text-coral-500" /> Interests
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.interests.map((interest) => (
                    <span key={interest} className="text-xs font-medium text-coral-700">{interest}</span>
                  ))}
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-midnight-400 mb-2">
                  Behaviours
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {t.behaviours.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                      <Check size={10} strokeWidth={2.5} /> {b}
                    </span>
                  ))}
                </div>

                <AnimatePresence>
                  {confirmDeleteTraveller === t.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-5 text-center">
                      <p className="text-sm font-semibold text-midnight-700">Remove {t.name}?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setConfirmDeleteTraveller(null)}>Cancel</Button>
                        <Button size="sm" variant="coral" onClick={() => { onDeleteTraveller(activeGroup.id, t.id); setConfirmDeleteTraveller(null); }}>
                          <Trash2 size={14} strokeWidth={2.5} /> Remove
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}

            {activeGroup.travellers.length < 6 && (
              <button onClick={handleAddTraveller}
                className="rounded-xl border-2 border-dashed border-sand-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all p-5 flex flex-col items-center justify-center gap-2 min-h-[180px] group">
                <div className="h-11 w-11 rounded-lg bg-sand-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors">
                  <Plus size={20} className="text-midnight-400 group-hover:text-sky-500 transition-colors" strokeWidth={2.2} />
                </div>
                <p className="text-sm font-semibold text-midnight-400 group-hover:text-sky-600 transition-colors">Add traveller</p>
              </button>
            )}
          </div>

          {/* Delete group confirmation */}
          <AnimatePresence>
            {confirmDeleteGroup === activeGroup.id && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-950/50 backdrop-blur-sm p-6"
                onClick={() => setConfirmDeleteGroup(null)}>
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-card">
                  <p className="text-base font-bold text-midnight-900 mb-2">Delete "{activeGroup.name}"?</p>
                  <p className="text-sm text-midnight-400 mb-5">This will remove the group and all its travellers.</p>
                  <div className="flex gap-2">
                    <Button fullWidth variant="secondary" onClick={() => setConfirmDeleteGroup(null)}>Cancel</Button>
                    <Button fullWidth variant="coral" onClick={() => { onDeleteGroup(activeGroup.id); setConfirmDeleteGroup(null); }}>
                      <Trash2 size={16} strokeWidth={2.5} /> Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {groups.length === 0 && !showCreateGroup && (
        <div className="text-center py-20">
          <p className="text-midnight-400 mb-4">No groups yet. Create your first travel group.</p>
          <Button onClick={() => setShowCreateGroup(true)}>
            <Plus size={16} strokeWidth={2.5} /> Create Group
          </Button>
        </div>
      )}

      <TravellerModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editingTraveller={editing} />
      {activeGroup && (
        <InviteModal open={inviteOpen} trip={{ id: activeGroup.id, destination: activeGroup.name, country: '', emoji: '👥', coverImage: '', startDate: '', endDate: '', startMonth: '', endMonth: '', totalDays: 0, currentDay: 0, status: 'upcoming', travelType: 'group', groupId: activeGroup.id, budget: 0, estimatedSpend: 0, itinerary: [], originalItinerary: [], selectedFlight: null, selectedHotel: null, appliedPlans: [], requestedActivities: [], weather: [] }} group={activeGroup} inviteLink={inviteLink} onClose={() => setInviteOpen(false)} />
      )}
    </div>
  );
}
