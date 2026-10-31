import React, { useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useSafety } from '../context/SafetyContext';
import RoutePlannerInput from '../components/routes/RoutePlannerInput';
import RouteCard from '../components/routes/RouteCard';
import SafetyBreakdownModal from '../components/routes/SafetyBreakdownModal';
import MapView from '../components/map/MapView';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const RoutePlannerPage = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('safest');
  const {
    routes,
    destination,
    selectedRouteId,
    setSelectedRouteId,
    selectedRoute,
    saveSelectedRouteHistory,
    isModalOpen,
    activeModalRoute,
    openRouteDetails,
    closeRouteDetails
  } = useRoute();

  const { currentLocation } = useSafety();

  const routeEnd = selectedRoute?.coordinates?.[selectedRoute.coordinates.length - 1];

  const handleStartNavigation = async (route) => {
    try {
      await saveSelectedRouteHistory(route);
      setSelectedRouteId(route.id);
      onRouteChange('navigate');
    } catch (error) {
      console.error('Failed to save route history:', error);
      alert('Route history could not be saved. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Safe Corridor Navigation Planner
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              AI Scoring Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare 3 intelligent routes dynamically weighted for pedestrian lighting, CCTV surveillance, and verified safe havens.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs + Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form + Route Cards */}
        <div className="lg:col-span-5 space-y-4">
          <RoutePlannerInput />
          {/* All Available Routes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Available Routes
              </span>
              <span className="text-[11px] text-blue-600 font-bold">
                Tap card to preview on map
              </span>
            </div>
            {['safest', 'balanced', 'fastest'].map((category) => {
              const route = routes.find((r) =>
                r.recommendedCategories?.includes(category)
              );

              if (!route) return null;

              const categoryDetails = {
                safest: {
                  tagType: 'safe',
                  name: 'Safest Route',
                  tag: 'Safest',
                },
                balanced: {
                  tagType: 'balanced',
                  name: 'Balanced Route',
                  tag: 'Balanced',
                },
                fastest: {
                  tagType: 'fastest',
                  name: 'Fastest Route',
                  tag: 'Fastest',
                },
              };

              const categoryRoute = {
                ...route,
                ...categoryDetails[category],
              };

              return (
                <div key={category} className="space-y-2">
                  <RouteCard
                    route={categoryRoute}
                    isSelected={
                      String(route.id) === String(selectedRouteId) &&
                      selectedCategory === category
                    }
                    onSelect={() => {
                      setSelectedRouteId(route.id);
                      setSelectedCategory(category);
                    }}
                    onInspectSafety={() => openRouteDetails(route)}
                    onStartNavigation={handleStartNavigation}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <MapView
            routes={routes}
            selectedRouteId={selectedRouteId}
            selectedCategory={selectedCategory}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            currentLocation={currentLocation}
            destinationLocation={
              routeEnd
                ? { lat: routeEnd[0], lng: routeEnd[1], name: destination }
                : null
            }
            showAllRoutes={false}
            height="440px"
          />

          {/* Map Helper Legend Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Selected Corridor: <strong className="text-slate-900">{selectedRoute?.name}</strong></span>
            </div>
            <button
              onClick={() => openRouteDetails(selectedRoute)}
              className="text-blue-600 font-bold hover:underline text-xs"
            >
              Inspect Safety Breakdown →
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Safety Breakdown Modal / Drawer */}
      <SafetyBreakdownModal
        isOpen={isModalOpen}
        onClose={closeRouteDetails}
        route={activeModalRoute || selectedRoute}
        onStartNavigation={handleStartNavigation}
      />
    </div>
  );
};

export default RoutePlannerPage;
