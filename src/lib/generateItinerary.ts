import type { ItineraryDay, ItineraryActivity, WeatherForecast } from '@/types';

const EMOJIS = ['🏛️', '🍣', '⛩️', '🛍️', '🌳', '🗼', '♨️', '🍜', '🛒', '☕', '🎁', '✈️', '🏨', '🍽️', '🌆', '🚌', '🚃', '🌴', '🏖️', '🛕', '🏯', '🦁'];
const CATEGORIES = ['Culture', 'Food', 'Attraction', 'Shopping', 'Activity', 'Travel'];
const TIMES = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const DURATIONS = ['1.5 hours', '2 hours', '3 hours', '1 hour'];

const WEATHER_CONDITIONS: WeatherForecast['condition'][] = ['sunny', 'cloudy', 'rain', 'storm'];
const WEATHER_ICONS: WeatherForecast['icon'][] = ['sun', 'cloud', 'rain', 'storm'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateItinerary(destination: string, totalDays: number, requestedActivities: string[]): ItineraryDay[] {
  const rand = seededRandom(hashString(destination));
  const days: ItineraryDay[] = [];

  const allActivities = [
    ...requestedActivities,
    `${destination} City Tour`,
    `Local Food Tasting`,
    `Sunset Viewpoint`,
    `Cultural Walking Tour`,
    `Free Time / Exploration`,
    `Riverside Stroll`,
    `Night Market Visit`,
  ];

  for (let d = 1; d <= totalDays; d++) {
    const dayName = DAY_NAMES[(d - 1) % 7];
    const activities: ItineraryActivity[] = [];
    const isLastDay = d === totalDays;
    const timesForDay = TIMES;

    timesForDay.forEach((time, i) => {
      const actIndex = (d - 1) * 4 + i;
      const isRequested = actIndex < requestedActivities.length;
      const title = allActivities[actIndex % allActivities.length];

      activities.push({
        id: `gen-${destination.toLowerCase()}-d${d}-a${i}`,
        time,
        emoji: EMOJIS[Math.floor(rand() * EMOJIS.length)],
        title,
        location: destination,
        duration: DURATIONS[Math.floor(rand() * DURATIONS.length)],
        cost: Math.floor(rand() * 50),
        category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
        isOutdoor: rand() > 0.5,
        isRequested,
      });
    });

    if (isLastDay) {
      activities.push({
        id: `gen-${destination.toLowerCase()}-d${d}-depart`,
        time: '10:00',
        emoji: '✈️',
        title: `Depart ${destination}`,
        location: 'Airport',
        duration: '—',
        cost: 0,
        category: 'Travel',
        isOutdoor: false,
        transport: { mode: 'train', from: destination, to: 'Airport', duration: '60 min', cost: 12 },
      });
    }

    days.push({
      day: d,
      label: `Day ${d} · ${dayName}`,
      activities,
    });
  }

  return days;
}

export function generateWeather(totalDays: number): WeatherForecast[] {
  const rand = seededRandom(totalDays * 42);
  const forecast: WeatherForecast[] = [];

  for (let d = 0; d < totalDays; d++) {
    const condIdx = Math.floor(rand() * WEATHER_CONDITIONS.length);
    const condition = WEATHER_CONDITIONS[condIdx];
    const hasAlert = condition === 'storm' || (condition === 'rain' && rand() > 0.7);

    forecast.push({
      day: DAY_NAMES[d % 7],
      condition,
      high: 24 + Math.floor(rand() * 10),
      low: 16 + Math.floor(rand() * 8),
      icon: WEATHER_ICONS[condIdx],
      alert: hasAlert ? 'Heavy rain expected in the afternoon' : undefined,
    });
  }

  return forecast;
}

export function computeEstimatedSpend(budget: number): number {
  return Math.round(budget * 0.82);
}
