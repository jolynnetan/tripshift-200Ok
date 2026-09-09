import type { Trip, TravelGroup, Destination, Traveller } from '@/types';
import { INITIAL_ITINERARY } from '@/data/itineraryData';
import { FLIGHT_OFFERS, HOTELS, WEATHER_FORECAST } from '@/data/comparisonData';
import { generateItinerary, generateWeather, computeEstimatedSpend } from '@/lib/generateItinerary';

const DEFAULT_TRAVELLERS: Traveller[] = [
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

const FAMILY_TRAVELLERS: Traveller[] = [
  {
    id: 'dad',
    name: 'Dad',
    avatar: '🧔',
    interests: ['Culture', 'Food'],
    behaviours: ['Prefers relaxed schedules', "Doesn't like long walking", 'Budget conscious'],
    budgetPreference: 'Budget',
  },
  {
    id: 'mom',
    name: 'Mom',
    avatar: '👩',
    interests: ['Shopping', 'Culture', 'Nature'],
    behaviours: ['Likes early mornings', 'Prefers indoor activities', 'Likes photography'],
    budgetPreference: 'Mid-range',
  },
  {
    id: 'kid',
    name: 'Emma',
    avatar: '👧',
    interests: ['Adventure', 'Nature'],
    behaviours: ['Likes spontaneous activities', 'Comfortable with walking'],
    budgetPreference: 'Budget',
  },
];

export const DEFAULT_GROUPS: TravelGroup[] = [
  {
    id: 'group-friends',
    name: 'Friends A',
    travellers: DEFAULT_TRAVELLERS,
  },
  {
    id: 'group-family',
    name: 'Family',
    travellers: FAMILY_TRAVELLERS,
  },
];

function formatTripDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
function formatTripMonth(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function alignWeatherDates(forecast: typeof WEATHER_FORECAST, startDate: Date) {
  return forecast.map((weather, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return { ...weather, day: formatTripDate(date) };
  });
}

const _today = new Date();
const _tripStart = new Date(_today);
_tripStart.setDate(_today.getDate() - 1);
const _tripEnd = new Date(_tripStart);
_tripEnd.setDate(_tripStart.getDate() + 4);

const _tokyoStart = formatTripDate(_tripStart);
const _tokyoEnd = formatTripDate(_tripEnd);
const _tokyoStartMonth = formatTripMonth(_tripStart);
const _tokyoEndMonth = formatTripMonth(_tripEnd);

export const DEFAULT_TRIPS: Trip[] = [
  {
    id: 'trip-tokyo',
    destination: 'Tokyo',
    country: 'Japan',
    emoji: '🗼',
    coverImage: 'https://images.pexels.com/photos/15275312/pexels-photo-15275312.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startDate: _tokyoStart,
    endDate: _tokyoEnd,
    startMonth: _tokyoStartMonth,
    endMonth: _tokyoEndMonth,
    totalDays: 5,
    currentDay: 2,
    status: 'current',
    travelType: 'group',
    groupId: 'group-friends',
    budget: 2000,
    estimatedSpend: 1700,
    itinerary: INITIAL_ITINERARY,
    originalItinerary: INITIAL_ITINERARY,
    selectedFlight: FLIGHT_OFFERS[0],
    selectedHotel: HOTELS[0],
    appliedPlans: [],
    requestedActivities: ['Shibuya Sky', 'Tsukiji Market', 'Tokyo National Museum', 'Harajuku shopping'],
    weather: alignWeatherDates(WEATHER_FORECAST.slice(0, 5), _tripStart),
  },
  {
    id: 'trip-seoul',
    destination: 'Seoul',
    country: 'South Korea',
    emoji: '🏙️',
    coverImage: 'https://images.pexels.com/photos/18495176/pexels-photo-18495176.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startDate: '20 Nov',
    endDate: '24 Nov',
    startMonth: 'Nov 20',
    endMonth: 'Nov 24',
    totalDays: 5,
    currentDay: 0,
    status: 'upcoming',
    travelType: 'group',
    groupId: 'group-friends',
    budget: 2400,
    estimatedSpend: 2100,
    itinerary: generateItinerary('Seoul', 5, ['Gyeongbokgung Palace', 'Myeongdong Shopping', 'N Seoul Tower', 'Bukchon Hanok Village']),
    originalItinerary: generateItinerary('Seoul', 5, ['Gyeongbokgung Palace', 'Myeongdong Shopping', 'N Seoul Tower', 'Bukchon Hanok Village']),
    selectedFlight: null,
    selectedHotel: null,
    appliedPlans: [],
    requestedActivities: ['Gyeongbokgung Palace', 'Myeongdong Shopping', 'N Seoul Tower', 'Bukchon Hanok Village'],
    weather: generateWeather(5),
  },
  {
    id: 'trip-bali',
    destination: 'Bali',
    country: 'Indonesia',
    emoji: '🌴',
    coverImage: 'https://images.pexels.com/photos/35428411/pexels-photo-35428411.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startDate: '10 Aug',
    endDate: '14 Aug',
    startMonth: 'Aug 10',
    endMonth: 'Aug 14',
    totalDays: 5,
    currentDay: 0,
    status: 'past',
    travelType: 'group',
    groupId: 'group-family',
    budget: 1800,
    estimatedSpend: 1650,
    itinerary: generateItinerary('Bali', 5, ['Uluwatu Temple', 'Tegallalang Rice Terrace', 'Ubud Monkey Forest', 'Seminyak Beach']),
    originalItinerary: generateItinerary('Bali', 5, ['Uluwatu Temple', 'Tegallalang Rice Terrace', 'Ubud Monkey Forest', 'Seminyak Beach']),
    selectedFlight: null,
    selectedHotel: null,
    appliedPlans: [],
    requestedActivities: ['Uluwatu Temple', 'Tegallalang Rice Terrace', 'Ubud Monkey Forest', 'Seminyak Beach'],
    weather: generateWeather(5),
  },
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'dest-tokyo',
    name: 'Tokyo',
    country: 'Japan',
    emoji: '🗼',
    image: 'https://images.pexels.com/photos/15275312/pexels-photo-15275312.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Neon-lit streets, world-class food, ancient temples, and cutting-edge culture collide in Japan\'s electric capital.',
    bestTime: 'Mar–May, Sep–Nov',
    duration: '4 Days',
    estimatedFrom: 1850,
    travelStyle: 'Food + Culture + Shopping',
    activities: ['Shibuya Sky', 'Tsukiji Market', 'Senso-ji Temple', 'Meiji Shrine', 'Harajuku Shopping'],
    interests: ['Food', 'Culture', 'Shopping'],
    flightFrom: 900,
    hotelFrom: 500,
    activitiesFrom: 200,
    transportFoodFrom: 250,
  },
  {
    id: 'dest-seoul',
    name: 'Seoul',
    country: 'South Korea',
    emoji: '🏙️',
    image: 'https://images.pexels.com/photos/18495176/pexels-photo-18495176.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'K-pop, palaces, street food, and mountains. Seoul blends ancient dynasties with modern pop culture.',
    bestTime: 'Apr–Jun, Sep–Nov',
    duration: '5 Days',
    estimatedFrom: 2100,
    travelStyle: 'Culture + Food + Shopping',
    activities: ['Gyeongbokgung Palace', 'Myeongdong Shopping', 'N Seoul Tower', 'Bukchon Hanok Village'],
    interests: ['Culture', 'Food', 'Shopping'],
    flightFrom: 1000,
    hotelFrom: 600,
    activitiesFrom: 200,
    transportFoodFrom: 300,
  },
  {
    id: 'dest-bali',
    name: 'Bali',
    country: 'Indonesia',
    emoji: '🌴',
    image: 'https://images.pexels.com/photos/35428411/pexels-photo-35428411.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Rice terraces, surf beaches, temples, and wellness retreats. The island of the gods awaits.',
    bestTime: 'Apr–Oct',
    duration: '5 Days',
    estimatedFrom: 1200,
    travelStyle: 'Nature + Adventure + Relaxation',
    activities: ['Uluwatu Temple', 'Tegallalang Rice Terrace', 'Ubud Monkey Forest', 'Seminyak Beach'],
    interests: ['Nature', 'Adventure'],
    flightFrom: 500,
    hotelFrom: 400,
    activitiesFrom: 150,
    transportFoodFrom: 150,
  },
  {
    id: 'dest-bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    emoji: '🛕',
    image: 'https://images.pexels.com/photos/30540817/pexels-photo-30540817.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Bustling markets, golden temples, street food paradise, and rooftop bars along the Chao Phraya.',
    bestTime: 'Nov–Feb',
    duration: '4 Days',
    estimatedFrom: 950,
    travelStyle: 'Food + Culture + Adventure',
    activities: ['Grand Palace', 'Wat Arun', 'Chatuchak Market', 'Khao San Road'],
    interests: ['Food', 'Culture', 'Adventure'],
    flightFrom: 350,
    hotelFrom: 300,
    activitiesFrom: 150,
    transportFoodFrom: 150,
  },
  {
    id: 'dest-osaka',
    name: 'Osaka',
    country: 'Japan',
    emoji: '🏯',
    image: 'https://images.pexels.com/photos/21821256/pexels-photo-21821256.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Japan\'s kitchen — takoyaki, okonomiyaki, vibrant nightlife, and the majestic Osaka Castle.',
    bestTime: 'Mar–May, Oct–Nov',
    duration: '3 Days',
    estimatedFrom: 1600,
    travelStyle: 'Food + Nightlife + Culture',
    activities: ['Osaka Castle', 'Dotonbori', 'Universal Studios', 'Shinsekai District'],
    interests: ['Food', 'Culture'],
    flightFrom: 850,
    hotelFrom: 450,
    activitiesFrom: 150,
    transportFoodFrom: 150,
  },
  {
    id: 'dest-singapore',
    name: 'Singapore',
    country: 'Singapore',
    emoji: '🦁',
    image: 'https://images.pexels.com/photos/15480459/pexels-photo-15480459.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Gardens by the Bay, hawker centres, Marina Bay Sands, and a perfect blend of cultures.',
    bestTime: 'Feb–Apr',
    duration: '3 Days',
    estimatedFrom: 1100,
    travelStyle: 'Food + Culture + Shopping',
    activities: ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa Island', 'Chinatown'],
    interests: ['Food', 'Culture', 'Shopping'],
    flightFrom: 400,
    hotelFrom: 500,
    activitiesFrom: 100,
    transportFoodFrom: 100,
  },
];

export { DEFAULT_TRAVELLERS };
