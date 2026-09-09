import type { NearbyRecommendation, NearbyTraveller } from '@/types';

export const NEARBY_RECOMMENDATIONS: NearbyRecommendation[] = [
  {
    id: 'nearby-ramen', type: 'activity', emoji: '🍜', title: 'Ramen Dinner', category: 'Food', time: '18:30', duration: '1 hour', distance: 1.2, cost: 24, location: 'Shibuya, Tokyo',
    description: 'A quick local ramen stop that leaves plenty of time to get back to your evening plans.', interests: ['Food'],
  },
  {
    id: 'nearby-photo-walk', type: 'activity', emoji: '📷', title: 'Photography Walk', category: 'Explore', time: '17:30', duration: '1.5 hours', distance: 2.1, cost: 0, location: 'Yoyogi Park',
    description: 'A relaxed photo route through leafy paths and neighbourhood streets.', interests: ['Photography', 'Culture', 'Nature'],
  },
  {
    id: 'nearby-market', type: 'event', emoji: '🛍️', title: 'Shibuya Night Market', category: 'Events', time: '19:00', duration: '2 hours', distance: 0.8, cost: 0, location: 'Shibuya Stream',
    description: 'Independent makers, street snacks and live music just a short walk away.', interests: ['Shopping', 'Food', 'Nightlife'],
  },
  {
    id: 'nearby-gallery', type: 'event', emoji: '🎨', title: 'Late Gallery Opening', category: 'Culture', time: '18:00', duration: '1.5 hours', distance: 1.6, cost: 18, location: 'Daikanyama Art Street',
    description: 'A small contemporary exhibition with a late opening tonight.', interests: ['Culture', 'Photography'],
  },
  {
    id: 'nearby-cafe', type: 'activity', emoji: '☕', title: 'Specialty Café Break', category: 'Café', time: '17:45', duration: '1 hour', distance: 0.5, cost: 15, location: 'Omotesando',
    description: 'A calm place to reset with coffee, dessert and no fixed booking.', interests: ['Food', 'Relaxed'],
  },
];

export const NEARBY_TRAVELLERS: NearbyTraveller[] = [
  { id: 'nearby-mia', name: 'Mia', avatar: '👩', interests: ['Food', 'Photography'], distance: 0.7, availableUntil: '20:15', openToJoin: true },
  { id: 'nearby-daniel', name: 'Daniel', avatar: '🧔', interests: ['Culture', 'Shopping'], distance: 1.1, availableUntil: '19:45', openToJoin: true },
  { id: 'nearby-sora', name: 'Sora', avatar: '👩‍🦰', interests: ['Nightlife', 'Food'], distance: 1.8, availableUntil: '21:00', openToJoin: true },
];
