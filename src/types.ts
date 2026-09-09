export type Interest = 'Food' | 'Culture' | 'Shopping' | 'Adventure' | 'Photography' | 'Nature' | 'Nightlife' | 'Relaxed';

export type Behaviour =
  | 'Likes early mornings'
  | 'Prefers relaxed schedules'
  | 'Likes shopping'
  | 'Loves food hunting'
  | 'Enjoys museums and culture'
  | 'Avoids crowded places'
  | 'Prefers indoor activities'
  | "Doesn't like long walking"
  | 'Likes photography'
  | 'Prefers nightlife'
  | 'Budget conscious'
  | 'Likes spontaneous activities'
  | 'Comfortable with walking'
  | 'Likes busy areas'
  | 'Prefers flexible schedules'
  | 'Early bird'
  | 'Night owl'
  | 'Low walking tolerance'
  | 'High walking tolerance'
  | 'Prefers packed schedule';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type BudgetCategory = 'Flights' | 'Hotel' | 'Transport' | 'Food' | 'Activities';

export type TravelStyle = 'Budget' | 'Mid-range' | 'Premium';

export interface Traveller {
  id: string;
  name: string;
  avatar: string;
  interests: Interest[];
  behaviours: Behaviour[];
  budgetPreference: TravelStyle;
}

export interface TravelGroup {
  id: string;
  name: string;
  travellers: Traveller[];
}

export type TransportMode = 'train' | 'walking' | 'bus' | 'taxi';

export type BlockType = 'activity' | 'food' | 'transport' | 'stay';

export type BlockStatus = 'scheduled' | 'completed' | 'affected' | 'replaced';

export interface TransportInfo {
  mode: TransportMode;
  from: string;
  to: string;
  duration: string;
  cost: number;
}

export interface ActivityCharacteristics {
  indoor: boolean;
  lowWalking: boolean;
  relaxed: boolean;
  lowCost: boolean;
  lowCrowd: boolean;
  photography: boolean;
  nightlife: boolean;
  earlyMorning: boolean;
  flexibleSchedule: boolean;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  emoji: string;
  title: string;
  note?: string;
  planTag?: 'A' | 'B' | 'C' | 'D';
  cost?: number;
  location?: string;
  duration?: string;
  category?: string;
  isOutdoor?: boolean;
  transport?: TransportInfo;
  characteristics?: ActivityCharacteristics;
  isRequested?: boolean;
  optimizationNote?: string;
  blockType?: BlockType;
  groupBlockId?: string;
  pinned?: boolean;
  status?: BlockStatus;
}

export interface GroupBlock {
  id: string;
  title: string;
  emoji: string;
  startTime: string;
  endTime: string;
  location?: string;
  collapsed?: boolean;
  childActivityIds: string[];
}

export interface ItineraryDay {
  day: number;
  label: string;
  activities: ItineraryActivity[];
  groupBlocks?: GroupBlock[];
}

export interface BudgetItem {
  category: BudgetCategory;
  amount: number;
  icon: 'plane' | 'hotel' | 'transport' | 'food' | 'activities';
}

export type ReasoningIcon = 'weather' | 'group' | 'budget' | 'travel' | 'schedule';

export interface ReasoningFactor {
  icon: ReasoningIcon;
  label: string;
  value: string;
  positive: boolean;
}

export interface PlanAlternative {
  id: string;
  label: string;
  emoji: string;
  title: string;
  risk: RiskLevel;
  groupMatch?: number;
  budgetImpact: number;
  recommended?: boolean;
  detail?: string;
  category?: string;
  isOutdoor?: boolean;
  duration?: string;
  transport?: TransportInfo;
  reasoning?: ReasoningFactor[];
  arrivalTime?: string;
  scheduleCompatibility?: number;
  characteristics?: ActivityCharacteristics;
}

export type DisruptionType = 'weather' | 'transport' | 'delay' | 'flight' | 'attraction';

export interface DisruptionScenario {
  id: string;
  type: DisruptionType;
  emoji: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  originalActivity: ItineraryActivity;
  alternatives: PlanAlternative[];
  explanation: string;
  ctaLabel: string;
  appliedNote: string;
}

// ── Comparison engine types ──

export type ProviderType = 'airline' | 'agency';

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  provider: Provider;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  baggage: string;
  refundable: boolean;
  totalPrice: number;
  pricePerTraveller: number;
  bestValue?: boolean;
  cheapest?: boolean;
  fastest?: boolean;
}

export type SortKey = 'cheapest' | 'bestValue' | 'fastest' | 'departure' | 'provider';

export interface HotelOffer {
  provider: Provider;
  price: number;
  refundable: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  area: string;
  image: string;
  roomType: string;
  distanceFromCenter: string;
  travelTimeToActivities: string;
  nearbyTransport: string;
  offers: HotelOffer[];
  bestPrice?: number;
  bestPriceProvider?: string;
  bestValue?: boolean;
  bestLocation?: boolean;
  lowestPrice?: boolean;
}

export interface AIRecommendation {
  flightOffer: FlightOffer;
  hotel: Hotel;
  hotelPrice: number;
  transport: string;
  transportCost: number;
  estimatedTotal: number;
  reason: string;
}

export interface WeatherForecast {
  day: string;
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm';
  high: number;
  low: number;
  icon: 'sun' | 'cloud' | 'rain' | 'storm';
  alert?: string;
}

export interface LocalInsight {
  id: string;
  title: string;
  text: string;
  category: string;
}

export interface ExploreItem {
  id: string;
  name: string;
  emoji: string;
  category: 'Attraction' | 'Food' | 'Activity';
  area: string;
  rating: number;
  cost: string;
  insight: string;
  image?: string;
}

export type TripStatus = 'current' | 'upcoming' | 'past';
export type TravelType = 'solo' | 'group';

export interface Trip {
  id: string;
  destination: string;
  country: string;
  emoji: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  startMonth: string;
  endMonth: string;
  totalDays: number;
  currentDay: number;
  status: TripStatus;
  travelType: TravelType;
  groupId: string | null;
  budget: number;
  estimatedSpend: number;
  itinerary: ItineraryDay[];
  originalItinerary: ItineraryDay[];
  selectedFlight: FlightOffer | null;
  selectedHotel: Hotel | null;
  appliedPlans: AdaptationRecord[];
  lastReplacedBlock?: { dayNumber: number; originalActivity: ItineraryActivity; replacedActivityId: string } | null;
  requestedActivities: string[];
  weather: WeatherForecast[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  image: string;
  description: string;
  bestTime: string;
  duration: string;
  estimatedFrom: number;
  travelStyle: string;
  activities: string[];
  interests: Interest[];
  flightFrom: number;
  hotelFrom: number;
  activitiesFrom: number;
  transportFoodFrom: number;
}

export type NavSection = 'overview' | 'trips' | 'explore' | 'groups';

export interface AdaptationRecord {
  scenarioId: string;
  scenarioLabel: string;
  replacedActivityId: string;
  replacementActivity: ItineraryActivity;
  timestamp: number;
}

export type NearbyRecommendationType = 'activity' | 'event';

export interface NearbyRecommendation {
  id: string;
  type: NearbyRecommendationType;
  emoji: string;
  title: string;
  category: string;
  time: string;
  duration: string;
  distance: number;
  cost: number;
  location: string;
  description: string;
  interests: Interest[];
}

export interface NearbyTraveller {
  id: string;
  name: string;
  avatar: string;
  interests: Interest[];
  distance: number;
  availableUntil: string;
  openToJoin: boolean;
}
