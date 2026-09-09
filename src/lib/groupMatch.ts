import type { Traveller, ItineraryActivity, ActivityCharacteristics, Behaviour, Interest, DisruptionType, ReasoningFactor } from '@/types';

const INTEREST_CATEGORY_MAP: Record<string, Interest[]> = {
  Culture: ['Culture', 'Photography'],
  Food: ['Food'],
  Shopping: ['Shopping'],
  Attraction: ['Culture', 'Photography', 'Adventure'],
  Activity: ['Adventure', 'Photography'],
  Travel: [],
  Nature: ['Nature', 'Photography', 'Relaxed'],
  Nightlife: ['Nightlife'],
  Entertainment: ['Nightlife', 'Culture'],
  Wellness: ['Relaxed', 'Nature'],
};

function behaviourMatchesActivity(behaviour: Behaviour, chars: ActivityCharacteristics): boolean {
  switch (behaviour) {
    case 'Prefers indoor activities': return chars.indoor;
    case "Doesn't like long walking": return chars.lowWalking;
    case 'Prefers relaxed schedules': return chars.relaxed;
    case 'Budget conscious': return chars.lowCost;
    case 'Avoids crowded places': return chars.lowCrowd;
    case 'Likes photography': return chars.photography;
    case 'Prefers nightlife': return chars.nightlife;
    case 'Likes early mornings': return chars.earlyMorning;
    case 'Prefers flexible schedules': return chars.flexibleSchedule;
    case 'Comfortable with walking': return !chars.lowWalking;
    case 'Likes busy areas': return !chars.lowCrowd;
    case 'Early bird': return chars.earlyMorning;
    case 'Night owl': return chars.nightlife;
    case 'Low walking tolerance': return chars.lowWalking;
    case 'High walking tolerance': return !chars.lowWalking;
    case 'Prefers packed schedule': return !chars.relaxed;
    default: return false;
  }
}

function behaviourRelevantToActivity(behaviour: Behaviour, chars: ActivityCharacteristics): boolean {
  switch (behaviour) {
    case 'Prefers indoor activities': return chars.indoor || !chars.indoor;
    case "Doesn't like long walking": return chars.lowWalking || !chars.lowWalking;
    case 'Prefers relaxed schedules': return chars.relaxed || !chars.relaxed;
    case 'Budget conscious': return chars.lowCost || !chars.lowCost;
    case 'Avoids crowded places': return chars.lowCrowd || !chars.lowCrowd;
    case 'Likes photography': return chars.photography || !chars.photography;
    case 'Prefers nightlife': return chars.nightlife || !chars.nightlife;
    case 'Likes early mornings': return chars.earlyMorning || !chars.earlyMorning;
    case 'Prefers flexible schedules': return chars.flexibleSchedule || !chars.flexibleSchedule;
    case 'Comfortable with walking': return chars.lowWalking || !chars.lowWalking;
    case 'Likes busy areas': return chars.lowCrowd || !chars.lowCrowd;
    case 'Early bird': return chars.earlyMorning || !chars.earlyMorning;
    case 'Night owl': return chars.nightlife || !chars.nightlife;
    case 'Low walking tolerance': return chars.lowWalking || !chars.lowWalking;
    case 'High walking tolerance': return chars.lowWalking || !chars.lowWalking;
    case 'Prefers packed schedule': return chars.relaxed || !chars.relaxed;
    default: return false;
  }
}

