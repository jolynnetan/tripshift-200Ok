import type { NearbyRecommendation, NearbyTraveller, Traveller } from '@/types';

function parseDuration(duration: string): number {
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*hour/);
  return hours ? Number(hours[1]) : 1;
}

export function nearbyMatchScore(
  recommendation: NearbyRecommendation,
  travellers: Traveller[],
  budget: number,
  freeMinutes = 165,
  extraInterests: string[] = [],
): number {
  const interests = new Set<string>([
    ...travellers.flatMap((t) => t.interests),
    ...extraInterests.map((i) => i.toLowerCase()),
  ]);
  const matched = recommendation.interests.filter((interest) =>
    interests.has(interest.toLowerCase()),
  );
  const interestScore = matched.length > 0 ? Math.min(100, 72 + matched.length * 14) : 58;
  const timeScore = parseDuration(recommendation.duration) * 60 <= freeMinutes ? 100 : 45;
  const budgetScore = recommendation.cost <= Math.max(80, budget / Math.max(travellers.length, 1)) ? 100 : 48;
  const distanceScore = recommendation.distance <= 1 ? 100 : recommendation.distance <= 2 ? 86 : 68;
  return Math.round(interestScore * 0.4 + timeScore * 0.25 + distanceScore * 0.2 + budgetScore * 0.15);
}

export function nearbyTravellerMatch(traveller: NearbyTraveller, groupTravellers: Traveller[]): number {
  const groupInterests = new Set(groupTravellers.flatMap((member) => member.interests));
  const overlap = traveller.interests.filter((interest) => groupInterests.has(interest)).length;
  return Math.min(98, 82 + overlap * 6 + (traveller.distance < 1 ? 4 : 0));
}

export function nearbyRecommendationReason(recommendation: NearbyRecommendation, travellers: Traveller[], score: number): string {
  const sharedInterests = recommendation.interests.filter((interest) => travellers.some((traveller) => traveller.interests.includes(interest)));
  if (sharedInterests.length > 0) return `Matches your ${sharedInterests.join(' + ').toLowerCase()} preference and fits your free time.`;
  return `Fits your free-time window and stays within ${recommendation.distance} km of your current location.`;
}
