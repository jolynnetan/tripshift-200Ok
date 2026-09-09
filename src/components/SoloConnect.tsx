import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Check, X, Shield, ArrowRight, MapPin, Ban, Flag, LogOut, Eye } from 'lucide-react';
import { Button } from '@/components/Button';

interface SoloConnectProps {
  destination: string;
  dates: string;
  budget: number;
  interests: string[];
}

interface MatchResult {
  id: string;
  name: string;
  avatar: string;
  type: 'solo' | 'group';
  interests: string[];
  verified: boolean;
  area: string;
  travelStyle: string;
  memberCount?: number;
}

const MOCK_MATCHES: MatchResult[] = [
  {
    id: 'm1',
    name: 'Mika',
    avatar: '👩',
    type: 'solo',
    interests: ['Food', 'Culture'],
    verified: true,
    area: 'Staying around Shinjuku',
    travelStyle: 'Food + Culture',
  },
  {
    id: 'm2',
    name: 'Kenji',
    avatar: '👨',
    type: 'solo',
    interests: ['Shopping', 'Photography'],
    verified: true,
    area: 'Staying around Shibuya',
    travelStyle: 'Shopping + Photography',
  },
  {
    id: 'm3',
    name: 'Tokyo Travel Group',
    avatar: '👥',
    type: 'group',
    interests: ['Food', 'Culture', 'Adventure'],
    verified: true,
    area: 'Staying around Asakusa',
    travelStyle: 'Mixed',
    memberCount: 3,
  },
];

export function SoloConnect({ destination, dates, budget, interests }: SoloConnectProps) {
  const [requests, setRequests] = useState<Record<string, 'none' | 'pending' | 'accepted'>>({});

  const handleRequest = (id: string) => {
    setRequests((prev) => ({ ...prev, [id]: 'pending' }));
  };

  const handleCancel = (id: string) => {
    setRequests((prev) => ({ ...prev, [id]: 'none' }));
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sky-600 mb-2">
        <Users size={16} strokeWidth={2.4} />
        <span className="text-xs font-bold uppercase tracking-wider">Travelling solo?</span>
      </div>
      <h3 className="text-lg font-extrabold text-midnight-900 mb-1">Find travellers with compatible plans</h3>
      <p className="text-sm text-midnight-400 mb-4">
        Connect with people going to {destination} around the same time. No sensitive info is shared.
      </p>

      {/* Safety reminder */}
      <div className="flex items-start gap-2 mb-5 text-sm text-midnight-500">
        <Shield size={15} className="shrink-0 mt-0.5" strokeWidth={2.2} />
        <p className="leading-relaxed">
          Meet in public places and avoid sharing sensitive personal information. All connections require mutual consent.
        </p>
      </div>

      {/* Matches */}
      <div className="space-y-0 divide-y divide-sand-100">
        {MOCK_MATCHES.map((match, i) => {
          const status = requests[match.id] ?? 'none';
          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="py-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-lg bg-sand-100 flex items-center justify-center text-2xl shrink-0">
                  {match.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-midnight-900">{match.name}</p>
                    {match.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Shield size={11} strokeWidth={2.4} /> Verified
                      </span>
                    )}
                    {match.type === 'group' && match.memberCount && (
                      <span className="text-xs text-midnight-400">{match.memberCount} travellers</span>
                    )}
                  </div>
                  <p className="text-sm text-midnight-500 mt-0.5">{match.travelStyle} · {match.interests.join(' · ')}</p>
                  <p className="text-xs text-midnight-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {match.area}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="mt-3">
                {status === 'none' && (
                  <Button size="sm" variant="secondary" onClick={() => handleRequest(match.id)}>
                    <User size={14} strokeWidth={2.4} /> Request to Connect
                  </Button>
                )}
                {status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-xs font-medium text-amber-700 flex items-center gap-1.5">
                      Request sent — waiting for review
                    </div>
                    <button onClick={() => handleCancel(match.id)} className="text-xs font-semibold text-midnight-400 hover:text-coral-500 transition-colors px-2">
                      Cancel
                    </button>
                  </div>
                )}
                {status === 'accepted' && (
                  <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <Check size={12} strokeWidth={2.5} /> Connected — shared trip space is now available
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Safety controls */}
      <div className="mt-4 pt-4 border-t border-sand-100">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Block', icon: Ban },
            { label: 'Report', icon: Flag },
            { label: 'Leave', icon: LogOut },
            { label: 'Hide Profile', icon: Eye },
          ].map((ctrl) => {
            const Icon = ctrl.icon;
            return (
              <button key={ctrl.label} className="flex items-center gap-1.5 text-xs font-medium text-midnight-400 hover:text-midnight-600 transition-colors px-2 py-1">
                <Icon size={12} strokeWidth={2.2} /> {ctrl.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
