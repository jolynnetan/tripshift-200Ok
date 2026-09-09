import type {
  Provider,
  FlightOffer,
  Hotel,
  HotelOffer,
  AIRecommendation,
  WeatherForecast,
  Traveller,
  BudgetItem,
  LocalInsight,
  ExploreItem,
  Behaviour,
} from '@/types';

// ── Providers ──

export const PROVIDERS: Record<string, Provider> = {
  airasia: { id: 'airasia', name: 'AirAsia', type: 'airline' },
  trip: { id: 'trip', name: 'Trip.com', type: 'agency' },
  agoda: { id: 'agoda', name: 'Agoda', type: 'agency' },
  expedia: { id: 'expedia', name: 'Expedia', type: 'agency' },
  booking: { id: 'booking', name: 'Booking.com', type: 'agency' },
  mh: { id: 'mh', name: 'Malaysia Airlines', type: 'airline' },
  ana: { id: 'ana', name: 'ANA', type: 'airline' },
  sq: { id: 'sq', name: 'Singapore Airlines', type: 'airline' },
};

// ── Flight offers (KUL → NRT/HND, 15 Oct, 3 travellers) ──

export const FLIGHT_OFFERS: FlightOffer[] = [
  {
    id: 'flight-1',
    airline: 'AirAsia',
    airlineCode: 'AK',
    provider: PROVIDERS.trip,
    departureTime: '08:15',
    arrivalTime: '15:40',
    duration: '7h 25m',
    stops: 0,
    baggage: '20kg checked',
    refundable: false,
    totalPrice: 1215,
    pricePerTraveller: 405,
    bestValue: true,
  },
  {
    id: 'flight-2',
    airline: 'AirAsia',
    airlineCode: 'AK',
    provider: PROVIDERS.airasia,
    departureTime: '08:15',
    arrivalTime: '15:40',
    duration: '7h 25m',
    stops: 0,
    baggage: '20kg checked',
    refundable: true,
    totalPrice: 1260,
    pricePerTraveller: 420,
  },
  {
    id: 'flight-3',
    airline: 'Malaysia Airlines',
    airlineCode: 'MH',
    provider: PROVIDERS.mh,
    departureTime: '09:30',
    arrivalTime: '17:05',
    duration: '7h 35m',
    stops: 0,
    baggage: '30kg checked',
    refundable: true,
    totalPrice: 1530,
    pricePerTraveller: 510,
  },
  {
    id: 'flight-4',
    airline: 'ANA',
    airlineCode: 'NH',
    provider: PROVIDERS.ana,
    departureTime: '06:00',
    arrivalTime: '13:50',
    duration: '7h 50m',
    stops: 0,
    baggage: '23kg checked',
    refundable: true,
    totalPrice: 1680,
    pricePerTraveller: 560,
    fastest: true,
  },
  {
    id: 'flight-5',
    airline: 'Singapore Airlines',
    airlineCode: 'SQ',
    provider: PROVIDERS.sq,
    departureTime: '07:20',
    arrivalTime: '15:30',
    duration: '8h 10m',
    stops: 1,
    baggage: '30kg checked',
    refundable: true,
    totalPrice: 1440,
    pricePerTraveller: 480,
  },
  {
    id: 'flight-6',
    airline: 'AirAsia',
    airlineCode: 'AK',
    provider: PROVIDERS.agoda,
    departureTime: '14:50',
    arrivalTime: '22:15',
    duration: '7h 25m',
    stops: 0,
    baggage: '20kg checked',
    refundable: false,
    totalPrice: 1170,
    pricePerTraveller: 390,
    cheapest: true,
  },
];

// ── Hotels (Tokyo, 15–19 Oct, 3 travellers) ──

const makeHotel = (
  id: string,
  name: string,
  rating: number,
  reviews: number,
  area: string,
  image: string,
  roomType: string,
  distance: string,
  travelTime: string,
  transport: string,
  offers: HotelOffer[],
  flags: { bestValue?: boolean; bestLocation?: boolean; lowestPrice?: boolean } = {},
): Hotel => {
  const prices = offers.map((o) => o.price);
  const min = Math.min(...prices);
  const best = offers.find((o) => o.price === min);
  return {
    id,
    name,
    rating,
    reviews,
    area,
    image,
    roomType,
    distanceFromCenter: distance,
    travelTimeToActivities: travelTime,
    nearbyTransport: transport,
    offers,
    bestPrice: min,
    bestPriceProvider: best?.provider.name,
    ...flags,
  };
};