export function computeGroupMatch(
  activity: ItineraryActivity,
  travellers: Traveller[],
): number {
  if (travellers.length === 0 || !activity.characteristics) return 0;

  const chars = activity.characteristics;
  const relevantInterests = INTEREST_CATEGORY_MAP[activity.category ?? ''] ?? [];

  let totalScore = 0;

  for (const traveller of travellers) {
    let score = 50;

    // Interest match (up to +30)
    const interestMatches = traveller.interests.filter((i) => relevantInterests.includes(i)).length;
    const maxInterests = Math.max(relevantInterests.length, 1);
    score += (interestMatches / maxInterests) * 30;

    // Behaviour match (up to +20)
    const relevantBehaviours = traveller.behaviours.filter((b) => behaviourRelevantToActivity(b, chars));
    if (relevantBehaviours.length > 0) {
      const matched = relevantBehaviours.filter((b) => behaviourMatchesActivity(b, chars)).length;
      score += (matched / relevantBehaviours.length) * 20;
    }

    totalScore += Math.min(100, Math.max(0, score));
  }

  return Math.round(totalScore / travellers.length);
}

export function groupMatchExplanation(
  activity: ItineraryActivity,
  travellers: Traveller[],
  matchPercent: number,
): string {
  if (travellers.length === 0) return 'No travellers to compare.';

  const chars = activity.characteristics;
  if (!chars) return 'No compatibility data for this activity.';

  const relevantInterests = INTEREST_CATEGORY_MAP[activity.category ?? ''] ?? [];
  const sharedInterests = travellers.flatMap((t) => t.interests).filter((i) => relevantInterests.includes(i));
  const uniqueShared = [...new Set(sharedInterests)];

  const indoorSeekers = travellers.filter((t) => t.behaviours.includes('Prefers indoor activities'));
  const crowdAvoiders = travellers.filter((t) => t.behaviours.includes('Avoids crowded places'));
  const lowWalkers = travellers.filter((t) => t.behaviours.includes("Doesn't like long walking"));

  const parts: string[] = [];

  if (uniqueShared.length > 0) {
    parts.push(`Matches the group's interest in ${uniqueShared.map((i) => i.toLowerCase()).join(' and ')}`);
  }

  if (chars.indoor && indoorSeekers.length > 0) {
    parts.push(`indoor environment suits ${indoorSeekers.length} traveller${indoorSeekers.length > 1 ? 's' : ''} who prefer indoor activities`);
  }

  if (chars.lowCrowd && crowdAvoiders.length > 0) {
    parts.push(`avoids the crowded spaces the group prefers to avoid`);
  }

  if (chars.lowWalking && lowWalkers.length > 0) {
    parts.push(`minimal walking suits those who don't like long walks`);
  }

  if (parts.length === 0) {
    return matchPercent >= 75
      ? 'Good overall fit for the group\'s preferences and travel style.'
      : 'Partial fit — some preferences may not be fully met.';
  }

  return parts.join(', ') + '.';
}

export interface ScoredAlternative {
  groupMatch: number;
  scheduleCompatibility: number;
  budgetFit: boolean;
  totalScore: number;
  reasoning: ReasoningFactor[];
}

