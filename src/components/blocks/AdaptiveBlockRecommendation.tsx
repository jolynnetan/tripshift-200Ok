import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X, Clock, Wallet, MapPin, Users } from 'lucide-react';
import type { ItineraryActivity, PlanAlternative, TravelGroup } from '@/types';
import { Button } from '@/components/Button';

interface AdaptiveBlockRecommendationProps {
  affectedBlock: ItineraryActivity | null;
  alternatives: PlanAlternative[];
  group: TravelGroup | null;
  onSelectAlternative: (alternative: PlanAlternative) => void;
  onKeepCurrent: () => void;
  selectedAltId?: string | null;
  onSelectAltId?: (id: string) => void;
}

export function AdaptiveBlockRecommendation({
  affectedBlock,
  alternatives,
  group,
  onSelectAlternative,
  onKeepCurrent,
  selectedAltId,
  onSelectAltId,
}: AdaptiveBlockRecommendationProps) {
  return (
    <AnimatePresence>
      {affectedBlock && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
        >
          {/* Affected block header */}
          <div className="flex items-center gap-2 text-amber-700 mb-3">
            <AlertTriangle size={16} strokeWidth={2.4} />
            <span className="text-xs font-bold uppercase tracking-wider">Affected Block</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{affectedBlock.emoji}</span>
            <div>
              <p className="font-bold text-midnight-900">{affectedBlock.title}</p>
              <p className="text-xs text-midnight-400">
                {affectedBlock.time}
                {affectedBlock.location && ` · ${affectedBlock.location}`}
              </p>
            </div>
          </div>

          {/* Suggested alternatives */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-midnight-400 mb-3">
            TRIPSHIFT suggests
          </h3>
          <div className="space-y-2 mb-4">
            {alternatives.map((alt, i) => (
              <motion.button
                key={alt.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onSelectAltId?.(alt.id)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  selectedAltId === alt.id
                    ? 'border-sky-400 bg-sky-50/30 ring-1 ring-sky-200'
                    : alt.recommended
                      ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                      : 'border-sand-200 bg-white hover:border-sand-300'
                }`}
              >
                {alt.recommended && selectedAltId !== alt.id && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1 block">
                    Recommended
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xl">{alt.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-midnight-900">{alt.title}</p>
                    {alt.detail && <p className="text-xs text-midnight-500 mt-0.5">{alt.detail}</p>}
                  </div>
                  {alt.budgetImpact > 0 && (
                    <span className="text-xs font-medium text-midnight-500">RM {alt.budgetImpact}</span>
                  )}
                </div>

                {/* Why this fits */}
                {selectedAltId === alt.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-sand-100 space-y-1.5"
                  >
                    {buildBlockEvidence(alt, group).map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                        <span className="text-xs text-midnight-600">{item}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="md"
              variant="success"
              fullWidth
              disabled={!selectedAltId}
              onClick={() => {
                const alt = alternatives.find((a) => a.id === selectedAltId);
                if (alt) onSelectAlternative(alt);
              }}
            >
              <Check size={16} strokeWidth={2.5} /> Replace Block
            </Button>
            <Button size="md" variant="secondary" fullWidth onClick={onKeepCurrent}>
              <X size={16} strokeWidth={2.5} /> Keep Current Plan
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildBlockEvidence(alt: PlanAlternative, group: TravelGroup | null): string[] {
  const evidence: string[] = [];
  const travellers = group?.travellers ?? [];

  // Group preferences
  if (alt.groupMatch !== undefined) {
    evidence.push(`Fits group preferences — ${alt.groupMatch}% match`);
  } else if (travellers.length > 0 && alt.category) {
    const matched = travellers.flatMap((t) => t.interests).filter((i) =>
      alt.category!.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(alt.category!.toLowerCase()),
    );
    if (matched.length > 0) {
      const count = travellers.filter((t) => t.interests.some((i) => matched.includes(i))).length;
      evidence.push(`Fits group preferences — ${count}/${travellers.length} travelers interested`);
    }
  }

  // Budget
  if (alt.budgetImpact === 0) {
    evidence.push('No extra cost — within budget');
  } else if (alt.budgetImpact < 30) {
    evidence.push('Low cost — within budget');
  } else {
    evidence.push('Within planned budget');
  }

  // Distance
  if (alt.transport) {
    const durMatch = alt.transport.duration.match(/(\d+)\s*min/i);
    if (durMatch) {
      evidence.push(`${durMatch[1]} min from previous activity`);
    }
  }

  // Schedule
  if (alt.scheduleCompatibility !== undefined && alt.scheduleCompatibility >= 80) {
    evidence.push('Fits current schedule');
  } else if (alt.arrivalTime) {
    evidence.push(`Arrives by ${alt.arrivalTime}`);
  }

  // Indoor
  if (alt.isOutdoor === false) {
    evidence.push('Indoor — weather-safe');
  }

  return evidence.length > 0 ? evidence : ['Fits your trip flow'];
}
