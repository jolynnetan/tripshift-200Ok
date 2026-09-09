import type {
  DisruptionScenario,
  ItineraryDay,
  ItineraryActivity,
  PlanAlternative,
  ActivityCharacteristics,
} from '@/types';

// ── Activity characteristics ──

const indoorCulture: ActivityCharacteristics = {
  indoor: true, lowWalking: true, relaxed: true, lowCost: true, lowCrowd: true,
  photography: true, nightlife: false, earlyMorning: false, flexibleSchedule: true,
};

const outdoorAttraction: ActivityCharacteristics = {
  indoor: false, lowWalking: false, relaxed: false, lowCost: false, lowCrowd: false,
  photography: true, nightlife: false, earlyMorning: false, flexibleSchedule: false,
};

const foodActivity: ActivityCharacteristics = {
  indoor: true, lowWalking: true, relaxed: true, lowCost: false, lowCrowd: false,
  photography: false, nightlife: false, earlyMorning: true, flexibleSchedule: true,
};

const shoppingActivity: ActivityCharacteristics = {
  indoor: true, lowWalking: false, relaxed: false, lowCost: true, lowCrowd: false,
  photography: false, nightlife: false, earlyMorning: false, flexibleSchedule: true,
};

const cultureOutdoor: ActivityCharacteristics = {
  indoor: false, lowWalking: true, relaxed: true, lowCost: true, lowCrowd: false,
  photography: true, nightlife: false, earlyMorning: true, flexibleSchedule: false,
};

const nightlifeActivity: ActivityCharacteristics = {
  indoor: true, lowWalking: true, relaxed: false, lowCost: false, lowCrowd: false,
  photography: false, nightlife: true, earlyMorning: false, flexibleSchedule: true,
};

const travelActivity: ActivityCharacteristics = {
  indoor: true, lowWalking: true, relaxed: true, lowCost: true, lowCrowd: true,
  photography: false, nightlife: false, earlyMorning: false, flexibleSchedule: false,
};

// ── Transport-aware itinerary activities ──

const shibuyaSky: ItineraryActivity = {
  id: 'act-shibuya-sky',
  time: '15:00',
  emoji: '🌆',
  title: 'Shibuya Sky',
  location: 'Shibuya',
  duration: '2 hours',
  cost: 35,
  category: 'Attraction',
  isOutdoor: true,
  isRequested: true,
  characteristics: outdoorAttraction,
  transport: { mode: 'train', from: 'Shibuya', to: 'Shibuya', duration: '0 min', cost: 0 },
  optimizationNote: 'Scheduled in the afternoon for optimal sunset views.',
};

const tsukijiFood: ItineraryActivity = {
  id: 'act-tsukiji-food',
  time: '10:00',
  emoji: '🍣',
  title: 'Tsukiji Food Tour',
  location: 'Tsukiji',
  duration: '2 hours',
  cost: 50,
  category: 'Food',
  isOutdoor: false,
  isRequested: true,
  characteristics: foodActivity,
  transport: { mode: 'train', from: 'Shibuya', to: 'Tsukijijo', duration: '18 min', cost: 8 },
  optimizationNote: 'Morning slot — market is freshest and least crowded before noon.',
};

const sensoji: ItineraryActivity = {
  id: 'act-sensoji',
  time: '13:00',
  emoji: '⛩️',
  title: 'Senso-ji Temple',
  location: 'Asakusa',
  duration: '1.5 hours',
  cost: 0,
  category: 'Culture',
  isOutdoor: true,
  isRequested: true,
  characteristics: cultureOutdoor,
  transport: { mode: 'train', from: 'Tsukijijo', to: 'Asakusa', duration: '22 min', cost: 10 },
  optimizationNote: 'Grouped with Tsukiji — both are in eastern Tokyo, reducing backtracking.',
};