export function scoreAlternative(
  alt: {
    isOutdoor?: boolean;
    category?: string;
    characteristics?: ActivityCharacteristics;
    budgetImpact: number;
    transport?: { duration: string; cost: number };
    duration?: string;
  },
  context: {
    travellers: Traveller[];
    budget: number;
    currentSpend: number;
    disruptionType: DisruptionType;
    nextActivityTime?: string;
  },
): ScoredAlternative {
  const { travellers, budget, currentSpend, disruptionType } = context;

  // Group match
  const mockActivity: ItineraryActivity = {
    id: 'temp',
    time: '',
    emoji: '',
    title: '',
    category: alt.category,
    isOutdoor: alt.isOutdoor,
    characteristics: alt.characteristics,
  };
  const groupMatch = alt.characteristics ? computeGroupMatch(mockActivity, travellers) : 75;

  // Schedule compatibility (simplified — based on transport duration)
  let scheduleCompatibility = 85;
  if (alt.transport?.duration) {
    const mins = parseDurationMinutes(alt.transport.duration);
    if (mins > 30) scheduleCompatibility = 70;
    if (mins > 45) scheduleCompatibility = 55;
  }

  // Budget fit
  const newTotal = currentSpend + alt.budgetImpact;
  const budgetFit = newTotal <= budget;

  // Weather suitability
  const weatherSuitable = disruptionType === 'weather' ? !alt.isOutdoor : true;

  // Weighted total score based on disruption type
  const weights = getDisruptionWeights(disruptionType);

  const weatherScore = weatherSuitable ? 100 : 20;
  const budgetScore = budgetFit ? 100 : Math.max(20, 100 - ((newTotal - budget) / budget) * 200);
  const travelScore = alt.transport ? Math.max(40, 100 - parseDurationMinutes(alt.transport.duration) * 0.8) : 80;

  const totalScore = Math.round(
    weights.weather * weatherScore +
    weights.group * groupMatch +
    weights.schedule * scheduleCompatibility +
    weights.budget * budgetScore +
    weights.travel * travelScore,
  );

  // Build reasoning factors
  const reasoning: ReasoningFactor[] = [
    {
      icon: 'weather',
      label: 'Weather',
      value: weatherSuitable ? 'Indoor ✓' : 'Outdoor ✗',
      positive: weatherSuitable,
    },
    {
      icon: 'group',
      label: 'Group preference',
      value: `${groupMatch}% match`,
      positive: groupMatch >= 70,
    },
    {
      icon: 'budget',
      label: 'Budget',
      value: alt.budgetImpact > 0 ? `+RM ${alt.budgetImpact}` : 'RM 0',
      positive: budgetFit,
    },
    {
      icon: 'travel',
      label: 'Travel time',
      value: alt.transport?.duration ?? 'N/A',
      positive: travelScore >= 70,
    },
    {
      icon: 'schedule',
      label: 'Schedule',
      value: scheduleCompatibility >= 80 ? 'No conflict' : 'Tight connection',
      positive: scheduleCompatibility >= 75,
    },
  ];

  return {
    groupMatch,
    scheduleCompatibility,
    budgetFit,
    totalScore,
    reasoning,
  };
}

export function getDisruptionWeights(type: DisruptionType): {
  weather: number;
  group: number;
  schedule: number;
  budget: number;
  travel: number;
} {
  switch (type) {
    case 'weather':
      return { weather: 0.3, group: 0.2, schedule: 0.15, budget: 0.15, travel: 0.2 };
    case 'transport':
      return { weather: 0.05, group: 0.1, schedule: 0.35, budget: 0.15, travel: 0.35 };
    case 'delay':
      return { weather: 0.05, group: 0.1, schedule: 0.4, budget: 0.1, travel: 0.35 };
    case 'flight':
      return { weather: 0.1, group: 0.1, schedule: 0.35, budget: 0.2, travel: 0.25 };
    case 'attraction':
      return { weather: 0.1, group: 0.25, schedule: 0.2, budget: 0.2, travel: 0.25 };
    default:
      return { weather: 0.2, group: 0.2, schedule: 0.2, budget: 0.2, travel: 0.2 };
  }
}

function parseDurationMinutes(duration: string): number {
  const match = duration.match(/(\d+)\s*(?:h|hr|hour)s?\s*(\d+)?\s*m?/i);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
}

export function computeOverallGroupMatch(
  itinerary: ItineraryActivity[],
  travellers: Traveller[],
): number {
  const activitiesWithChars = itinerary.filter((a) => a.characteristics);
  if (activitiesWithChars.length === 0 || travellers.length === 0) return 0;

  const scores = activitiesWithChars.map((a) => computeGroupMatch(a, travellers));
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

export function computeActivityCompatibility(
  itinerary: ItineraryActivity[],
  travellers: Traveller[],
): { label: string; value: number }[] {
  return itinerary
    .filter((a) => a.characteristics && a.category !== 'Travel')
    .map((a) => ({
      label: a.title,
      value: computeGroupMatch(a, travellers),
    }));
}
