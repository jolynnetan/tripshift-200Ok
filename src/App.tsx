import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { Landing } from '@/screens/Landing';
import { PlanningFlow } from '@/screens/PlanningFlow';
import { Generating } from '@/screens/Generating';
import { Overview } from '@/screens/Overview';
import { MyTrips } from '@/screens/MyTrips';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { DestinationDetail } from '@/screens/DestinationDetail';
import { GroupsScreen } from '@/screens/GroupsScreen';
import { ActiveTrip } from '@/screens/ActiveTrip';
import { useAppState } from '@/state/useAppState';
import type { Destination, NavSection, TravelType, FlightOffer, Hotel, Traveller } from '@/types';

type Flow = 'landing' | 'planning' | 'generating' | 'app';

export default function App() {
  const [flow, setFlow] = useState<Flow>('landing');
  const [nav, setNav] = useState<NavSection>('overview');
  const [activeTripView, setActiveTripView] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [tripInitialView, setTripInitialView] = useState<'itinerary' | 'disruption-select' | undefined>(undefined);
  const [prevNav, setPrevNav] = useState<NavSection>('trips');

  const state = useAppState();
  const { joinTripByLink, setActiveTrip, trips } = state;

  const enterApp = useCallback(() => {
    setFlow('app');
    setNav('overview');
  }, []);

  const handleHowItWorks = useCallback(() => {
    enterApp();
  }, [enterApp]);

  useEffect(() => {
    const handler = () => enterApp();
    window.addEventListener('tripsift-start-planning', handler);
    return () => window.removeEventListener('tripsift-start-planning', handler);
  }, [enterApp]);

  useEffect(() => {
    const inviteToken = new URLSearchParams(window.location.search).get('join');
    if (!inviteToken) return;
    const groupId = joinTripByLink(inviteToken);
    if (!groupId) return;
    const invitedTrip = trips.find((trip) => trip.groupId === groupId);
    if (invitedTrip) {
      setActiveTrip(invitedTrip.id);
      setFlow('app');
      setNav('trips');
      setActiveTripView(true);
    }
    window.history.replaceState({}, '', window.location.pathname);
  }, [joinTripByLink, setActiveTrip, trips]);

  const handleOpenTrip = useCallback((tripId: string, initialView?: 'itinerary' | 'disruption-select') => {
    setPrevNav(nav);
    state.setActiveTrip(tripId);
    setActiveTripView(true);
    setSelectedDestination(null);
    setTripInitialView(initialView);
  }, [state, nav]);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveTripView(false);
    setSelectedDestination(null);
    setNav(section);
  }, []);

  const handleBackFromTrip = useCallback(() => {
    setActiveTripView(false);
    setNav(prevNav);
  }, [prevNav]);

  const handleNewTrip = useCallback(() => {
    state.startNewTrip();
    setFlow('planning');
  }, [state]);

  const handlePlanFromDestination = useCallback((dest: Destination) => {
    setSelectedDestination(dest);
    state.startNewTrip(dest.name);
    setFlow('planning');
  }, [state]);

  const handleSelectDestination = useCallback((dest: Destination) => {
    setSelectedDestination(dest);
  }, []);

  const handleCompletePlanning = useCallback((data: {
    destination: string;
    country: string;
    emoji: string;
    coverImage: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    travelType: TravelType;
    groupId: string | null;
    budget: number;
    requestedActivities: string[];
    selectedFlight: FlightOffer | null;
    selectedHotel: Hotel | null;
  }) => {
    state.updatePlanningTrip({
      destination: data.destination,
      country: data.country,
      emoji: data.emoji,
      coverImage: data.coverImage || 'https://images.pexels.com/photos/15275312/pexels-photo-15275312.jpeg?auto=compress&cs=tinysrgb&w=1200',
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      travelType: data.travelType,
      groupId: data.groupId,
      budget: data.budget,
      requestedActivities: data.requestedActivities,
      selectedFlight: data.selectedFlight,
      selectedHotel: data.selectedHotel,
    });
    setFlow('generating');
  }, [state]);

  const handleGeneratingDone = useCallback(() => {
    state.completePlanning();
    setFlow('app');
    setNav('trips');
    setActiveTripView(true);
  }, [state]);

  if (flow === 'landing') {
    return (
      <Landing onStart={enterApp} onHowItWorks={handleHowItWorks} />
    );
  }

  if (flow === 'planning') {
    return (
      <PlanningFlow
        destination={selectedDestination ?? undefined}
        groups={state.groups}
        onCreateGroup={state.createGroup}
        onBack={() => { setFlow('app'); state.cancelPlanning(); }}
        onComplete={handleCompletePlanning}
      />
    );
  }

  if (flow === 'generating') {
    return <Generating onDone={handleGeneratingDone} />;
  }

  const activeGroup = state.activeTrip
    ? (state.activeTrip.groupId ? state.groups.find((g) => g.id === state.activeTrip!.groupId) ?? null : null)
    : null;

  return (
    <div className="min-h-screen bg-sand-50 flex">
      <Sidebar active={nav} onNavigate={handleNavigate} travellerCount={activeGroup?.travellers.length ?? 0} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav active={nav} onNavigate={handleNavigate} />
        <main className="flex-1 pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={nav + (activeTripView ? '-active' : '') + (selectedDestination ? '-dest' : '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTripView && state.activeTrip ? (
                <ActiveTrip
                  trip={state.activeTrip}
                  group={activeGroup}
                  onBack={handleBackFromTrip}
                  onSetBudget={(amount) => state.setTripBudget(state.activeTrip!.id, amount)}
                  onApplyPlan={(scenarioId, alternativeId, targetActivityId) => state.applyPlan(state.activeTrip!.id, scenarioId, alternativeId, targetActivityId)}
                  onRestorePlanA={() => state.restorePlanA(state.activeTrip!.id)}
                  onReplaceActivity={(dayNumber, activityId, newActivity) => state.replaceActivity(state.activeTrip!.id, dayNumber, activityId, newActivity)}
                  onAddTraveller={(traveller: Omit<Traveller, 'id'>) => activeGroup && state.addTraveller(activeGroup.id, traveller)}
                  onUpdateTraveller={(id: string, traveller: Omit<Traveller, 'id'>) => activeGroup && state.updateTraveller(activeGroup.id, id, traveller)}
                  onAddNearbyActivity={(dayNumber, activity) => state.addNearbyActivity(state.activeTrip!.id, dayNumber, activity)}
                  onReorderBlocks={(dayNumber, fromId, toId) => state.reorderBlocks(state.activeTrip!.id, dayNumber, fromId, toId)}
                  onTogglePin={(activityId) => state.togglePinBlock(state.activeTrip!.id, activityId)}
                  onToggleGroupCollapse={(dayNumber, groupBlockId) => state.toggleGroupCollapse(state.activeTrip!.id, dayNumber, groupBlockId)}
                  onReplaceBlock={(dayNumber, activityId, newActivity) => state.replaceBlock(state.activeTrip!.id, dayNumber, activityId, newActivity)}
                  onUndoReplace={() => state.undoReplaceBlock(state.activeTrip!.id)}
                  initialView={tripInitialView}
                />
              ) : selectedDestination ? (
                <DestinationDetail
                  destination={selectedDestination}
                  onBack={() => setSelectedDestination(null)}
                  onContinuePlanning={(dest) => {
                    setSelectedDestination(null);
                    handlePlanFromDestination(dest);
                  }}
                />
              ) : nav === 'overview' ? (
                <Overview
                  trips={state.trips}
                  groups={state.groups}
                  onOpenTrip={handleOpenTrip}
                  onExplore={() => setNav('explore')}
                  onNewTrip={handleNewTrip}
                />
              ) : nav === 'trips' ? (
                <MyTrips
                  trips={state.trips}
                  groups={state.groups}
                  onOpenTrip={handleOpenTrip}
                  onNewTrip={handleNewTrip}
                  onExplore={() => setNav('explore')}
                />
              ) : nav === 'explore' ? (
                <ExploreScreen
                  onSelectDestination={handleSelectDestination}
                  onPlanTrip={handlePlanFromDestination}
                />
              ) : nav === 'groups' ? (
                <GroupsScreen
                  groups={state.groups}
                  onCreateGroup={state.createGroup}
                  onDeleteGroup={state.deleteGroup}
                  onAddTraveller={state.addTraveller}
                  onUpdateTraveller={state.updateTraveller}
                  onDeleteTraveller={state.deleteTraveller}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