const shibuyaDinner: ItineraryActivity = {
  id: 'act-shibuya-dinner',
  time: '19:00',
  emoji: '🍜',
  title: 'Izakaya Dinner',
  location: 'Shibuya',
  duration: '2 hours',
  cost: 40,
  category: 'Food',
  isOutdoor: false,
  characteristics: foodActivity,
  transport: { mode: 'train', from: 'Asakusa', to: 'Shibuya', duration: '32 min', cost: 8 },
};

const busToShibuya: ItineraryActivity = {
  id: 'act-bus-shibuya',
  time: '14:20',
  emoji: '🚌',
  title: 'Bus to Shibuya',
  location: 'Asakusa → Shibuya',
  duration: '30 min',
  cost: 2,
  category: 'Travel',
  isOutdoor: false,
  characteristics: travelActivity,
  transport: { mode: 'bus', from: 'Asakusa', to: 'Shibuya', duration: '30 min', cost: 2 },
};

const _itineraryStart = new Date();
_itineraryStart.setDate(_itineraryStart.getDate() - 1);

function dayLabel(dayNum: number): string {
  const d = new Date(_itineraryStart);
  d.setDate(_itineraryStart.getDate() + (dayNum - 1));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Day ${dayNum} · ${d.getDate()} ${months[d.getMonth()]}`;
}

export const INITIAL_ITINERARY: ItineraryDay[] = [
  {
    day: 1,
    label: dayLabel(1),
    activities: [
      { id: 'act-arrive', time: '14:00', emoji: '✈️', title: 'Arrive in Tokyo', location: 'Narita Airport', duration: '—', cost: 0, category: 'Travel', characteristics: travelActivity, transport: { mode: 'train', from: 'Narita', to: 'Shibuya', duration: '75 min', cost: 12 } },
      { id: 'act-checkin', time: '16:00', emoji: '🏨', title: 'Hotel Check-in · Shibuya', location: 'Shibuya Excel', duration: '30 min', cost: 0, category: 'Travel', characteristics: travelActivity },
      { id: 'act-welcome', time: '19:30', emoji: '🍽️', title: 'Welcome Dinner', location: 'Shibuya', duration: '2 hours', cost: 35, category: 'Food', characteristics: foodActivity, transport: { mode: 'walking', from: 'Hotel', to: 'Restaurant', duration: '5 min', cost: 0 } },
    ],
  },
  {
    day: 2,
    label: dayLabel(2),
    activities: [tsukijiFood, sensoji, shibuyaSky, shibuyaDinner],
    groupBlocks: [{
      id: 'group-shibuya-exploration',
      title: 'Eastern Tokyo Exploration',
      emoji: '🗺️',
      startTime: '10:00',
      endTime: '15:00',
      location: 'Tsukiji · Asakusa · Shibuya',
      childActivityIds: ['act-tsukiji-food', 'act-sensoji'],
    }],
  },
  {
    day: 3,
    label: dayLabel(3),
    activities: [
      { id: 'act-meiji', time: '09:30', emoji: '🌳', title: 'Meiji Shrine', location: 'Shibuya', duration: '1.5 hours', cost: 0, category: 'Culture', isOutdoor: true, characteristics: cultureOutdoor, transport: { mode: 'walking', from: 'Hotel', to: 'Meiji Shrine', duration: '12 min', cost: 0 }, optimizationNote: 'Early morning visit for a peaceful atmosphere.' },
      { id: 'act-parco', time: '12:00', emoji: '🛍️', title: 'Shibuya PARCO', location: 'Shibuya', duration: '2 hours', cost: 0, category: 'Shopping', isOutdoor: false, isRequested: true, characteristics: shoppingActivity, transport: { mode: 'walking', from: 'Meiji Shrine', to: 'PARCO', duration: '8 min', cost: 0 }, optimizationNote: 'Walking distance from Meiji Shrine — no transport needed.' },
      { id: 'act-tower', time: '15:30', emoji: '🗼', title: 'Tokyo Tower', location: 'Minato', duration: '2 hours', cost: 25, category: 'Attraction', isOutdoor: false, characteristics: indoorCulture, transport: { mode: 'train', from: 'Shibuya', to: 'Akabanebashi', duration: '15 min', cost: 6 } },
      { id: 'act-rooftop', time: '19:00', emoji: '🍸', title: 'Rooftop Bar · Roppongi', location: 'Roppongi', duration: '2 hours', cost: 30, category: 'Food', characteristics: nightlifeActivity, transport: { mode: 'train', from: 'Akabanebashi', to: 'Roppongi', duration: '5 min', cost: 4 } },
    ],
  },
  {
    day: 4,
    label: dayLabel(4),
    activities: [
      { id: 'act-ueno', time: '10:00', emoji: '🏛️', title: 'Tokyo National Museum', location: 'Ueno', duration: '3 hours', cost: 20, category: 'Culture', isOutdoor: false, isRequested: true, characteristics: indoorCulture, transport: { mode: 'train', from: 'Shibuya', to: 'Ueno', duration: '28 min', cost: 10 }, optimizationNote: 'Grouped with Ameyoko Market — both in Ueno, zero backtracking.' },
      { id: 'act-ameyoko', time: '14:00', emoji: '🛒', title: 'Ameyoko Market', location: 'Ueno', duration: '2 hours', cost: 0, category: 'Shopping', isOutdoor: true, characteristics: shoppingActivity, transport: { mode: 'walking', from: 'Museum', to: 'Ameyoko', duration: '3 min', cost: 0 }, optimizationNote: '3-min walk from the museum.' },
      { id: 'act-onsen', time: '17:00', emoji: '♨️', title: 'Ooedo-Onsen', location: 'Odaiba', duration: '2 hours', cost: 30, category: 'Activity', isOutdoor: false, characteristics: indoorCulture, transport: { mode: 'train', from: 'Ueno', to: 'Telecom Center', duration: '35 min', cost: 12 } },
      { id: 'act-farewell', time: '20:00', emoji: '🍢', title: 'Farewell Izakaya Night', location: 'Shibuya', duration: '2 hours', cost: 45, category: 'Food', characteristics: foodActivity, transport: { mode: 'train', from: 'Odaiba', to: 'Shibuya', duration: '25 min', cost: 8 } },
    ],
  },
  {
    day: 5,
    label: dayLabel(5),
    activities: [
      { id: 'act-cafe', time: '09:00', emoji: '☕', title: 'Café Hop · Omotesando', location: 'Omotesando', duration: '2 hours', cost: 20, category: 'Food', characteristics: foodActivity, transport: { mode: 'walking', from: 'Hotel', to: 'Omotesando', duration: '10 min', cost: 0 } },
      { id: 'act-souvenir', time: '11:30', emoji: '🎁', title: 'Souvenir Shopping · Don Quijote', location: 'Shibuya', duration: '1 hour', cost: 0, category: 'Shopping', characteristics: shoppingActivity, transport: { mode: 'walking', from: 'Omotesando', to: 'Don Quijote', duration: '8 min', cost: 0 } },
      { id: 'act-depart', time: '14:00', emoji: '✈️', title: 'Depart Tokyo', location: 'Narita Airport', duration: '—', cost: 0, category: 'Travel', characteristics: travelActivity, transport: { mode: 'train', from: 'Shibuya', to: 'Narita', duration: '75 min', cost: 12 } },
    ],
  },
];

// ── Plan B alternatives for Heavy Rain ──

const tokyoMuseum: ItineraryActivity = {
  id: 'act-tokyo-museum',
  time: '15:00',
  emoji: '🏛️',
  title: 'Tokyo National Museum',
  planTag: 'B',
  location: 'Ueno',
  duration: '2 hours',
  cost: 20,
  category: 'Culture',
  isOutdoor: false,
  characteristics: indoorCulture,
  transport: { mode: 'train', from: 'Asakusa', to: 'Ueno', duration: '18 min', cost: 8 },
};

const parcoMall: ItineraryActivity = {
  id: 'act-parco-mall',
  time: '15:00',
  emoji: '🛍️',
  title: 'Shibuya PARCO',
  planTag: 'C',
  location: 'Shibuya',
  duration: '2 hours',
  cost: 0,
  category: 'Shopping',
  isOutdoor: false,
  characteristics: shoppingActivity,
  transport: { mode: 'train', from: 'Asakusa', to: 'Shibuya', duration: '32 min', cost: 8 },
};

const cafeExperience: ItineraryActivity = {
  id: 'act-cafe-exp',
  time: '15:00',
  emoji: '☕',
  title: 'Specialty Café Experience',
  planTag: 'C',
  location: 'Asakusa',
  duration: '1.5 hours',
  cost: 25,
  category: 'Food',
  isOutdoor: false,
  characteristics: foodActivity,
  transport: { mode: 'walking', from: 'Senso-ji', to: 'Café', duration: '5 min', cost: 0 },
};

const rainAlternatives: PlanAlternative[] = [
  {
    id: 'plan-b-museum',
    label: 'PLAN B',
    emoji: '🏛️',
    title: 'Tokyo National Museum',
    risk: 'LOW',
    budgetImpact: 20,
    recommended: true,
    detail: 'Indoor · Culture · 2 hours',
    category: 'Culture',
    isOutdoor: false,
    duration: '2 hours',
    characteristics: indoorCulture,
    transport: { mode: 'train', from: 'Asakusa', to: 'Ueno', duration: '18 min', cost: 8 },
  },
  {
    id: 'plan-c-parco',
    label: 'PLAN C',
    emoji: '🛍️',
    title: 'Shibuya PARCO',
    risk: 'LOW',
    budgetImpact: 0,
    detail: 'Indoor · Shopping · 2 hours',
    category: 'Shopping',
    isOutdoor: false,
    duration: '2 hours',
    characteristics: shoppingActivity,
    transport: { mode: 'train', from: 'Asakusa', to: 'Shibuya', duration: '32 min', cost: 8 },
  },
  {
    id: 'plan-d-cafe',
    label: 'PLAN D',
    emoji: '☕',
    title: 'Specialty Café Experience',
    risk: 'LOW',
    budgetImpact: 25,
    detail: 'Indoor · Food · 1.5 hours',
    category: 'Food',
    isOutdoor: false,
    duration: '1.5 hours',
    characteristics: foodActivity,
    transport: { mode: 'walking', from: 'Senso-ji', to: 'Café', duration: '5 min', cost: 0 },
  },
];

export const RAIN_SCENARIO: DisruptionScenario = {
  id: 'rain',
  type: 'weather',
  emoji: '🌧️',
  label: 'Heavy rain',
  title: 'Weather disruption',
  subtitle: 'Heavy rain expected 14:00–18:00',
  description: 'Your Plan A may no longer be suitable. The outdoor activity at 15:00 is at high risk.',
  originalActivity: shibuyaSky,
  alternatives: rainAlternatives,
  explanation:
    'Tokyo National Museum avoids the rain, matches your group\'s interest in culture and photography, adds only RM 20 to your budget, and keeps your evening schedule unchanged.',
  ctaLabel: 'Apply Plan B',
  appliedNote:
    'Your itinerary has been adapted to the weather without disrupting the rest of your trip.',
};

// ── Missed Bus scenario ──

const mrtAlternative: PlanAlternative = {
  id: 'plan-b-mrt',
  label: 'PLAN B',
  emoji: '🚃',
  title: 'Take the MRT',
  risk: 'LOW',
  budgetImpact: 2,
  recommended: true,
  detail: '18 min · Arrives 14:48',
  category: 'Travel',
  isOutdoor: false,
  duration: '18 min',
  arrivalTime: '14:48',
  scheduleCompatibility: 92,
  characteristics: travelActivity,
  transport: { mode: 'train', from: 'Asakusa', to: 'Shibuya', duration: '18 min', cost: 4 },
};

const nextBusAlternative: PlanAlternative = {
  id: 'plan-c-nextbus',
  label: 'PLAN C',
  emoji: '🚌',
  title: 'Next Bus',
  risk: 'MEDIUM',
  budgetImpact: 0,
  detail: '32 min · Arrives 15:02',
  category: 'Travel',
  isOutdoor: false,
  duration: '32 min',
  arrivalTime: '15:02',
  scheduleCompatibility: 55,
  characteristics: travelActivity,
  transport: { mode: 'bus', from: 'Asakusa', to: 'Shibuya', duration: '32 min', cost: 2 },
};

const walkTrainAlternative: PlanAlternative = {
  id: 'plan-d-walktrain',
  label: 'PLAN D',
  emoji: '🚶',
  title: 'Walk + Train',
  risk: 'LOW',
  budgetImpact: 1,
  detail: '25 min · Arrives 14:55',
  category: 'Travel',
  isOutdoor: false,
  duration: '25 min',
  arrivalTime: '14:55',
  scheduleCompatibility: 78,
  characteristics: travelActivity,
  transport: { mode: 'walking', from: 'Asakusa', to: 'Station', duration: '25 min', cost: 3 },
};

const busAlternatives: PlanAlternative[] = [mrtAlternative, nextBusAlternative, walkTrainAlternative];

export const BUS_SCENARIO: DisruptionScenario = {
  id: 'missed-bus',
  type: 'transport',
  emoji: '🚌',
  label: 'Missed Bus',
  title: 'Missed the 14:20 bus',
  subtitle: 'Bus to Shibuya departed without you',
  description: 'You missed the 14:20 bus from Asakusa to Shibuya. Your next activity starts at 15:00.',
  originalActivity: busToShibuya,
  alternatives: busAlternatives,
  explanation:
    'The MRT is recommended because it gets you to Shibuya 14 minutes earlier than the next bus, arriving at 14:48 — well before your 15:00 activity. It costs only RM 2 more and keeps your schedule on track.',
  ctaLabel: 'Apply Alternative',
  appliedNote:
    'Your route has been updated to the MRT. You\'ll arrive with time to spare before your next activity.',
};

// ── Train Delay scenario ──

const trainDelayAlternative1: PlanAlternative = {
  id: 'plan-b-express',
  label: 'PLAN B',
  emoji: '🚄',
  title: 'Limited Express',
  risk: 'LOW',
  budgetImpact: 5,
  recommended: true,
  detail: '22 min · Arrives 14:42',
  category: 'Travel',
  isOutdoor: false,
  duration: '22 min',
  arrivalTime: '14:42',
  scheduleCompatibility: 90,
  characteristics: travelActivity,
  transport: { mode: 'train', from: 'Tsukijijo', to: 'Asakusa', duration: '22 min', cost: 15 },
};

const trainDelayAlternative2: PlanAlternative = {
  id: 'plan-c-taxi',
  label: 'PLAN C',
  emoji: '🚕',
  title: 'Taxi',
  risk: 'LOW',
  budgetImpact: 15,
  detail: '15 min · Arrives 14:35',
  category: 'Travel',
  isOutdoor: false,
  duration: '15 min',
  arrivalTime: '14:35',
  scheduleCompatibility: 95,
  characteristics: travelActivity,
  transport: { mode: 'taxi', from: 'Tsukijijo', to: 'Asakusa', duration: '15 min', cost: 20 },
};

const trainDelayAlternatives: PlanAlternative[] = [trainDelayAlternative1, trainDelayAlternative2];

const trainToAsakusa: ItineraryActivity = {
  id: 'act-train-asakusa',
  time: '14:20',
  emoji: '🚃',
  title: 'Train to Asakusa',
  location: 'Tsukiji → Asakusa',
  duration: '22 min',
  cost: 10,
  category: 'Travel',
  isOutdoor: false,
  characteristics: travelActivity,
  transport: { mode: 'train', from: 'Tsukijijo', to: 'Asakusa', duration: '22 min', cost: 10 },
};

export const TRAIN_DELAY_SCENARIO: DisruptionScenario = {
  id: 'train-delay',
  type: 'delay',
  emoji: '⏰',
  label: 'Train Delay',
  title: 'Train delayed 20 minutes',
  subtitle: 'Yamanote Line experiencing delays',
  description: 'Your train from Tsukiji to Asakusa is delayed by 20 minutes. The Senso-ji visit at 13:00 may be affected.',
  originalActivity: trainToAsakusa,
  alternatives: trainDelayAlternatives,
  explanation:
    'The Limited Express gets you to Asakusa 18 minutes earlier than waiting for the delayed train. At only RM 5 extra, it preserves your afternoon schedule and avoids cutting your Senso-ji visit short.',
  ctaLabel: 'Apply Alternative',
  appliedNote:
    'Your route has been updated to the Limited Express. Your Senso-ji visit remains on schedule.',
};

// ── Attraction Closed scenario ──

const replacementMuseum: PlanAlternative = {
  id: 'plan-b-museum2',
  label: 'PLAN B',
  emoji: '🏛️',
  title: 'Tokyo National Museum',
  risk: 'LOW',
  budgetImpact: 20,
  recommended: true,
  detail: 'Indoor · Culture · 3 hours',
  category: 'Culture',
  isOutdoor: false,
  duration: '3 hours',
  characteristics: indoorCulture,
  transport: { mode: 'train', from: 'Shibuya', to: 'Ueno', duration: '28 min', cost: 10 },
};

const replacementSkytree: PlanAlternative = {
  id: 'plan-c-skytree',
  label: 'PLAN C',
  emoji: '🗼',
  title: 'Tokyo Skytree',
  risk: 'LOW',
  budgetImpact: 30,
  detail: 'Indoor · Attraction · 2 hours',
  category: 'Attraction',
  isOutdoor: false,
  duration: '2 hours',
  characteristics: indoorCulture,
  transport: { mode: 'train', from: 'Shibuya', to: 'Oshiage', duration: '30 min', cost: 12 },
};

const replacementCafe: PlanAlternative = {
  id: 'plan-d-cafe2',
  label: 'PLAN D',
  emoji: '☕',
  title: 'Cat Café MoCHA',
  risk: 'LOW',
  budgetImpact: 15,
  detail: 'Indoor · Activity · 1.5 hours',
  category: 'Activity',
  isOutdoor: false,
  duration: '1.5 hours',
  characteristics: foodActivity,
  transport: { mode: 'walking', from: 'Shibuya', to: 'MoCHA', duration: '5 min', cost: 0 },
};

const attractionClosedAlternatives: PlanAlternative[] = [replacementMuseum, replacementSkytree, replacementCafe];

export const ATTRACTION_CLOSED_SCENARIO: DisruptionScenario = {
  id: 'attraction-closed',
  type: 'attraction',
  emoji: '🔒',
  label: 'Attraction Closed',
  title: 'Shibuya Sky is closed',
  subtitle: 'Unexpected closure — maintenance issue',
  description: 'Shibuya Sky has temporarily closed for maintenance. Your 15:00 visit needs a replacement.',
  originalActivity: shibuyaSky,
  alternatives: attractionClosedAlternatives,
  explanation:
    'Tokyo National Museum is the best replacement — it matches your group\'s interest in culture and photography, is nearby, and fits your budget. The Skytree is a good alternative if you prefer views.',
  ctaLabel: 'Apply Plan B',
  appliedNote:
    'Shibuya Sky has been replaced with Tokyo National Museum. Your schedule and budget remain balanced.',
};

// ── Flight Delay scenario ──

const laterFlightActivity: ItineraryActivity = {
  id: 'act-later-flight',
  time: '14:50',
  emoji: '✈️',
  title: 'Rescheduled Flight',
  location: 'Narita Airport',
  duration: '—',
  cost: 0,
  category: 'Travel',
  characteristics: travelActivity,
};

const flightDelayAlt1: PlanAlternative = {
  id: 'plan-b-laterflight',
  label: 'PLAN B',
  emoji: '✈️',
  title: 'Afternoon Flight (14:50)',
  risk: 'LOW',
  budgetImpact: 0,
  recommended: true,
  detail: 'Same day · Arrives 22:15',
  category: 'Travel',
  isOutdoor: false,
  duration: '7h 25m',
  arrivalTime: '22:15',
  scheduleCompatibility: 70,
  characteristics: travelActivity,
  transport: { mode: 'train', from: 'Narita', to: 'Shibuya', duration: '75 min', cost: 12 },
};

const flightDelayAlt2: PlanAlternative = {
  id: 'plan-c-nextday',
  label: 'PLAN C',
  emoji: '🌅',
  title: 'Next Day Flight (08:15)',
  risk: 'MEDIUM',
  budgetImpact: -50,
  detail: 'Next morning · Arrives 15:40',
  category: 'Travel',
  isOutdoor: false,
  duration: '7h 25m',
  arrivalTime: '15:40',
  scheduleCompatibility: 40,
  characteristics: travelActivity,
  transport: { mode: 'train', from: 'Narita', to: 'Shibuya', duration: '75 min', cost: 12 },
};

const flightDelayAlternatives: PlanAlternative[] = [flightDelayAlt1, flightDelayAlt2];

const originalFlight: ItineraryActivity = {
  id: 'act-arrive',
  time: '08:15',
  emoji: '✈️',
  title: 'Morning Flight',
  location: 'Narita Airport',
  duration: '7h 25m',
  cost: 0,
  category: 'Travel',
  characteristics: travelActivity,
};

export const FLIGHT_DELAY_SCENARIO: DisruptionScenario = {
  id: 'flight-delay',
  type: 'flight',
  emoji: '✈️',
  label: 'Flight Delay',
  title: 'Flight delayed by 6 hours',
  subtitle: 'Departure moved from 08:15 to 14:50',
  description: 'Your morning flight has been delayed to the afternoon. Day 1 activities will be affected.',
  originalActivity: originalFlight,
  alternatives: flightDelayAlternatives,
  explanation:
    'The afternoon flight arrives at 22:15, so you\'ll miss Day 1 evening activities but keep Day 2 onwards intact. The next-day option saves RM 50 but loses a full day. We recommend the same-day flight.',
  ctaLabel: 'Apply Alternative',
  appliedNote:
    'Your flight has been rescheduled to 14:50. Day 1 activities have been adjusted — you\'ll arrive in the evening.',
};

// ── All scenarios ──

export const ALL_DISRUPTION_SCENARIOS: DisruptionScenario[] = [
  RAIN_SCENARIO,
  BUS_SCENARIO,
  TRAIN_DELAY_SCENARIO,
  ATTRACTION_CLOSED_SCENARIO,
  FLIGHT_DELAY_SCENARIO,
];

export const REPLACEMENTS: Record<string, { replaceId: string; activity: ItineraryActivity }> = {
  rain: { replaceId: 'act-shibuya-sky', activity: tokyoMuseum },
  'missed-bus': { replaceId: 'act-bus-shibuya', activity: { ...tokyoMuseum, id: 'act-mrt-shibuya', title: 'MRT to Shibuya', emoji: '🚃', time: '14:20', duration: '18 min', cost: 4, category: 'Travel', transport: { mode: 'train', from: 'Asakusa', to: 'Shibuya', duration: '18 min', cost: 4 } } },
  'train-delay': { replaceId: 'act-train-asakusa', activity: { ...trainDelayAlternative1, id: 'act-express-asakusa', title: 'Limited Express to Asakusa', emoji: '🚄', time: '14:20', duration: '22 min', cost: 15, category: 'Travel', transport: { mode: 'train', from: 'Tsukijijo', to: 'Asakusa', duration: '22 min', cost: 15 } } as ItineraryActivity },
  'attraction-closed': { replaceId: 'act-shibuya-sky', activity: tokyoMuseum },
  'flight-delay': { replaceId: 'act-arrive', activity: { ...laterFlightActivity, id: 'act-arrive', time: '14:50', title: 'Afternoon Flight · Arrive 22:15', transport: { mode: 'train', from: 'Narita', to: 'Shibuya', duration: '75 min', cost: 12 } } },
};

export { tokyoMuseum, parcoMall, cafeExperience };