export const HOTELS: Hotel[] = [
  makeHotel(
    'hotel-1',
    'Shibuya Excel Hotel Tokyu',
    4.5,
    2841,
    'Shibuya',
    'https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Standard Triple Room',
    '0.3 km from Shibuya',
    '5 min walk to Day 1 activities',
    'JR Shibuya · 2 min walk',
    [
      { provider: PROVIDERS.trip, price: 465, refundable: true },
      { provider: PROVIDERS.agoda, price: 480, refundable: false },
      { provider: PROVIDERS.booking, price: 495, refundable: false },
      { provider: PROVIDERS.expedia, price: 510, refundable: false },
    ],
    { bestValue: true, bestLocation: true },
  ),
  makeHotel(
    'hotel-2',
    'Asakusa View Hotel',
    4.2,
    1923,
    'Asakusa',
    'https://images.pexels.com/photos/97083/pexels-photo-97083.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Deluxe Twin Room',
    '1.5 km from Asakusa',
    '27 min by train to Day 1 activities',
    'Tsukuba Express · 4 min walk',
    [
      { provider: PROVIDERS.agoda, price: 420, refundable: false },
      { provider: PROVIDERS.trip, price: 435, refundable: true },
      { provider: PROVIDERS.booking, price: 450, refundable: false },
    ],
    { lowestPrice: true },
  ),
  makeHotel(
    'hotel-3',
    'The Peninsula Tokyo',
    4.8,
    3102,
    'Ginza',
    'https://images.pexels.com/photos/7507131/pexels-photo-7507131.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Deluxe Suite',
    '0.5 km from Ginza',
    '12 min by train to Day 1 activities',
    'JR Yurakucho · 3 min walk',
    [
      { provider: PROVIDERS.booking, price: 680, refundable: true },
      { provider: PROVIDERS.expedia, price: 695, refundable: true },
      { provider: PROVIDERS.agoda, price: 710, refundable: false },
    ],
  ),
];

// ── AI Recommended Combination ──

export const AI_RECOMMENDATION: AIRecommendation = {
  flightOffer: FLIGHT_OFFERS[0],
  hotel: HOTELS[0],
  hotelPrice: 465,
  transport: 'Narita Express',
  transportCost: 12,
  estimatedTotal: 1700,
  reason:
    'This combination keeps you within your RM 2,000 budget while placing you 5 minutes from your Day 1 activities in Shibuya. The morning flight maximises your time in Tokyo.',
};

// ── Weather forecast ──

export const WEATHER_FORECAST: WeatherForecast[] = [
  { day: 'Oct 15', condition: 'sunny', high: 22, low: 15, icon: 'sun' },
  { day: 'Oct 16', condition: 'rain', high: 19, low: 14, icon: 'rain', alert: 'Heavy rain 14:00–18:00' },
  { day: 'Oct 17', condition: 'cloudy', high: 21, low: 15, icon: 'cloud' },
  { day: 'Oct 18', condition: 'sunny', high: 23, low: 16, icon: 'sun' },
  { day: 'Oct 19', condition: 'cloudy', high: 20, low: 14, icon: 'cloud' },
];

// ── Default travellers (2 for demo) ──

export const DEFAULT_TRAVELLERS: Traveller[] = [
  {
    id: 'you',
    name: 'You',
    avatar: '🧑',
    interests: ['Food', 'Culture', 'Photography'],
    behaviours: ['Prefers relaxed schedules', 'Avoids crowded places', 'Prefers indoor activities'],
    budgetPreference: 'Mid-range',
  },
  {
    id: 'alice',
    name: 'Alice',
    avatar: '👩',
    interests: ['Shopping', 'Food'],
    behaviours: ['Comfortable with walking', 'Likes busy areas', 'Prefers flexible schedules'],
    budgetPreference: 'Mid-range',
  },
];

