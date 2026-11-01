
import React, { useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useSafety } from '../context/SafetyContext';
import RoutePlannerInput from '../components/routes/RoutePlannerInput';
import RouteCard from '../components/routes/RouteCard';
import SafetyBreakdownModal from '../components/routes/SafetyBreakdownModal';
import MapView from '../components/map/MapView';
import { ShieldCheck } from 'lucide-react';

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

  const routeEnd = selectedRoute?.coordinates?.[
    selectedRoute.coordinates.length - 1
  ];

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

  const getRouteDetails = (route, index) => {
    const categories = route.recommendedCategories || [];

    if (categories.length > 0) {
      const labels = categories.map(
        category =>
          category.charAt(0).toUpperCase() + category.slice(1)
      );

      return {
        ...route,
        name: labels.join(' • ') + ' Route',
        tag: labels.join(' • '),
        tagType: categories.includes('safest')
          ? 'safe'
          : categories.includes('balanced')
          ? 'balanced'
          : 'fastest',
        categories
      };
    }

    const alternativeNumber = routes
      .slice(0, index + 1)
      .filter(r => !r.recommendedCategories?.length).length;

    return {
      ...route,
      name: `Alternative Route ${alternativeNumber}`,
      tag: `Alternative ${alternativeNumber}`,
      tagType: 'alternative',
      categories: ['alternative']
    };
  };

  const uniqueRoutes = routes.map((route, index) =>
    getRouteDetails(route, index)
  );

  const handleSelectRoute = (route) => {
    setSelectedRouteId(route.id);
    setSelectedCategory(
      route.categories?.[0] || 'alternative'
    );
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Safe Corridor Navigation Planner
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              AI Scoring Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare available routes using safety scores, distance and estimated travel time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-5 space-y-4">
          <RoutePlannerInput />

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Available Routes ({uniqueRoutes.length})
              </span>
              <span className="text-[11px] text-blue-600 font-bold">
                Tap card to preview on map
              </span>
            </div>

            {uniqueRoutes.map((route) => (
              <div key={route.id} className="space-y-2">
                <RouteCard
                  route={route}
                  isSelected={
                    String(route.id) === String(selectedRouteId)
                  }
                  onSelect={() => handleSelectRoute(route)}
                  onInspectSafety={() => openRouteDetails(route)}
                  onStartNavigation={handleStartNavigation}
                />
              </div>
            ))}

            {uniqueRoutes.length === 0 && (
              <p className="text-sm text-slate-500 p-4">
                No routes available. Please enter your starting point and destination.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-3">
          <MapView
            routes={uniqueRoutes}
            selectedRouteId={selectedRouteId}
            selectedCategory={selectedCategory}
            onSelectRoute={(id) => {
              const route = uniqueRoutes.find(
                r => String(r.id) === String(id)
              );
              if (route) handleSelectRoute(route);
            }}
            currentLocation={currentLocation}
            destinationLocation={
              routeEnd
                ? { lat: routeEnd[0], lng: routeEnd[1], name: destination }
                : null
            }
            showAllRoutes={true}
            height="440px"
          />

          <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Selected Corridor: <strong className="text-slate-900">
                  {selectedRoute?.name}
                </strong>
              </span>
            </div>

            <button
              onClick={() => selectedRoute && openRouteDetails(selectedRoute)}
              className="text-blue-600 font-bold hover:underline text-xs"
              disabled={!selectedRoute}
            >
              Inspect Safety Breakdown →
            </button>
          </div>
        </div>
      </div>

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
