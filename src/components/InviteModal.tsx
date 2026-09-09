import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Link, Users, X } from 'lucide-react';
import { Button } from '@/components/Button';
import type { TravelGroup, Trip } from '@/types';

interface InviteModalProps {
  open: boolean;
  trip: Trip;
  group: TravelGroup;
  inviteLink: string;
  onClose: () => void;
}

export function InviteModal({ open, trip, group, inviteLink, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-midnight-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-sand-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Trip invite</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-midnight-900">Bring your travellers along</h2>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand-50 transition-colors hover:bg-sand-100">
                <X size={18} className="text-midnight-400" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-sand-200 bg-sand-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-midnight-400">Trip name</p>
                  <p className="mt-1 text-sm font-bold text-midnight-900">{trip.destination}</p>
                </div>
                <div className="rounded-xl border border-sand-200 bg-sand-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-midnight-400">Travellers</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-midnight-900"><Users size={14} className="text-sky-500" /> {group.travellers.length}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-midnight-400">Shareable invite link</p>
                <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/40 p-2">
                  <Link size={16} className="ml-2 shrink-0 text-sky-600" />
                  <input readOnly value={inviteLink} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs font-medium text-midnight-700 outline-none" />
                  <Button size="sm" onClick={copyLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy link'}
                  </Button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-midnight-500">Travellers who join can add their own interests and travel style. TRIPSHIFT will use everyone’s preferences to shape better activities for the group.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
