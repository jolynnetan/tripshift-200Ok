import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Trip, TravelGroup, Traveller, ItineraryDay, ItineraryActivity, AdaptationRecord, FlightOffer, Hotel, BudgetItem } from '@/types';
import { DEFAULT_TRIPS, DEFAULT_GROUPS } from '@/data/tripsData';
import { INITIAL_ITINERARY, ALL_DISRUPTION_SCENARIOS } from '@/data/itineraryData';
import { generateItinerary, generateWeather, computeEstimatedSpend } from '@/lib/generateItinerary';
import { FLIGHT_OFFERS, HOTELS, WEATHER_FORECAST } from '@/data/comparisonData';
import { computeOverallGroupMatch, computeActivityCompatibility } from '@/lib/groupMatch';

const AVATARS = ['🧑', '👩', '🧔', '👨', '👱', '🧔‍♀️', '👨‍🦰', '👩‍🦰'];

const STORAGE_KEY = 'tripsift-state-v5';

interface PersistedState {
  trips: Trip[];
  groups: TravelGroup[];
  activeTripId: string | null;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.trips) || !Array.isArray(parsed.groups)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export interface AppState {
  trips: Trip[];
  groups: TravelGroup[];
  activeTripId: string | null;
  activeTrip: Trip | null;
  planningTrip: Partial<Trip> | null;
  groupMatch: number;
  groupMatchNote: string;
  activityCompatibility: { label: string; value: number }[];

  setActiveTrip: (id: string) => void;
  startNewTrip: (destination?: string) => void;
  updatePlanningTrip: (data: Partial<Trip>) => void;
  completePlanning: () => void;
  cancelPlanning: () => void;

  createGroup: (name: string) => string;
  deleteGroup: (id: string) => void;
  addTraveller: (groupId: string, traveller: Omit<Traveller, 'id'>) => void;
  updateTraveller: (groupId: string, id: string, traveller: Omit<Traveller, 'id'>) => void;
  deleteTraveller: (groupId: string, id: string) => void;
  getInviteLink: (groupId: string) => string;
  joinTripByLink: (inviteToken: string) => string | null;

  setTripBudget: (tripId: string, amount: number) => void;
  selectFlight: (tripId: string, offer: FlightOffer) => void;
  selectHotel: (tripId: string, hotel: Hotel) => void;
  addRequestedActivity: (tripId: string, activity: string) => void;
  removeRequestedActivity: (tripId: string, activity: string) => void;
  updateTrip: (tripId: string, data: Partial<Trip>) => void;

  applyPlan: (tripId: string, scenarioId: string, alternativeId: string, targetActivityId?: string) => void;
  restorePlanA: (tripId: string) => void;
  replaceActivity: (tripId: string, dayNumber: number, activityId: string, newActivity: ItineraryActivity) => void;
  addNearbyActivity: (tripId: string, dayNumber: number, activity: ItineraryActivity) => void;
  reorderBlocks: (tripId: string, dayNumber: number, fromId: string, toId: string) => void;
  togglePinBlock: (tripId: string, activityId: string) => void;
  toggleGroupCollapse: (tripId: string, dayNumber: number, groupBlockId: string) => void;
  replaceBlock: (tripId: string, dayNumber: number, activityId: string, newActivity: ItineraryActivity) => void;
  undoReplaceBlock: (tripId: string) => void;
  changeDestination: (tripId: string, destination: { name: string; country: string; emoji: string; coverImage: string; activities: string[] }) => void;
}

function getTripBudgetItems(trip: Trip): BudgetItem[] {
  const flightCost = trip.selectedFlight?.totalPrice ?? 0;
  const hotelCost = trip.selectedHotel?.bestPrice ?? 0;
  const activitiesCost = trip.itinerary.flatMap((d) => d.activities).reduce((s, a) => s + (a.cost ?? 0), 0);
  return [
    { category: 'Flights' as const, amount: flightCost, icon: 'plane' as const },
    { category: 'Hotel' as const, amount: hotelCost, icon: 'hotel' as const },
    { category: 'Transport' as const, amount: 180, icon: 'transport' as const },
    { category: 'Food' as const, amount: 400, icon: 'food' as const },
    { category: 'Activities' as const, amount: activitiesCost, icon: 'activities' as const },
  ];
}