export const ALL_INTERESTS = [
  'Food',
  'Culture',
  'Shopping',
  'Adventure',
  'Photography',
  'Nature',
  'Nightlife',
  'Relaxed',
] as const;

export const ALL_BEHAVIOURS: Behaviour[] = [
  'Likes early mornings',
  'Prefers relaxed schedules',
  'Likes shopping',
  'Loves food hunting',
  'Enjoys museums and culture',
  'Avoids crowded places',
  'Prefers indoor activities',
  "Doesn't like long walking",
  'Likes photography',
  'Prefers nightlife',
  'Budget conscious',
  'Likes spontaneous activities',
  'Comfortable with walking',
  'Likes busy areas',
  'Prefers flexible schedules',
  'Early bird',
  'Night owl',
  'Low walking tolerance',
  'High walking tolerance',
  'Prefers packed schedule',
];

export const TRIP_BUDGET = 2000;

export const BUDGET_MIN = 500;
export const BUDGET_MAX = 10000;

// ── Budget items ──

export const BUDGET_ITEMS: BudgetItem[] = [
  { category: 'Flights', amount: 405, icon: 'plane' },
  { category: 'Hotel', amount: 465, icon: 'hotel' },
  { category: 'Transport', amount: 180, icon: 'transport' },
  { category: 'Food', amount: 400, icon: 'food' },
  { category: 'Activities', amount: 250, icon: 'activities' },
];

// ── Local Insights ──

export const LOCAL_INSIGHTS: LocalInsight[] = [
  { id: 'insight-1', title: 'Best visited after 5 PM', text: 'Shibuya Sky offers the best views at sunset. Arrive 30 min early for the observation deck.', category: 'Attraction' },
  { id: 'insight-2', title: 'Avoid 12–2 PM for shorter queues', text: 'Senso-ji Temple is busiest at midday. Visit before 10 AM or after 4 PM for a calmer experience.', category: 'Attraction' },
  { id: 'insight-3', title: 'MRT is recommended during peak hours', text: 'Trains run every 3–5 minutes. Avoid taxis between 8–9 AM and 5–7 PM — traffic is heavy.', category: 'Transport' },
  { id: 'insight-4', title: 'Cash is king at food stalls', text: 'Many vendors at Tsukiji and Ameyoko are cash-only. Withdraw yen before visiting.', category: 'Food' },
];

// ── Explore items ──

export const EXPLORE_ITEMS: ExploreItem[] = [
  { id: 'exp-1', name: 'Shibuya Sky', emoji: '🌆', category: 'Attraction', area: 'Shibuya', rating: 4.7, cost: 'RM 35', insight: 'Best visited after 5 PM for sunset views.' },
  { id: 'exp-2', name: 'Senso-ji Temple', emoji: '⛩️', category: 'Attraction', area: 'Asakusa', rating: 4.6, cost: 'Free', insight: 'Avoid 12–2 PM for shorter queues.' },
  { id: 'exp-3', name: 'Tsukiji Outer Market', emoji: '🍣', category: 'Food', area: 'Tsukiji', rating: 4.5, cost: 'RM 50', insight: 'Cash is king at food stalls.' },
  { id: 'exp-4', name: 'Meiji Shrine', emoji: '🌳', category: 'Attraction', area: 'Shibuya', rating: 4.6, cost: 'Free', insight: 'Best in the morning for a peaceful walk.' },
  { id: 'exp-5', name: 'Shibuya PARCO', emoji: '🛍️', category: 'Activity', area: 'Shibuya', rating: 4.4, cost: 'Free entry', insight: 'Great for fashion and pop culture fans.' },
  { id: 'exp-6', name: 'Tokyo National Museum', emoji: '🏛️', category: 'Attraction', area: 'Ueno', rating: 4.5, cost: 'RM 20', insight: 'Plan 2–3 hours. Closed on Mondays.' },
];

// Re-export itinerary + disruption data for convenience
export {
  INITIAL_ITINERARY,
  RAIN_SCENARIO,
  BUS_SCENARIO,
  TRAIN_DELAY_SCENARIO,
  ATTRACTION_CLOSED_SCENARIO,
  FLIGHT_DELAY_SCENARIO,
  ALL_DISRUPTION_SCENARIOS,
  REPLACEMENTS,
} from './itineraryData';