export function computeTripSpend(trip: Trip): number {
  const items = getTripBudgetItems(trip);
  return items.reduce((s, i) => s + i.amount, 0);
}

function sortTripsByDate(trips: Trip[]): Trip[] {
  const statusOrder: Record<string, number> = { current: 0, upcoming: 1, past: 2 };
  return [...trips].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    const now = new Date();
    const year = now.getFullYear();
    const parseDate = (str: string) => new Date(`${str} ${year}`).getTime();
    const aDate = parseDate(a.startMonth || a.startDate);
    const bDate = parseDate(b.startMonth || b.startDate);
    if (a.status === 'past') return bDate - aDate;
    return aDate - bDate;
  });
}

export function useAppState(): AppState {
  const [persisted] = useState(loadPersistedState);
  const [trips, setTrips] = useState<Trip[]>(persisted?.trips ?? DEFAULT_TRIPS);
  const [groups, setGroups] = useState<TravelGroup[]>(persisted?.groups ?? DEFAULT_GROUPS);
  const [activeTripId, setActiveTripId] = useState<string | null>(persisted?.activeTripId ?? 'trip-tokyo');
  const [planningTrip, setPlanningTrip] = useState<Partial<Trip> | null>(null);

  useEffect(() => {
    savePersistedState({ trips, groups, activeTripId });
  }, [trips, groups, activeTripId]);

  const activeTrip = useMemo(() => trips.find((t) => t.id === activeTripId) ?? null, [trips, activeTripId]);

  const activeGroup = useMemo(() => {
    if (!activeTrip) return null;
    return groups.find((g) => g.id === activeTrip.groupId) ?? null;
  }, [activeTrip, groups]);

  const groupMatch = useMemo(() => {
    if (!activeTrip || !activeGroup) return 0;
    if (activeTrip.travelType === 'solo') return 100;
    const activities = activeTrip.itinerary.flatMap((d) => d.activities);
    return computeOverallGroupMatch(activities, activeGroup.travellers);
  }, [activeTrip, activeGroup]);

  const groupMatchNote = useMemo(() => {
    if (activeTrip?.travelType === 'solo') return 'Solo trip — all preferences are yours.';
    if (!activeGroup || activeGroup.travellers.length === 0) return 'No travellers yet.';
    if (groupMatch >= 80) return 'Your group strongly aligns on this itinerary.';
    if (groupMatch >= 65) return 'Your group has moderate alignment — some preferences differ.';
    return 'Your group has diverse interests. Consider balancing activities.';
  }, [groupMatch, activeGroup, activeTrip]);

  const activityCompatibility = useMemo(() => {
    if (!activeTrip || !activeGroup) return [];
    if (activeTrip.travelType === 'solo') return [];
    const activities = activeTrip.itinerary.flatMap((d) => d.activities);
    return computeActivityCompatibility(activities, activeGroup.travellers);
  }, [activeTrip, activeGroup]);

  const setActiveTrip = useCallback((id: string) => {
    setActiveTripId(id);
  }, []);

  const startNewTrip = useCallback((destination?: string) => {
    setPlanningTrip({
      destination: destination ?? '',
      country: '',
      emoji: '📍',
      budget: 2000,
      travelType: 'group',
      groupId: groups[0]?.id ?? '',
      requestedActivities: [],
      itinerary: [],
      originalItinerary: [],
      selectedFlight: null,
      selectedHotel: null,
      appliedPlans: [],
      status: 'upcoming',
      currentDay: 0,
      totalDays: 4,
    });
  }, [groups]);

  const updatePlanningTrip = useCallback((data: Partial<Trip>) => {
    setPlanningTrip((prev) => prev ? { ...prev, ...data } : prev);
  }, []);

  const completePlanning = useCallback(() => {
    if (!planningTrip || !planningTrip.destination) return;
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      destination: planningTrip.destination,
      country: planningTrip.country ?? '',
      emoji: planningTrip.emoji ?? '📍',
      coverImage: planningTrip.coverImage ?? 'https://images.pexels.com/photos/15275312/pexels-photo-15275312.jpeg?auto=compress&cs=tinysrgb&w=1200',
      startDate: planningTrip.startDate ?? '',
      endDate: planningTrip.endDate ?? '',
      startMonth: planningTrip.startMonth ?? '',
      endMonth: planningTrip.endMonth ?? '',
      totalDays: planningTrip.totalDays ?? 4,
      currentDay: 0,
      status: 'upcoming',
      travelType: planningTrip.travelType ?? 'group',
      groupId: planningTrip.travelType === 'solo' ? null : planningTrip.groupId ?? groups[0]?.id ?? '',
      budget: planningTrip.budget ?? 2000,
      estimatedSpend: computeEstimatedSpend(planningTrip.budget ?? 2000),
      itinerary: generateItinerary(planningTrip.destination, planningTrip.totalDays ?? 4, planningTrip.requestedActivities ?? []),
      originalItinerary: generateItinerary(planningTrip.destination, planningTrip.totalDays ?? 4, planningTrip.requestedActivities ?? []),
      selectedFlight: planningTrip.selectedFlight ?? FLIGHT_OFFERS[0],
      selectedHotel: planningTrip.selectedHotel ?? HOTELS[0],
      appliedPlans: [],
      requestedActivities: planningTrip.requestedActivities ?? [],
      weather: generateWeather(planningTrip.totalDays ?? 4),
    };
    setTrips((prev) => sortTripsByDate([...prev, newTrip]));
    setPlanningTrip(null);
    setActiveTripId(newTrip.id);
  }, [planningTrip, groups]);

  const cancelPlanning = useCallback(() => {
    setPlanningTrip(null);
  }, []);

  const createGroup = useCallback((name: string) => {
    const id = `group-${Date.now()}`;
    setGroups((prev) => [...prev, { id, name, travellers: [] }]);
    return id;
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addTraveller = useCallback((groupId: string, traveller: Omit<Traveller, 'id'>) => {
    const id = `traveller-${Date.now()}`;
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, travellers: [...g.travellers, { ...traveller, id, avatar }] } : g,
    ));
  }, []);

  const updateTraveller = useCallback((groupId: string, id: string, traveller: Omit<Traveller, 'id'>) => {
    setGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, travellers: g.travellers.map((t) => t.id === id ? { ...t, ...traveller } : t) } : g,
    ));
  }, []);

  const deleteTraveller = useCallback((groupId: string, id: string) => {
    setGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, travellers: g.travellers.filter((t) => t.id !== id) } : g,
    ));
  }, []);

  const getInviteLink = useCallback((groupId: string) => {
    return `${window.location.origin}/?join=${encodeURIComponent(groupId)}`;
  }, []);

  const joinTripByLink = useCallback((inviteToken: string) => {
    const groupId = decodeURIComponent(inviteToken).trim();
    if (!groupId || !groups.some((group) => group.id === groupId)) return null;
    setGroups((prev) => prev.map((group) => {
      if (group.id !== groupId || group.travellers.some((traveller) => traveller.name === 'You')) return group;
      return {
        ...group,
        travellers: [...group.travellers, {
          id: `traveller-${Date.now()}`,
          name: 'You',
          avatar: '🧑',
          interests: [],
          behaviours: [],
          budgetPreference: 'Mid-range',
        }],
      };
    }));
    return groupId;
  }, [groups]);

  const setTripBudget = useCallback((tripId: string, amount: number) => {
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, budget: amount } : t));
  }, []);

  const selectFlight = useCallback((tripId: string, offer: FlightOffer) => {
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, selectedFlight: offer } : t));
  }, []);

  const selectHotel = useCallback((tripId: string, hotel: Hotel) => {
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, selectedHotel: hotel } : t));
  }, []);

  const addRequestedActivity = useCallback((tripId: string, activity: string) => {
    const trimmed = activity.trim();
    if (!trimmed) return;
    setTrips((prev) => prev.map((t) =>
      t.id === tripId && !t.requestedActivities.includes(trimmed)
        ? { ...t, requestedActivities: [...t.requestedActivities, trimmed] }
        : t,
    ));
  }, []);

  const removeRequestedActivity = useCallback((tripId: string, activity: string) => {
    setTrips((prev) => prev.map((t) =>
      t.id === tripId ? { ...t, requestedActivities: t.requestedActivities.filter((a) => a !== activity) } : t,
    ));
  }, []);

  const updateTrip = useCallback((tripId: string, data: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, ...data } : t));
  }, []);

  const applyPlan = useCallback((tripId: string, scenarioId: string, alternativeId: string, targetActivityId?: string) => {
    const scenario = ALL_DISRUPTION_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    const alt = scenario.alternatives.find((a) => a.id === alternativeId);
    if (!alt) return;

    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;

      // Find the activity to replace: use targetActivityId if provided, else the scenario's original activity
      const replaceId = targetActivityId ?? scenario.originalActivity.id;
      if (!replaceId) return trip;

      const planTag: 'B' | 'C' | 'D' = alt.label.includes('B') ? 'B' : alt.label.includes('C') ? 'C' : 'D';
      const targetAct = trip.itinerary.flatMap((d) => d.activities).find((a) => a.id === replaceId);
      const replacementActivity: ItineraryActivity = {
        id: alt.id,
        time: targetAct?.time ?? scenario.originalActivity.time,
        emoji: alt.emoji,
        title: alt.title,
        planTag,
        cost: alt.budgetImpact > 0 ? alt.budgetImpact : 0,
        location: alt.transport?.to,
        duration: alt.duration,
        category: alt.category,
        isOutdoor: alt.isOutdoor,
        characteristics: alt.characteristics,
        transport: alt.transport,
      };

      const newItinerary = trip.itinerary.map((day) => ({
        ...day,
        activities: day.activities.map((act) =>
          act.id === replaceId ? { ...replacementActivity, time: act.time } : act,
        ),
      }));

      const record: AdaptationRecord = {
        scenarioId,
        scenarioLabel: scenario.label,
        replacedActivityId: replaceId,
        replacementActivity,
        timestamp: Date.now(),
      };

      return {
        ...trip,
        itinerary: newItinerary,
        appliedPlans: [...trip.appliedPlans, record],
      };
    }));
  }, []);

  const replaceActivity = useCallback((tripId: string, dayNumber: number, activityId: string, newActivity: ItineraryActivity) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      const newItinerary = trip.itinerary.map((day) =>
        day.day === dayNumber
          ? { ...day, activities: day.activities.map((act) => (act.id === activityId ? { ...newActivity, time: act.time } : act)) }
          : day,
      );
      return { ...trip, itinerary: newItinerary };
    }));
  }, []);

  const addNearbyActivity = useCallback((tripId: string, dayNumber: number, activity: ItineraryActivity) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        itinerary: trip.itinerary.map((day) => {
          if (day.day !== dayNumber) return day;
          const sorted = [...day.activities, activity].sort((a, b) => a.time.localeCompare(b.time));
          return { ...day, activities: sorted };
        }),
      };
    }));
  }, []);

  const reorderBlocks = useCallback((tripId: string, dayNumber: number, fromId: string, toId: string) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        itinerary: trip.itinerary.map((day) => {
          if (day.day !== dayNumber) return day;
          const activities = [...day.activities];
          const fromIdx = activities.findIndex((a) => a.id === fromId);
          const toIdx = activities.findIndex((a) => a.id === toId);
          if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return day;
          const [moved] = activities.splice(fromIdx, 1);
          activities.splice(toIdx, 0, moved);
          // Swap times so the timeline stays chronological after reorder
          const otherIdx = fromIdx < toIdx ? toIdx - 1 : toIdx + 1;
          const safeOther = Math.max(0, Math.min(otherIdx, activities.length - 1));
          const tmpTime = activities[toIdx].time;
          activities[toIdx] = { ...activities[toIdx], time: activities[safeOther].time };
          activities[safeOther] = { ...activities[safeOther], time: tmpTime };
          return { ...day, activities };
        }),
      };
    }));
  }, []);

  const togglePinBlock = useCallback((tripId: string, activityId: string) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        itinerary: trip.itinerary.map((day) => ({
          ...day,
          activities: day.activities.map((a) =>
            a.id === activityId ? { ...a, pinned: !a.pinned } : a,
          ),
        })),
      };
    }));
  }, []);

  const toggleGroupCollapse = useCallback((tripId: string, dayNumber: number, groupBlockId: string) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        itinerary: trip.itinerary.map((day) => {
          if (day.day !== dayNumber) return day;
          if (!day.groupBlocks) return day;
          return {
            ...day,
            groupBlocks: day.groupBlocks.map((g) =>
              g.id === groupBlockId ? { ...g, collapsed: !g.collapsed } : g,
            ),
          };
        }),
      };
    }));
  }, []);

  const replaceBlock = useCallback((tripId: string, dayNumber: number, activityId: string, newActivity: ItineraryActivity) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      let savedOriginal: ItineraryActivity | null = null;
      const updatedItinerary = trip.itinerary.map((day) => {
        if (day.day !== dayNumber) return day;
        return {
          ...day,
          activities: day.activities.map((act) => {
            if (act.id === activityId) {
              savedOriginal = { ...act };
              return { ...newActivity, time: act.time, status: 'replaced' as const };
            }
            return act;
          }),
        };
      });
      // Store the original activity on the trip for undo
      void savedOriginal;
      return {
        ...trip,
        itinerary: updatedItinerary,
        lastReplacedBlock: savedOriginal
          ? { dayNumber, originalActivity: savedOriginal, replacedActivityId: activityId }
          : trip.lastReplacedBlock,
      };
    }));
  }, []);

  const undoReplaceBlock = useCallback((tripId: string) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      if (!trip.lastReplacedBlock) return trip;
      const { dayNumber, originalActivity, replacedActivityId } = trip.lastReplacedBlock;
      return {
        ...trip,
        itinerary: trip.itinerary.map((day) =>
          day.day === dayNumber
            ? {
                ...day,
                activities: day.activities.map((act) =>
                  act.id === replacedActivityId
                    ? { ...originalActivity, status: 'scheduled' as const }
                    : act,
                ),
              }
            : day,
        ),
        lastReplacedBlock: null,
      };
    }));
  }, []);

  const restorePlanA = useCallback((tripId: string) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        itinerary: trip.originalItinerary.map((day) => ({
          ...day,
          activities: day.activities.map((activity) => ({ ...activity })),
        })),
        appliedPlans: [],
      };
    }));
  }, []);

  const changeDestination = useCallback((tripId: string, dest: { name: string; country: string; emoji: string; coverImage: string; activities: string[] }) => {
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== tripId) return trip;
      const newItinerary = generateItinerary(dest.name, trip.totalDays, dest.activities);
      return {
        ...trip,
        destination: dest.name,
        country: dest.country,
        emoji: dest.emoji,
        coverImage: dest.coverImage,
        requestedActivities: dest.activities,
        itinerary: newItinerary,
        originalItinerary: newItinerary,
        weather: generateWeather(trip.totalDays),
        appliedPlans: [],
      };
    }));
  }, []);

  return {
    trips,
    groups,
    activeTripId,
    activeTrip,
    planningTrip,
    groupMatch,
    groupMatchNote,
    activityCompatibility,
    setActiveTrip,
    startNewTrip,
    updatePlanningTrip,
    completePlanning,
    cancelPlanning,
    createGroup,
    deleteGroup,
    addTraveller,
    updateTraveller,
    deleteTraveller,
    getInviteLink,
    joinTripByLink,
    setTripBudget,
    selectFlight,
    selectHotel,
    addRequestedActivity,
    removeRequestedActivity,
    updateTrip,
    applyPlan,
    restorePlanA,
    replaceActivity,
    addNearbyActivity,
    reorderBlocks,
    togglePinBlock,
    toggleGroupCollapse,
    replaceBlock,
    undoReplaceBlock,
    changeDestination,
  };
}

export { FLIGHT_OFFERS, HOTELS, WEATHER_FORECAST, INITIAL_ITINERARY };
